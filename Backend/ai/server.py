from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
from io import BytesIO
from pipeline import ImageIngestionPipeline
from audio_processor import MomenticMasterMixer

app = FastAPI(title="MyGuestly AI Core Engine")
pipeline = ImageIngestionPipeline()
mixer = MomenticMasterMixer()

class ImagePayload(BaseModel):
    eventId: str
    mediaId: str
    cloudinaryUrl: str
    existingEventHashes: list[str] = []

class SoundtrackItem(BaseModel):
    voiceNoteUrl: str
    instrumentalUrl: str

class CloudMasterMixPayload(BaseModel):
    eventId: str
    voiceNotes: list[SoundtrackItem]

@app.post("/api/process-image")
def process_image(payload: ImagePayload):
    try:
        image_bytes = pipeline.get_image_from_url(payload.cloudinaryUrl)
        if not image_bytes:
            return {"status": "REJECTED", "reason": "Network error or invalid hotlink blocked."}
        
        blurry, score = pipeline.check_blur(image_bytes)
        if blurry:
            return {"status": "REJECTED", "reason": f"Blurry (Score: {score:.2f})"}
            
        p_hash = pipeline.get_perceptual_hash(image_bytes)
        if pipeline.is_duplicate(p_hash, payload.existingEventHashes):
            return {"status": "REJECTED", "reason": "Duplicate file detected"}

        timestamp = pipeline.extract_timestamp(image_bytes)
        tags = []
        if not timestamp:
            tags = pipeline.detect_objects(image_bytes)
            clutch_name = pipeline.map_tags_to_moment(tags)
        else:
            clutch_name = timestamp.strftime("%Y-%m-%d %H:00")

        faces = pipeline.extract_faces(image_bytes)
        
        return {
            "status": "APPROVED",
            "mediaId": payload.mediaId,
            "aiData": {
                "pHash": p_hash,
                "capturedAt": timestamp.isoformat() if timestamp else None,
                "clutchName": clutch_name,
                "tags": tags,
                "facesFound": len(faces),
                "faceEncodings": [enc.tolist() for enc in faces] 
            }
        }
    except Exception as e:
        return {"status": "ERROR", "reason": str(e)}

@app.post("/api/compile-album-soundtrack")
def compile_album_soundtrack(payload: CloudMasterMixPayload):
    """Downloads all cloud tracks down to memory segments and builds the dynamic chronological master mix."""
    print(f"🎛️ Remastering Cloud soundtrack sequence for Event: {payload.eventId}")
    try:
        voice_notes_list = []
        
        for item in payload.voiceNotes:
            voice_res = requests.get(item.voiceNoteUrl, timeout=10)
            inst_res = requests.get(item.instrumentalUrl, timeout=10)
            
            if voice_res.ok and inst_res.ok:
                voice_notes_list.append({
                    "voice_bytes": voice_res.content,
                    "instrumental_bytes": inst_res.content,
                    "raw_voice_bytes": voice_res.content
                })
        
        if not voice_notes_list:
            raise HTTPException(status_code=400, detail="No active cloud audio paths could be successfully retrieved.")
            
        remixed_master_bytes = mixer.compile_dynamic_soundtrack(voice_notes_list)
        return StreamingResponse(BytesIO(remixed_master_bytes), media_type="audio/mpeg")
        
    except Exception as e:
        return {"status": "ERROR", "reason": str(e)}