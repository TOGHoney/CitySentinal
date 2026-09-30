import type { AnalyticsData } from "@/types/analytics";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const seed = 88831;
const rng = mulberry32(seed);

export const mockAnalytics: AnalyticsData = {
  zones: Array.from({ length: 16 }, (_, i) => {
    const level = pick(rng, ["low", "low", "moderate", "high", "severe"] as const);
    const densityMap: Record<string, [number, number]> = {
      low: [0.15, 0.35],
      moderate: [0.35, 0.6],
      high: [0.6, 0.8],
      severe: [0.8, 1],
    };
    const [lo, hi] = densityMap[level];
    const density = intBetween(rng, Math.round(lo * 100), Math.round(hi * 100)) / 100;
    return {
      zoneId: `ZN-${String(i + 1).padStart(2, "0")}`,
      name: `Sector ${["A", "B", "C", "D"][i % 4]} ${i + 1}`,
      lat: jitter(rng, BASE_LAT, 0.05),
      lng: jitter(rng, BASE_LNG, 0.05),
      level,
      avgSpeed: Math.round((1 - density) * 60),
      vehicleCount: Math.round(density * 250),
      density,
    };
  }),
  hourly: Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const isPeak = hour >= 8 && hour <= 10 ? true : hour >= 17 && hour <= 20 ? true : false;
    const vehicleCount = isPeak ? intBetween(rng, 1800, 2600) : intBetween(rng, 600, 1500);
    const avgSpeed = isPeak ? intBetween(rng, 18, 30) : intBetween(rng, 34, 50);
    const label = new Date(new Date().setHours(hour, 0, 0, 0)).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { hour: label, vehicleCount, avgSpeed };
  }),
  topRoutes: [
    { routeId: "R-01", routeName: "Central City Loop", avgSpeed: 21, congestionIndex: 0.86, vehicleCount: 3200 },
    { routeId: "R-04", routeName: "Industrial Corridor", avgSpeed: 24, congestionIndex: 0.78, vehicleCount: 2800 },
    { routeId: "R-05", routeName: "West Zone Circular", avgSpeed: 27, congestionIndex: 0.69, vehicleCount: 2400 },
    { routeId: "R-03", routeName: "University Route", avgSpeed: 31, congestionIndex: 0.55, vehicleCount: 1900 },
    { routeId: "R-02", routeName: "Airport Express", avgSpeed: 38, congestionIndex: 0.42, vehicleCount: 1500 },
  ],
  odFlows: [
    { from: "Gandhipuram", to: "Singanallur", volume: 4200 },
    { from: "Gandhipuram", to: "Peelamedu", volume: 3100 },
    { from: "Avinashi Road", to: "Gandhipuram", volume: 3800 },
    { from: "Gandhipuram", to: "Perur", volume: 1600 },
    { from: "Singanallur", to: "Saravanampatti", volume: 2300 },
    { from: "Peelamedu", to: "Airport", volume: 1200 },
    { from: "Trichy Road", to: "Gandhipuram", volume: 2800 },
    { from: "Saravanampatti", to: "Avinashi Road", volume: 2100 },
    { from: "Periyanaicken Palayam", to: "Gandhipuram", volume: 1750 },
    { from: "Race Course", to: "Gandhipuram", volume: 1450 },
  ],
};