from app.services.audio_service import get_audio_metadata


file_path = "myrec.wav"

metadata = get_audio_metadata(file_path)

print("Audio metadata:")
print(metadata)