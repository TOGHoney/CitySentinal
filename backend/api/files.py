from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

from config import OUTPUT_DIRECTORY

router = APIRouter()


@router.get("/results/{filename}")
async def get_result(filename: str):
    # Prevent directory traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Search in images and videos subdirectories
    for subdir in ["images", "videos"]:
        file_path = Path(OUTPUT_DIRECTORY) / subdir / filename
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))

    raise HTTPException(status_code=404, detail="Result file not found")
