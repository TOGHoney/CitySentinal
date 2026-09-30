import type { AppNotification } from "@/types/notification";
import { mulberry32 } from "./seeded";

const seed = 2026609;
const rng = mulberry32(seed);

export function buildNotifications(): AppNotification[] {
  const now = Date.now();
  const base: Array<Omit<AppNotification, "timestamp">> = [
    {
      id: "N-001",
      category: "critical-incident",
      severity: "critical",
      title: "Rash driving detected near Gandhipuram",
      message: "BUS-03-2 detected aggressive overtaking on Avinashi Road.",
      read: false,
      link: { href: "/violations", label: "View violation" },
    },
    {
      id: "N-002",
      category: "violation",
      severity: "critical",
      title: "High-confidence red-light jump (97%)",
      message: "Plate TN 38 12 AB 4521 jumped signal at Brookefields junction.",
      read: false,
    },
    {
      id: "N-003",
      category: "defect",
      severity: "warning",
      title: "Pothole severity threshold crossed",
      message: "Waterlogging on Trichy Road reached critical confidence (92%).",
      read: false,
    },
    {
      id: "N-004",
      category: "investigation",
      severity: "info",
      title: "Investigation search completed",
      message: "4 buses found in Race Course zone between 09:00–10:00.",
      read: true,
      payload: { region: "west" },
    },
    {
      id: "N-005",
      category: "violation",
      severity: "warning",
      title: "No-helmet violations spiking",
      message: "12 no-helmet events recorded on Airport Road in last hour.",
      read: true,
    },
    {
      id: "N-006",
      category: "critical-incident",
      severity: "critical",
      title: "Wrong-way driving on Sathy Road",
      message: "Vehicle travelling against traffic near Lakshmi Mills.",
      read: true,
    },
    {
      id: "N-007",
      category: "defect",
      severity: "warning",
      title: "Missing signboard confirmed",
      message: "Critical signboard missing at dangerous curve, Ward 19.",
      read: true,
    },
    {
      id: "N-008",
      category: "investigation",
      severity: "info",
      title: "Investigation search completed",
      message: "6 buses found in Singanallur zone between 14:00–15:00.",
      read: true,
    },
  ];
  return base.map((n, i) => ({
    ...n,
    timestamp: new Date(now - i * (13 + Math.floor(rng() * 40)) * 60_000).toISOString(),
  }));
}