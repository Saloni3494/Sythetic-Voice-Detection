from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid
from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from app.utils.validators import validate_audio_file
from app.services.audio_converter import convert_to_wav
from app.services.audio_service import get_audio_metadata
from app.services.prediction_service import predict_audio
from app.services.analysis_service import analyze_audio
from app.database.mongodb import audio_analysis_collection


router = APIRouter()


# Folder where uploaded audio files will be stored
UPLOAD_FOLDER = Path("app/uploads")

UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):

    # -------------------------------
    # 1. Validate uploaded file
    # -------------------------------
    try:
        await validate_audio_file(file)
    except HTTPException:
        raise

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )

    # Get original file extension
    file_extension = Path(file.filename).suffix.lower()

    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    file_path = UPLOAD_FOLDER / unique_filename

    wav_path = None

    try:
        # -------------------------------
        # 2. Save uploaded file
        # -------------------------------
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------
        # 3. Convert to standardized WAV
        # -------------------------------
        wav_path = convert_to_wav(str(file_path))

        # -------------------------------
        # 4. Extract audio metadata
        # -------------------------------
        audio_metadata = get_audio_metadata(wav_path)

        # -------------------------------
        # 5. Get model prediction
        # -------------------------------
        prediction_result = predict_audio(wav_path)

        # -------------------------------
        # 6. Combine analysis result
        # -------------------------------
        analysis_result = analyze_audio(
            audio_metadata,
            prediction_result
        )

        # -------------------------------
        # 7. Create MongoDB document
        # -------------------------------
        analysis_document = {
            "filename": Path(wav_path).name,
            "original_filename": file.filename,
            "file_path": wav_path,

            "audio_info": audio_metadata,

            "prediction": analysis_result["prediction"],
            "confidence": analysis_result["confidence"],

            "analysis": prediction_result.get(
                "analysis",
                {}
            ),

            "created_at": datetime.utcnow()
        }

        # -------------------------------
        # 8. Save analysis to MongoDB
        # -------------------------------
        result = audio_analysis_collection.insert_one(
            analysis_document
        )

        # -------------------------------
        # 9. Return response
        # -------------------------------
        return {
            "message": "Audio uploaded and processed successfully",

            "analysis_id": str(result.inserted_id),

            "filename": Path(wav_path).name,
            "original_filename": file.filename,

            "audio_features": audio_metadata,

            "prediction": prediction_result,

            "analysis": analysis_result
        }

    except HTTPException:
        raise

    except Exception as e:

        # Remove original uploaded file
        if file_path.exists():
            file_path.unlink()

        # Remove converted WAV file
        if wav_path is not None:
            wav_file = Path(wav_path)

            if wav_file.exists() and wav_file != file_path:
                wav_file.unlink()

        raise HTTPException(
            status_code=400,
            detail=f"Unable to process the audio file: {str(e)}"
        )

    finally:
        await file.close()


# ---------------------------------------
# Get analysis by ID
# ---------------------------------------
@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str):

    # Check whether the MongoDB ObjectId is valid
    try:
        object_id = ObjectId(analysis_id)

    except InvalidId:
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis ID"
        )

    # Find the analysis in MongoDB
    analysis = audio_analysis_collection.find_one(
        {"_id": object_id}
    )

    # If no analysis exists
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    # Convert ObjectId to string
    analysis["_id"] = str(analysis["_id"])

    # Convert datetime to JSON-compatible string
    if "created_at" in analysis:
        analysis["created_at"] = analysis["created_at"].isoformat()

    return analysis


# ---------------------------------------
# Get analysis history
# ---------------------------------------
@router.get("/history")
def get_analysis_history(limit: int = 10):

    # Get analyses sorted by newest first
    analyses = list(
        audio_analysis_collection
        .find()
        .sort("created_at", -1)
        .limit(limit)
    )

    # Convert MongoDB values to JSON-compatible values
    for analysis in analyses:

        analysis["_id"] = str(analysis["_id"])

        if "created_at" in analysis:
            analysis["created_at"] = (
                analysis["created_at"].isoformat()
            )

    return {
        "total_analyses": len(analyses),
        "analyses": analyses
    }