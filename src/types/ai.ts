export interface ModelInfo {
  id: string;
  name: string;
  filename: string;
  type: string;
}

export interface DetectionResult {
  class_name: string;
  confidence: number;
  box: [number, number, number, number];
}

export interface ImagePredictionResponse {
  success: boolean;
  model: string;
  filename: string;
  count: number;
  detections: DetectionResult[];
  result_url: string;
  processing_time_ms: number;
}
