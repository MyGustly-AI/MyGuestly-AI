import os
import librosa
from io import BytesIO
import numpy as np
from pydub import AudioSegment

class MomenticMasterMixer:
    def __init__(self):
        self.target_sr = 22050

    def clean_audio_noise(self, voice_segment):
        """Removes low-end handling noise and room hiss."""
        return voice_segment.high_pass_filter(80).low_pass_filter(8000)

    def _bytes_to_audio_segment(self, audio_bytes):
        """Decodes compressed audio bytes into a Pydub AudioSegment using Librosa."""
        y, sr = librosa.load(BytesIO(audio_bytes), sr=self.target_sr)
        audio_ints = (y * 32767).astype(np.int16)
        return AudioSegment(
            data=audio_ints.tobytes(),
            sample_width=2,
            frame_rate=self.target_sr,
            channels=1
        )

    def analyze_bpm(self, voice_bytes):
        """Analyzes raw voice bytes to extract the emotional pacing tempo."""
        try:
            y, sr = librosa.load(BytesIO(voice_bytes), sr=self.target_sr)
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            bpm = float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo)
            return bpm if bpm > 0 else 100.0
        except Exception:
            return 100.0

    def compile_dynamic_soundtrack(self, voice_notes_list):
        """
        Creates a cinematic soundtrack by padding background music before/after 
        each voice note, sorting by BPM, and crossfading the instrumentals smoothly.
        """
        compiled_blocks = []
        
        # Set to your 3 seconds padding configuration sweet-spot!
        padding_ms = 3000 

        for item in voice_notes_list:
            try:
                raw_voice = self._bytes_to_audio_segment(item["voice_bytes"])
                instrumental = self._bytes_to_audio_segment(item["instrumental_bytes"])
                
                clean_voice = self.clean_audio_noise(raw_voice)
                voice_len = len(clean_voice)
                
                total_block_len = voice_len + (padding_ms * 2)
                
                ducked_instrumental = instrumental - 18
                if len(ducked_instrumental) > total_block_len:
                    ducked_instrumental = ducked_instrumental[:total_block_len]
                else:
                    padding_needed = total_block_len - len(ducked_instrumental)
                    ducked_instrumental = ducked_instrumental + AudioSegment.silent(duration=padding_needed, frame_rate=self.target_sr)
                
                front_silence = AudioSegment.silent(duration=padding_ms, frame_rate=self.target_sr)
                back_silence = AudioSegment.silent(duration=padding_ms, frame_rate=self.target_sr)
                padded_voice = front_silence + clean_voice + back_silence
                
                mixed_block = ducked_instrumental.overlay(padded_voice)
                bpm_score = self.analyze_bpm(item["raw_voice_bytes"])
                
                compiled_blocks.append({
                    "bpm": bpm_score,
                    "audio_segment": mixed_block
                })
            except Exception as e:
                print(f"⚠️ Skipping block segment: {e}")
                continue

        if not compiled_blocks:
            raise Exception("No valid audio blocks could be processed.")

        compiled_blocks.sort(key=lambda x: x["bpm"])

        master_soundscape = compiled_blocks[0]["audio_segment"]
        for next_block in compiled_blocks[1:]:
            master_soundscape = master_soundscape.append(next_block["audio_segment"], crossfade=2000)

        # Production Output: High performance MP3 formatting stream
        output_buffer = BytesIO()
        master_soundscape.export(output_buffer, format="mp3", bitrate="128k")
        return output_buffer.getvalue()