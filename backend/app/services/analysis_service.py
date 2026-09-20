from typing import Optional


def analyze_audio(
    audio_metadata: dict,
    prediction: Optional[dict] = None
) -> dict:
    """
    Combine audio metadata and model prediction
    into a single analysis result.
    """

    result = {
        "model": "PartialSpoof",
        "audio": audio_metadata,
        "prediction": None,
        "confidence": None,
    }

    # Add prediction details if available
    if prediction is not None:
        result["prediction"] = prediction.get("prediction")
        result["confidence"] = prediction.get("confidence")

    return result