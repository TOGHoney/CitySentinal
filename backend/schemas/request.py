from pydantic import BaseModel


class ImagePredictRequest(BaseModel):
    model: str
