import time
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from config import (
    ALLOWED_IMAGE_EXTENSIONS,
    MAX_IMAGE_SIZE,
    OUTPUT_DIRECTORY,
    MODEL_DIRECTORY,
)
from services.model_manager import ModelManager, ModelNotFoundError, ModelLoadError
from services.image_service import ImageService, ImageProcessingError
from services.detection_service import DetectionService
from schemas.response import (
    ImagePredictionResponse,
    DetectionResult,
    ModelInfo,
)
from utils.validation import validate_image_file
from utils.file_utils import generate_unique_filename

router = APIRouter()

model_manager = ModelManager(MODEL_DIRECTORY)
detection_service = DetectionService()
image_service = ImageService()


@router.get("/models", response_model=list[ModelInfo])
async def list_models():
    models = model_manager.list_models()
    return [
        ModelInfo(
            id=m["id"],
            name=m["name"],
            filename=m["filename"],
            type=m["type"],
        )
        for m in models
    ]


@router.post("/predict/image", response_model=ImagePredictionResponse)
async def predict_image(
    file: UploadFile = File(...),
    model: str = Form(...),
):
    start_time = time.time()

    # Validate file
    error = validate_image_file(file.filename, file.size)
    if error:
        raise HTTPException(status_code=400, detail=error)

    # Read file contents
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_IMAGE_SIZE // (1024*1024)} MB.",
        )

    # Get model
    try:
        yolo_model = model_manager.get_model(model)
    except ModelNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ModelLoadError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Process image
    try:
        result = image_service.process_image(contents, file.filename, yolo_model)
    except ImageProcessingError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Extract detections
    detections = detection_service.extract_detections(result)

    # Save annotated image
    output_filename = generate_unique_filename(file.filename)
    output_path = Path(OUTPUT_DIRECTORY) / "images" / output_filename
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image_service.save_annotated_image(result, str(output_path))

    processing_time = (time.time() - start_time) * 1000

    return ImagePredictionResponse(
        success=True,
        model=model,
        filename=file.filename,
        count=len(detections),
        detections=[
            DetectionResult(
                class_name=d["class"],
                confidence=d["confidence"],
                box=d["box"],
            )
            for d in detections
        ],
        result_url=f"/outputs/images/{output_filename}",
        processing_time_ms=round(processing_time, 2),
    )
