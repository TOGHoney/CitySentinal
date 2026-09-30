export type DefectType =
  | "pothole"
  | "damaged-road"
  | "missing-signboard"
  | "missing-crossing"
  | "waterlogging";

export type DefectStatus = "open" | "resolved" | "in-review";

export interface Defect {
  id: string;
  type: DefectType;
  lat: number;
  lng: number;
  ward: string;
  zone: string;
  busId: string;
  imageUrl: string;
  confidence: number;
  detectedAt: string;
  status: DefectStatus;
  description?: string;
}

export interface DefectFilters {
  type: DefectType | "all";
  status: DefectStatus | "all";
  ward?: string;
  from?: string;
  to?: string;
}

export interface DefectStats {
  total: number;
  open: number;
  resolved: number;
  critical: number;
  byType: Record<DefectType, number>;
}