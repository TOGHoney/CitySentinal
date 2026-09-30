export type NotificationCategory =
  | "critical-incident"
  | "violation"
  | "defect"
  | "investigation";

export type NotificationSeverity = "info" | "warning" | "critical";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: {
    href: string;
    label: string;
  };
  payload?: Record<string, unknown>;
}

export interface NotificationSettings {
  criticalIncident: boolean;
  violation: boolean;
  defect: boolean;
  investigation: boolean;
}