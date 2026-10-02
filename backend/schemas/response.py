from pydantic import BaseModel


class DetectionResult(BaseModel):
    class_name: str
    confidence: float
    box: list[int]  # [x1, y1, x2, y2]


class ImagePredictionResponse(BaseModel):
    success: bool
    model: str
    filename: str
    count: int
    detections: list[DetectionResult]
    result_url: str
    processing_time_ms: float


class ModelInfo(BaseModel):
    id: str
    name: str
    filename: str
    type: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict
