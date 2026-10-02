import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class ModelNotFoundError(Exception):
    pass


class ModelLoadError(Exception):
    pass


class ModelManager:
    """Manages YOLO model loading and caching.

    Scans the model directory for .pt files dynamically.
    Model ID is the filename without extension (e.g., "pothole_best" -> "pothole_best").
    """

    def __init__(self, model_directory: str):
        self.model_directory = Path(model_directory)
        self._cache: dict[str, object] = {}

    def _scan_models(self) -> dict[str, dict]:
        """Scan the model directory for .pt files."""
        models = {}
        if not self.model_directory.exists():
            return models

        for file in self.model_directory.glob("*.pt"):
            model_id = file.stem  # filename without extension
            models[model_id] = {
                "file": file.name,
                "name": self._format_name(model_id),
                "type": "yolo",
            }

        return models

    def _format_name(self, model_id: str) -> str:
        """Convert model_id to a human-readable name.

        Examples:
            pothole_best -> Pothole Best
            helmet_detection -> Helmet Detection
            traffic -> Traffic
        """
        parts = model_id.replace("-", "_").split("_")
        return " ".join(p.capitalize() for p in parts)

    def list_models(self) -> list[dict]:
        """Return metadata for all discovered models."""
        models = self._scan_models()
        return [
            {
                "id": key,
                "name": value["name"],
                "filename": value["file"],
                "type": value["type"],
            }
            for key, value in sorted(models.items())
        ]

    def get_model(self, model_id: str):
        """Get a loaded YOLO model, loading it if necessary."""
        available = self._scan_models()

        if model_id not in available:
            model_ids = ", ".join(sorted(available.keys())) if available else "none"
            raise ModelNotFoundError(
                f"Model '{model_id}' not found. Available models: {model_ids}"
            )

        if model_id in self._cache:
            return self._cache[model_id]

        model_info = available[model_id]
        model_path = self.model_directory / model_info["file"]

        if not model_path.exists():
            raise ModelLoadError(
                f"Model file not found: {model_path}. "
                f"Please place '{model_info['file']}' in the models directory."
            )

        try:
            from ultralytics import YOLO

            logger.info(f"Loading YOLO model: {model_path}")
            model = YOLO(str(model_path))
            self._cache[model_id] = model
            logger.info(f"Model '{model_id}' loaded successfully")
            return model
        except Exception as e:
            raise ModelLoadError(f"Failed to load model '{model_id}': {str(e)}")
