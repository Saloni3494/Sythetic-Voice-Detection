import asyncio
from pathlib import Path
from fastapi import UploadFile

from app.services.file_service import save_audio_file


class TestUploadFile(UploadFile):
    @property
    def content_type(self):
        return "audio/mp4"


async def test_file_service():
    audio_path = Path("myrec.mp4")

    with open(audio_path, "rb") as audio:
        upload_file = TestUploadFile(
            file=audio,
            filename=audio_path.name
        )

        saved_path = await save_audio_file(upload_file)

        print("File saved successfully!")
        print("Saved path:", saved_path)


asyncio.run(test_file_service())