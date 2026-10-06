import type { Violation, ChallanReference, FineRule } from "@/types/violation";
import { VIOLATION_FINE_AMOUNTS } from "@/lib/constants";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const TYPES = ["overspeeding", "wrong-way", "no-helmet", "red-light-jump", "rash-driving"] as const;

const LOCATIONS = [
  "NH-544, Avinashi Road",
  "Gandhipuram Junction",
  "Race Course Road",
  "Trichy Road, Singanallur",
  "Mettupalayam Road",
  "Sathy Road Junction",
  "Brookefields Flyover",
  "Airport Road, Peelamedu",
  "Lakshmi Mills Junction",
  "Periyanaicken Palayam",
];

const seed = 771231;
const rng = mulberry32(seed);

function plate() {
  const city = pick(rng, ["TN", "KL", "KA"]);
  const s = ["20", "38", "31", "57"];
  const letter = String.fromCharCode(65 + intBetween(rng, 0, 25)) + String.fromCharCode(65 + intBetween(rng, 0, 25));
  return `${city} ${pick(rng, s)} ${letter} ${intBetween(rng, 1000, 9999)}`;
}

export const mockViolations: Violation[] = Array.from({ length: 50 }, (_, i) => {
  const type = pick(rng, TYPES);
  const confidence = intBetween(rng, 55, 99) + rng();
  const hoursAgo = intBetween(rng, 0, 24);
  const detectedAt = new Date(Date.now() - hoursAgo * 3_600_000 - i * 90_000).toISOString();
  return {
    id: `VIO-${String(1000 + i)}`,
    type,
    busId: `BUS-0${intBetween(rng, 1, 5)}-${intBetween(rng, 1, 4)}`,
    vehicleSnapshot: {
      imageUrl: `https://picsum.photos/seed/vio-${i}-main/480/270`,
      plateCropUrl: `https://picsum.photos/seed/vio-${i}-plate/240/120`,
    },
    anpr: {
      plateNumber: plate(),
      confidence: Number(confidence.toFixed(1)),
    },
    lat: jitter(rng, BASE_LAT, 0.03),
    lng: jitter(rng, BASE_LNG, 0.03),
    locationLabel: pick(rng, LOCATIONS),
    detectedAt,
    evidenceVideoUrl: i % 3 === 0 ? "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" : undefined,
  };
});

export const mockChallanHistory: ChallanReference[] = Array.from({ length: 24 }, (_, i) => {
  const violation = mockViolations[i * 2];
  const status = pick(rng, ["pending", "issued", "pending", "disputed", "issued"] as const);
  return {
    id: `CHA-${String(100 + i)}`,
    violationId: violation.id,
    applicationId: `EC-${String(202600001 + i)}`,
    eChallanUrl: status !== "pending" ? `https://echallan.example.in/app/${String(202600001 + i)}` : undefined,
    plateNumber: violation.anpr.plateNumber,
    violationType: violation.type,
    lat: violation.lat,
    lng: violation.lng,
    locationLabel: violation.locationLabel,
    detectedAt: violation.detectedAt,
    busId: violation.busId,
    confidence: violation.anpr.confidence,
    status,
    createdAt: new Date(new Date(violation.detectedAt).getTime() + 300_000).toISOString(),
  };
});

export const mockFineRules: FineRule[] = (Object.keys(VIOLATION_FINE_AMOUNTS) as (keyof typeof VIOLATION_FINE_AMOUNTS)[]).map(
  (type) => ({
    violationType: type,
    label: type
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    fineAmount: VIOLATION_FINE_AMOUNTS[type],
    description:
      type === "overspeeding"
        ? "Exceeding prescribed speed limit"
        : type === "wrong-way"
          ? "Driving against traffic flow"
          : type === "no-helmet"
            ? "Riding without protective headgear"
            : type === "red-light-jump"
              ? "Crossing signal at red light"
              : "Dangerous overtaking / aggressive driving",
  }),
);