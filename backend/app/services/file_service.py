from pathlib import Path
from fastapi import UploadFile

from app.utils.validators import validate_audio_file


UPLOAD_DIR = Path("uploads")


async def save_audio_file(file: UploadFile) -> str:
    # Validate the uploaded audio file
    await validate_audio_file(file)

    # Create uploads directory if it does not exist
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    # Create the file path
    file_path = UPLOAD_DIR / file.filename

    # Save the uploaded file
    contents = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    # Return the saved file path
    return str(file_path)