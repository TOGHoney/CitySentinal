import type { Bus, FleetStats } from "@/types/fleet";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const ROUTES = [
  { id: "R-01", name: "Central City Loop", lat: BASE_LAT, lng: BASE_LNG, offset: 0.01 },
  { id: "R-02", name: "Airport Express", lat: BASE_LAT + 0.012, lng: BASE_LNG - 0.015, offset: 0.014 },
  { id: "R-03", name: "University Route", lat: BASE_LAT - 0.009, lng: BASE_LNG + 0.012, offset: 0.011 },
  { id: "R-04", name: "Industrial Corridor", lat: BASE_LAT + 0.006, lng: BASE_LNG + 0.014, offset: 0.012 },
  { id: "R-05", name: "West Zone Circular", lat: BASE_LAT - 0.014, lng: BASE_LNG - 0.01, offset: 0.013 },
];

const DRIVER_NAMES = [
  "K. Vasudevan",
  "S. Murugan",
  "R. Kumaravel",
  "P. Senthil",
  "M. Arunachalam",
  "T. Prakash",
  "V. Ganesan",
  "A. Mahesh",
];

const CAMERA_POSITIONS = ["front", "rear", "left", "right"] as const;

function busCameras() {
  return CAMERA_POSITIONS.map((position) => ({
    position,
    url: `https://picsum.photos/seed/bus-${position}/320/180`,
    online: true,
  }));
}

const seed = 20260907;
const rng = mulberry32(seed);

export const mockBuses: Bus[] = ROUTES.flatMap((route, rIdx) => {
  const count = rIdx === 0 ? 4 : 2;
  return Array.from({ length: count }, (_, i) => {
    const status = pick(rng, ["normal", "normal", "normal", "minor", "critical"] as const);
    const speed = status === "normal" ? intBetween(rng, 25, 48) : intBetween(rng, 8, 55);
    return {
      id: `BUS-${String(rIdx + 1).padStart(2, "0")}-${i + 1}`,
      vehicleNumber: `TN 38 ${intBetween(rng, 1000, 9999)}`,
      routeId: route.id,
      routeName: route.name,
      driverName: pick(rng, DRIVER_NAMES),
      lat: jitter(rng, route.lat, route.offset),
      lng: jitter(rng, route.lng, route.offset),
      speed,
      status,
      heading: intBetween(rng, 0, 359),
      lastAlertAt: status === "normal" ? null : new Date(Date.now() - intBetween(rng, 2, 40) * 60_000).toISOString(),
      cameras: busCameras(),
    } satisfies Bus;
  });
});

export const mockFleetStats: FleetStats = {
  total: mockBuses.length,
  normal: mockBuses.filter((b) => b.status === "normal").length,
  minor: mockBuses.filter((b) => b.status === "minor").length,
  critical: mockBuses.filter((b) => b.status === "critical").length,
  avgSpeed: Math.round(mockBuses.reduce((acc, b) => acc + b.speed, 0) / mockBuses.length),
};