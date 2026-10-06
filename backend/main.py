from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import CORS_ORIGINS, CORS_ORIGIN_REGEX, OUTPUT_DIRECTORY
from api import health, inference, files

app = FastAPI(
    title="CitySentinal AI Backend",
    description="YOLO-based detection API for pothole, helmet, and traffic detection.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(inference.router, prefix="/api", tags=["inference"])
app.include_router(files.router, prefix="/api", tags=["files"])

app.mount("/outputs", StaticFiles(directory=OUTPUT_DIRECTORY), name="outputs")


@app.get("/")
async def root():
    return {"message": "CitySentinal AI Backend is running. Visit /docs for API documentation."}
