import logging

logger = logging.getLogger(__name__)


class DetectionService:
    """Converts raw YOLO output to application-level detection objects."""

    def extract_detections(self, result) -> list[dict]:
        """
        Extract detections from a YOLO result object.

        Returns a list of dicts with:
        - class: str (class name)
        - confidence: float (0-1)
        - box: [x1, y1, x2, y2] (pixel coordinates)
        """
        detections = []

        if result.boxes is None or len(result.boxes) == 0:
            return detections

        boxes = result.boxes
        names = result.names

        for i in range(len(boxes)):
            box = boxes[i]
            class_id = int(box.cls[0].item())
            confidence = float(box.conf[0].item())
            class_name = names.get(class_id, f"class_{class_id}")

            # xyxy format: [x1, y1, x2, x2]
            xyxy = box.xyxy[0].tolist()

            detections.append(
                {
                    "class": class_name,
                    "confidence": round(confidence, 4),
                    "box": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                }
            )

        # Sort by confidence descending
        detections.sort(key=lambda d: d["confidence"], reverse=True)

        logger.info(f"Extracted {len(detections)} detections")
        return detections
