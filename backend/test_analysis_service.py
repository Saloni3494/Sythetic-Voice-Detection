from app.services.analysis_service import analyze_audio


audio_metadata = {
    "duration": 1.96,
    "sample_rate": 44100,
    "channels": 1,
    "format": "WAV",
    "subtype": "PCM_16"
}

prediction = {
    "prediction": "synthetic",
    "confidence": 0.92
}


result = analyze_audio(
    audio_metadata,
    prediction
)

print("Analysis Result:")
print("Model:", result["model"])
print("Prediction:", result["prediction"])
print("Confidence:", result["confidence"])

print("\nAudio Information:")
print("Duration:", result["audio"]["duration"], "seconds")
print("Sample Rate:", result["audio"]["sample_rate"], "Hz")
print("Channels:", result["audio"]["channels"])
print("Format:", result["audio"]["format"])
print("Subtype:", result["audio"]["subtype"])