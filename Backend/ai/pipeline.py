import face_recognition
import cv2
import os
import imagehash
from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime
from ultralytics import YOLO  # NEW: Import YOLO
import requests
import numpy as np
from io import BytesIO

class ImageIngestionPipeline:
    def __init__(self, blur_threshold=1.0, duplicate_threshold=4):
        self.blur_threshold = blur_threshold
        self.duplicate_threshold = duplicate_threshold
        # NEW: Load the ultra-lightweight YOLOv8 Nano model
        # (This will auto-download a small ~6MB file the very first time you run it)
        self.model = YOLO('yolov8n.pt')

    def map_tags_to_moment(self, tags):
        """Translates raw YOLO objects into clean Event Moments."""
        if not tags:
            return "Candid Moments 📸"
            
        # Combine all tags into a single string for easy keyword checking
        tags_str = " ".join(tags).lower()
        
        # Rule-based routing for Nigerian weddings
        if any(word in tags_str for word in ["cake", "wine glass", "dining table", "pizza", "bowl"]):
            return "Reception & Item 7 🍽️"
        elif any(word in tags_str for word in ["tie", "suit", "church", "bench"]):
            return "The Ceremony ⛪"
        elif "person" in tags_str and ("cup" in tags_str or "bottle" in tags_str):
            return "Guest Mingling 🥂"
        elif "person" in tags_str:
            return "Portraits & People 👥"
        else:
            return "Candid Moments 📸"
        
    def get_image_from_url(self, url):
        """Downloads the image into memory, bypassing basic hotlink blocks."""
        # Fake a real Google Chrome browser header
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            # CRITICAL GUARD: Check if the link actually returned an image
            content_type = response.headers.get("Content-Type", "")
            if "image" not in content_type:
                print(f"⚠️ Hotlink Guard: URL returned '{content_type}' instead of an image file.")
                return b"" # Return empty bytes to trigger our blur/safety rejection
                
            return response.content
        except Exception as e:
            print(f"❌ Failed to fetch URL: {e}")
            return b""

    def check_blur(self, image_bytes):
        """Calculates blur directly from memory bytes."""
        # SAFEY GUARD: If the URL is broken or empty, stop immediately
        if not image_bytes or len(image_bytes) == 0:
            return True, 0
            
        image_array = np.asarray(bytearray(image_bytes), dtype=np.uint8)
        
        # Double check the numpy array isn't empty
        if image_array.size == 0:
            return True, 0
            
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if image is None:
            return True, 0
            
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        return variance < self.blur_threshold, variance

    def get_perceptual_hash(self, image_bytes):
        """Generates pHash from memory bytes."""
        img = Image.open(BytesIO(image_bytes))
        return str(imagehash.phash(img))

    def is_duplicate(self, new_hash_str, existing_hashes):
        """Compares hashes using Hamming distance to spot matches."""
        if not existing_hashes:
            return False
        new_hash = imagehash.hex_to_hash(new_hash_str)
        for old_hash_str in existing_hashes:
            old_hash = imagehash.hex_to_hash(old_hash_str)
            if (new_hash - old_hash) <= self.duplicate_threshold:
                return True
        return False

    def extract_timestamp(self, image_bytes):
        """Extracts the original capture time from EXIF metadata."""
        try:
            # FIXED: Wrap the raw bytes in BytesIO so PIL can read it
            img = Image.open(BytesIO(image_bytes))
            exif_data = img._getexif()
            if not exif_data:
                return None
            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, tag_id)
                if tag_name == 'DateTimeOriginal':
                    return datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
        except Exception:
            return None
        return None

    # NEW LAYER: Object Detection
    def detect_objects(self, image_bytes, confidence_threshold=0.5):
        """Runs YOLOv8 to find objects and returns a list of unique tags."""
        # NEW: Convert the raw bytes into a PIL Image that YOLO can read
        img = Image.open(BytesIO(image_bytes))
        
        # Run inference on the formatted image
        results = self.model(img, verbose=False) 
        
        detected_tags = set()
        
        for box in results[0].boxes:
            if box.conf[0].item() > confidence_threshold:
                class_id = int(box.cls[0].item())
                object_name = self.model.names[class_id]
                detected_tags.add(object_name)
                
        return list(detected_tags)

    def extract_faces(self, image_bytes):
        """Finds faces and translates them into a 128-number mathematical fingerprint."""
        try:
            # NEW: Wrap the bytes in BytesIO so it acts like a file
            image = face_recognition.load_image_file(BytesIO(image_bytes))
            
            face_locations = face_recognition.face_locations(image, model="hog")
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            return face_encodings
        except Exception as e:
            print(f"Face extraction failed: {e}")
            return []
        

    def process_upload(self, incoming_path, existing_hashes):
        """Executes the pipeline and aggregates findings."""
        blurry, score = self.check_blur(incoming_path)
        if blurry:
            return {"status": "rejected", "reason": f"Blurry (Score: {score:.2f})"}

        try:
            p_hash = self.get_perceptual_hash(incoming_path)
        except Exception as e:
            return {"status": "rejected", "reason": f"Corrupted file: {e}"}

        if self.is_duplicate(p_hash, existing_hashes):
            return {"status": "rejected", "reason": "Duplicate file detected"}

        timestamp = self.extract_timestamp(incoming_path)
        
        # NEW: If there is no timestamp, run Object Detection!
        tags = []
        if not timestamp:
            tags = self.detect_objects(incoming_path)
        
        # NEW: Extract face fingerprints if the image was approved
        face_fingerprints = self.extract_faces(incoming_path)
        
        return {
            "status": "approved",
            "p_hash": p_hash,
            "timestamp": timestamp,
            "tags": tags,
            "faces": face_fingerprints # Add the fingerprints to our output
        }