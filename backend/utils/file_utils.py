import uuid
from pathlib import Path


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename preserving the original extension."""
    ext = Path(original_filename).suffix
    return f"{uuid.uuid4().hex}{ext}"


def cleanup_temp_file(filepath: str):
    """Safely delete a temporary file if it exists."""
    try:
        path = Path(filepath)
        if path.exists():
            path.unlink()
    except Exception:
        pass
