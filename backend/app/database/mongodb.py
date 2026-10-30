import os

from dotenv import load_dotenv
from pymongo import MongoClient


# Load environment variables from .env
load_dotenv()


# Get MongoDB connection details
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "synthetic_speech_detection"
)


# Create MongoDB client with timeout to prevent hanging if MongoDB is not reachable
client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2500)


# Connect to our database
database = client[DATABASE_NAME]
audio_analysis_collection = database["audio_analysis"]
