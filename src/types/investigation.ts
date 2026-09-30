export interface GeoBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface InvestigationSearchParams {
  bbox: GeoBounds;
  from: string;
  to: string;
  vehicleNumber?: string;
  routeId?: string;
}

export interface BusFootageResult {
  busId: string;
  vehicleNumber: string;
  routeId: string;
  routeName: string;
  enteredAt: string;
  exitedAt: string;
  camerasAvailable: BusCameraInfo[];
  durationInZoneSec: number;
}

export interface BusCameraInfo {
  position: string;
  url: string;
  online: boolean;
}

export interface FootageClipRequest {
  busId: string;
  from: string;
  to: string;
  cameras: string[];
}

export interface ClipRequestResponse {
  clipId: string;
  signedUrl: string;
  expiresAt: string;
}

export interface CaseClip {
  id: string;
  busId: string;
  vehicleNumber: string;
  title: string;
  notes: string;
  tags: string[];
  from: string;
  to: string;
  cameras: string[];
}

export interface InvestigationCase {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  searchParams: InvestigationSearchParams;
  clips: CaseClip[];
  notes: string;
}