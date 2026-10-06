import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# Vercel serverless functions have a read-only filesystem except /tmp.
# Keep models bundled with the code, but write outputs/temp to /tmp there.
IS_SERVERLESS = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
STATE_DIR = Path(os.getenv("STATE_DIRECTORY", "/tmp/citysentinal" if IS_SERVERLESS else str(BASE_DIR)))

MODEL_DIRECTORY = os.getenv("MODEL_DIRECTORY", str(BASE_DIR / "models"))
OUTPUT_DIRECTORY = os.getenv("OUTPUT_DIRECTORY", str(STATE_DIR / "outputs"))
TEMP_DIRECTORY = os.getenv("TEMP_DIRECTORY", str(STATE_DIR / "temp"))

MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE", 10 * 1024 * 1024))  # 10 MB
MAX_VIDEO_SIZE = int(os.getenv("MAX_VIDEO_SIZE", 100 * 1024 * 1024))  # 100 MB

CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.25))

CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", "http://localhost:3000,http://localhost:3001"
).split(",")

# Optional regex for preview deployments, e.g. r"https://.*\.vercel\.app"
CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX") or None

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}

for directory in [MODEL_DIRECTORY, OUTPUT_DIRECTORY, TEMP_DIRECTORY]:
    Path(directory).mkdir(parents=True, exist_ok=True)
