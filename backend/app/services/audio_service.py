import librosa
import soundfile as sf


def get_audio_metadata(file_path: str) -> dict:
    # Load audio information
    audio, sample_rate = librosa.load(
        file_path,
        sr=None,
        mono=False
    )

    # Get audio information
    duration = librosa.get_duration(
        y=audio,
        sr=sample_rate
    )

    # Get number of channels
    if audio.ndim == 1:
        channels = 1
    else:
        channels = audio.shape[0]

    # Get detailed file information using SoundFile
    info = sf.info(file_path)

    return {
        "duration": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "format": info.format,
        "subtype": info.subtype
    }