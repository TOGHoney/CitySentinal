import type { Defect, DefectStats } from "@/types/defect";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const TYPES = ["pothole", "damaged-road", "missing-signboard", "missing-crossing", "waterlogging"] as const;
const WARDS = ["Ward 8", "Ward 12", "Ward 19", "Ward 23", "Ward 31", "Ward 44"];
const ZONES = ["East Zone", "West Zone", "North Zone", "South Zone", "Central Zone"];

const seed = 44017;
const rng = mulberry32(seed);

export const mockDefects: Defect[] = Array.from({ length: 40 }, (_, i) => {
  const type = pick(rng, TYPES);
  const status = pick(rng, ["open", "open", "open", "in-review", "resolved"] as const);
  const confidence = Number((intBetween(rng, 62, 98) + rng()).toFixed(1));
  const hoursAgo = intBetween(rng, 0, 240);
  return {
    id: `DFT-${String(500 + i)}`,
    type,
    lat: jitter(rng, BASE_LAT, 0.036),
    lng: jitter(rng, BASE_LNG, 0.036),
    ward: pick(rng, WARDS),
    zone: pick(rng, ZONES),
    busId: `BUS-0${intBetween(rng, 1, 5)}-${intBetween(rng, 1, 4)}`,
    imageUrl: `https://picsum.photos/seed/dft-${i}/480/320`,
    confidence,
    detectedAt: new Date(Date.now() - hoursAgo * 3_600_000 - i * 600_000).toISOString(),
    status,
    description:
      type === "waterlogging"
        ? "Stagnant water covering full lane width"
        : undefined,
  };
});

export const mockDefectStats: DefectStats = {
  total: mockDefects.length,
  open: mockDefects.filter((d) => d.status === "open").length,
  resolved: mockDefects.filter((d) => d.status === "resolved").length,
  critical: mockDefects.filter((d) => d.confidence > 85).length,
  byType: {
    pothole: mockDefects.filter((d) => d.type === "pothole").length,
    "damaged-road": mockDefects.filter((d) => d.type === "damaged-road").length,
    "missing-signboard": mockDefects.filter((d) => d.type === "missing-signboard").length,
    "missing-crossing": mockDefects.filter((d) => d.type === "missing-crossing").length,
    waterlogging: mockDefects.filter((d) => d.type === "waterlogging").length,
  },
};