from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import os
import shutil
from pathlib import Path

# The app is run from the `backend` directory based on the path
import sys
backend_dir = Path(__file__).parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

from ai_engine.inference import predict

router = APIRouter()

WEIGHTS_PATH = backend_dir / "ai_engine" / "weights" / "best.pt"

@router.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    suffix = Path(file.filename).suffix
    
    # Create a temporary file
    fd, temp_file_path = tempfile.mkstemp(suffix=suffix)
    try:
        # We need to use fd to ensure proper closure, or close it and open normally
        os.close(fd)
        
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run prediction
        try:
            is_ai_generated, spoof_probability, segments = predict(temp_file_path, str(WEIGHTS_PATH))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")
            
        return {
            "is_ai_generated": is_ai_generated,
            "spoof_probability": spoof_probability,
            "segments": segments
        }
        
    finally:
        await file.close()
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                print(f"Warning: Failed to delete temporary file {temp_file_path}: {e}")
