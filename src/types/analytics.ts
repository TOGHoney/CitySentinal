export type CongestionLevel = "low" | "moderate" | "high" | "severe";

export interface CongestionZone {
  zoneId: string;
  name: string;
  lat: number;
  lng: number;
  level: CongestionLevel;
  avgSpeed: number;
  vehicleCount: number;
  density: number;
}

export interface HourlyTrafficPoint {
  hour: string;
  vehicleCount: number;
  avgSpeed: number;
}

export interface RouteCongestion {
  routeId: string;
  routeName: string;
  avgSpeed: number;
  congestionIndex: number;
  vehicleCount: number;
}

export interface ODFlowLink {
  from: string;
  to: string;
  volume: number;
}

export interface AnalyticsData {
  zones: CongestionZone[];
  hourly: HourlyTrafficPoint[];
  topRoutes: RouteCongestion[];
  odFlows: ODFlowLink[];
}

export interface AnalyticsRange {
  from: string;
  to: string;
  label: string;
}