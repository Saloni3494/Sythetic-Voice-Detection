from app.services.file_service import save_audio_file
from app.services.audio_converter import convert_to_wav
from app.services.audio_service import get_audio_metadata
from app.services.analysis_service import analyze_audio


class TestUploadFile:
    def __init__(self, filename, content_type):
        self.filename = filename
        self.content_type = content_type

    async def read(self):
        with open(self.filename, "rb") as file:
            return file.read()

    async def seek(self, position):
        pass


async def main():

    # 1. Upload / save audio file
    input_file = TestUploadFile(
        "myrec.mp4",
        "video/mp4"
    )

    saved_path = await save_audio_file(input_file)

    print("1. File saved:")
    print(saved_path)

    # 2. Convert to WAV
    wav_path = convert_to_wav(saved_path)

    print("\n2. WAV conversion:")
    print(wav_path)

    # 3. Extract audio metadata
    audio_metadata = get_audio_metadata(wav_path)

    print("\n3. Audio information:")
    print("Duration:", audio_metadata["duration"], "seconds")
    print("Sample Rate:", audio_metadata["sample_rate"], "Hz")
    print("Channels:", audio_metadata["channels"])
    print("Format:", audio_metadata["format"])
    print("Subtype:", audio_metadata["subtype"])

    # 4. Temporary prediction
    prediction = {
        "prediction": "synthetic",
        "confidence": 0.92
    }

    # 5. Generate final analysis
    result = analyze_audio(
        audio_metadata,
        prediction
    )

    print("\n4. Final analysis:")
    print("Model:", result["model"])
    print("Prediction:", result["prediction"])
    print("Confidence:", result["confidence"])


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())