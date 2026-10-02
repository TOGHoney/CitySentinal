import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIRECTORY = os.getenv("MODEL_DIRECTORY", str(BASE_DIR / "models"))
OUTPUT_DIRECTORY = os.getenv("OUTPUT_DIRECTORY", str(BASE_DIR / "outputs"))
TEMP_DIRECTORY = os.getenv("TEMP_DIRECTORY", str(BASE_DIR / "temp"))

MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10 * 1024 * 1024))  # 10 MB
MAX_VIDEO_SIZE = int(os.getenv("MAX_VIDEO_SIZE", 100 * 1024 * 1024))  # 100 MB

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.25))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}

for directory in [MODEL_DIRECTORY, OUTPUT_DIRECTORY, TEMP_DIRECTORY]:
    Path(directory).mkdir(parents=True, exist_ok=True)
