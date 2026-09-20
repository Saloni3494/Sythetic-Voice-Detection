from pathlib import Path


MODEL_NAME = "PartialSpoof"
MODEL_FEATURE_TYPE = "logmel"
MODEL_EMBEDDING_DIM = 128
MODEL_BASE_CHANNELS = 32

MODEL_PATH = Path("models/partialspoof_epoch7.pth")


def load_model():
    raise NotImplementedError(
        "PartialSpoof model checkpoint and architecture are required."
    )


def prepare_input(file_path: str):
    raise NotImplementedError(
        "Exact Log-Mel preprocessing parameters are required."
    )


def predict(file_path: str) -> dict:
    model_input = prepare_input(file_path)
    model = load_model()

    return {
        "model": MODEL_NAME,
        "feature_type": MODEL_FEATURE_TYPE,
        "prediction": None,
        "confidence": None,
    }


def predict_audio(file_path: str):
    """
    Placeholder prediction function.

    This will later be replaced with the actual
    trained CNN model prediction logic.
    """

    return {
        "prediction": "pending_model",
        "confidence": None,
        "analysis": {
            "human_probability": None,
            "synthetic_probability": None,
            "mixed_audio_probability": None
        },
        "message": "Audio processed successfully. Trained model prediction is pending."
    }