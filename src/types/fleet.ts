export type BusStatus = "normal" | "minor" | "critical";

export type BusCameraPosition = "front" | "rear" | "left" | "right";

export interface BusCamera {
  position: BusCameraPosition;
  url: string;
  online: boolean;
}

export interface BusAlert {
  type: string;
  severity: "minor" | "critical";
  message: string;
  timestamp: string;
}

export interface Bus {
  id: string;
  vehicleNumber: string;
  routeId: string;
  routeName: string;
  driverName: string;
  lat: number;
  lng: number;
  speed: number;
  status: BusStatus;
  heading: number;
  lastAlertAt: string | null;
  cameras: BusCamera[];
}

export interface FleetStreamEvent {
  type: "position" | "alert";
  busId: string;
  lat?: number;
  lng?: number;
  speed?: number;
  heading?: number;
  status?: BusStatus;
  alert?: BusAlert;
}

export interface FleetStats {
  total: number;
  normal: number;
  minor: number;
  critical: number;
  avgSpeed: number;
}

export interface AlertThreshold {
  rule: string;
  value: number;
  severity: "minor" | "critical";
}