from pathlib import Path
import subprocess


def convert_to_wav(file_path: str) -> str:
    """
    Convert an audio/video file to WAV format using FFmpeg.

    The output is standardized to:
    - 16000 Hz sample rate
    - Mono
    - PCM 16-bit
    """

    input_path = Path(file_path)

    # Create output filename
    output_path = input_path.with_suffix(".wav")

    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        str(output_path),
    ]

    try:
        subprocess.run(
            command,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

    except FileNotFoundError:
        raise RuntimeError(
            "FFmpeg is not installed or is not available in PATH."
        )

    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"Audio conversion failed:\n{e.stderr}"
        )

    return str(output_path)