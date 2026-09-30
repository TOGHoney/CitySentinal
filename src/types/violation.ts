export type ViolationType =
  | "overspeeding"
  | "wrong-way"
  | "no-helmet"
  | "red-light-jump"
  | "rash-driving";

export type ChallanStatus = "pending" | "issued" | "disputed";

export interface ANPRResult {
  plateNumber: string;
  confidence: number;
}

export interface VehicleSnapshot {
  imageUrl: string;
  plateCropUrl: string;
}

export interface Violation {
  id: string;
  type: ViolationType;
  busId: string;
  vehicleSnapshot: VehicleSnapshot;
  anpr: ANPRResult;
  lat: number;
  lng: number;
  locationLabel: string;
  detectedAt: string;
  evidenceVideoUrl?: string;
}

export interface ChallanReference {
  id: string;
  violationId: string;
  applicationId: string;
  eChallanUrl?: string;
  plateNumber: string;
  violationType: ViolationType;
  lat: number;
  lng: number;
  locationLabel: string;
  detectedAt: string;
  busId: string;
  confidence: number;
  status: ChallanStatus;
  createdAt: string;
}

export interface GenerateChallanResponse {
  success: boolean;
  reference: ChallanReference;
}

export interface ViolationFilters {
  type: ViolationType | "all";
  from?: string;
  to?: string;
  zone?: string;
}

export interface ChallanFilters {
  status: ChallanStatus | "all";
  type: ViolationType | "all";
  from?: string;
  to?: string;
  zone?: string;
}

export interface FineRule {
  violationType: ViolationType;
  label: string;
  fineAmount: number;
  description: string;
}