from app.services.audio_converter import convert_to_wav


file_path = "myrec.mp4"

converted_path = convert_to_wav(file_path)

print("Converted file:")
print(converted_path)