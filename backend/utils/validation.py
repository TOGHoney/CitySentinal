from pathlib import Path
from config import ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS


def validate_image_file(filename: str, size: int) -> str | None:
    """
    Validate an uploaded image file.
    Returns an error message string if invalid, None if valid.
    """
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        allowed = ", ".join(ALLOWED_IMAGE_EXTENSIONS)
        return f"Unsupported file format '{ext}'. Allowed: {allowed}"

    return None


def validate_video_file(filename: str, size: int) -> str | None:
    """
    Validate an uploaded video file.
    Returns an error message string if invalid, None if valid.
    """
    ext = Path(filename).suffix.lower()

    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        allowed = ", ".join(ALLOWED_VIDEO_EXTENSIONS)
        return f"Unsupported file format '{ext}'. Allowed: {allowed}"

    return None
