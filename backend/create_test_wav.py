import wave
import math
import struct

sample_rate = 44100
duration = 2
frequency = 440

with wave.open("test_audio.wav", "w") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)

    for i in range(sample_rate * duration):
        value = int(32767 * math.sin(2 * math.pi * frequency * i / sample_rate))
        wav.writeframes(struct.pack("<h", value))

print("test_audio.wav created successfully")