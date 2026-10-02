import io
import logging
from pathlib import Path

import cv2
import numpy as np

logger = logging.getLogger(__name__)


class ImageProcessingError(Exception):
    pass


class ImageService:
    """Handles image decoding, inference, and annotation."""

    def process_image(
        self, image_bytes: bytes, filename: str, yolo_model
    ):
        """
        Decode image bytes, run YOLO inference, and return the result.

        Args:
            image_bytes: Raw image file bytes
            filename: Original filename (for logging)
            yolo_model: Loaded YOLO model

        Returns:
            YOLO result object
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                raise ImageProcessingError(
                    f"Could not decode image: {filename}. Ensure it is a valid image file."
                )

            logger.info(f"Processing image: {filename} ({image.shape[1]}x{image.shape[0]})")

            # Run inference
            results = yolo_model(image, verbose=False)

            if not results:
                raise ImageProcessingError("Inference returned no results")

            return results[0]

        except ImageProcessingError:
            raise
        except Exception as e:
            raise ImageProcessingError(f"Error processing image: {str(e)}")

    def save_annotated_image(self, result, output_path: str):
        """Save the annotated image (with bounding boxes) to disk."""
        try:
            annotated = result.plot()
            cv2.imwrite(output_path, annotated)
            logger.info(f"Annotated image saved to: {output_path}")
        except Exception as e:
            logger.error(f"Failed to save annotated image: {str(e)}")
            raise
