import type { BusFootageResult, InvestigationCase } from "@/types/investigation";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const seed = 556677;
const rng = mulberry32(seed);

const HLS_SAMPLE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function buildCameras(busId: string) {
  return ["front", "rear", "left", "right"].map((position) => ({
    position,
    url: HLS_SAMPLE,
    online: true,
  }));
}

export function buildFootageResults(vehicleNumberFilter?: string): BusFootageResult[] {
  const buses = Array.from({ length: 6 }, (_, i) => {
    const vehicleNumber = `TN 38 ${intBetween(rng, 1000, 9999)}`;
    return {
      busId: `BUS-0${i + 1}-1`,
      vehicleNumber,
      routeId: `R-0${i + 1}`,
      routeName: ["Central City Loop", "Airport Express", "University Route", "Industrial Corridor", "West Zone Circular"][i],
    };
  });
  const filtered = vehicleNumberFilter
    ? buses.filter((b) => b.vehicleNumber.includes(vehicleNumberFilter.toUpperCase()))
    : buses;
  const baseFrom = new Date();
  baseFrom.setHours(baseFrom.getHours() - 3);
  return filtered.slice(0, 4).map((bus, i) => {
    const enteredAt = new Date(baseFrom.getTime() + i * 7 * 60_000).toISOString();
    const enteredAtPlus = new Date(baseFrom.getTime() + (i * 7 + intBetween(rng, 4, 12)) * 60_000).toISOString();
    return {
      busId: bus.busId,
      vehicleNumber: bus.vehicleNumber,
      routeId: bus.routeId,
      routeName: bus.routeName,
      enteredAt,
      exitedAt: enteredAtPlus,
      camerasAvailable: buildCameras(bus.busId),
      durationInZoneSec: (new Date(enteredAtPlus).getTime() - new Date(enteredAt).getTime()) / 1000,
      lat: jitter(rng, BASE_LAT, 0.02),
      lng: jitter(rng, BASE_LNG, 0.02),
    };
  });
}

export function buildDraftCases(): InvestigationCase[] {
  const now = Date.now();
  return [
    {
      id: "CAS-001",
      title: "Hit-and-run probe — Race Course",
      createdAt: new Date(now - 2 * 3_600_000).toISOString(),
      updatedAt: new Date(now - 60 * 60_000).toISOString(),
      searchParams: {
        bbox: { west: BASE_LNG - 0.02, south: BASE_LAT - 0.02, east: BASE_LNG + 0.02, north: BASE_LAT + 0.02 },
        from: new Date(now - 4 * 3_600_000).toISOString(),
        to: new Date(now - 2 * 3_600_000).toISOString(),
      },
      clips: [
        {
          id: "CLIP-1",
          busId: "BUS-01-1",
          vehicleNumber: "TN 38 12 AB 4521",
          title: "Front cam — impact moment",
          notes: "Vehicle swerves right before crash site.",
          tags: ["hit-and-run", "front-cam"],
          from: new Date(now - 3 * 3_600_000).toISOString(),
          to: new Date(now - 3 * 3_600_000 + 90_000).toISOString(),
          cameras: ["front"],
        },
      ],
      notes: "Cross-reference witness statement with bus BU-01 front cam.",
    },
  ];
}