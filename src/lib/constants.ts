import type { DefectType } from "@/types/defect";
import type { ViolationType } from "@/types/violation";
import type { CongestionLevel } from "@/types/analytics";
import type { NotificationCategory } from "@/types/notification";

export const VIOLATION_LABELS: Record<ViolationType, string> = {
  overspeeding: "Overspeeding",
  "wrong-way": "Wrong-Way Driving",
  "no-helmet": "No Helmet",
  "red-light-jump": "Red-Light Jump",
  "rash-driving": "Rash Driving / Dangerous Overtaking",
};

export const VIOLATION_FINE_AMOUNTS: Record<ViolationType, number> = {
  overspeeding: 2000,
  "wrong-way": 1500,
  "no-helmet": 1000,
  "red-light-jump": 2000,
  "rash-driving": 3000,
};

export const DEFECT_LABELS: Record<DefectType, string> = {
  pothole: "Pothole",
  "damaged-road": "Damaged Road",
  "missing-signboard": "Missing Signboard",
  "missing-crossing": "Missing Zebra Crossing",
  waterlogging: "Waterlogging",
};

export const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe",
};

export const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  low: "#22c55e",
  moderate: "#facc15",
  high: "#f97316",
  severe: "#ef4444",
};

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  "critical-incident": "Critical Incidents",
  violation: "High-Confidence Violations",
  defect: "Road Defects",
  investigation: "Investigation Searches",
};

export const COMPANY_NAME = "CitySentinel";
export const APP_TAGLINE = "AI-Powered Urban Intelligence";