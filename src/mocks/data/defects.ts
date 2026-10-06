import type { Defect, DefectStats } from "@/types/defect";
import { mulberry32, BASE_LAT, BASE_LNG, jitter, pick, intBetween } from "./seeded";

const TYPES = [
  "pothole",
  "damaged-road",
  "missing-signboard",
  "missing-crossing",
  "waterlogging",
] as const;

const WARDS = ["Ward 8", "Ward 12", "Ward 19", "Ward 23", "Ward 31", "Ward 44"];

const ZONES = [
  "East Zone",
  "West Zone",
  "North Zone",
  "South Zone",
  "Central Zone",
];

const seed = 44017;
const rng = mulberry32(seed);

/*
 * Images are grouped by defect type.
 *
 * These paths are relative to the public/ folder.
 * Example:
 * public/images/pothole/pothole-1.png
 * becomes:
 * /images/pothole/pothole-1.png
 */

const DEFECT_IMAGES: Record<Defect["type"], string[]> = {
  "damaged-road": [
    "/images/damaged-road/damaged-road-1.jfif",
    "/images/damaged-road/damaged-road-2.jfif",
    "/images/damaged-road/damaged-road-3.jfif",
    "/images/damaged-road/damaged-road-4.jfif",
    "/images/damaged-road/damaged-road-5.png",
    "/images/damaged-road/damaged-road-6.png",
    "/images/damaged-road/damaged-road-7.jfif",
     ],

  "missing-signboard": [
    "/images/missing signboard/missing-signboard-1.jpg",
    "/images/missing signboard/missing-signboard-2.jfif",
    "/images/missing signboard/missing-signboard-3.jpg",
    "/images/missing signboard/missing-signboard-4.jfif",
    "/images/missing signboard/missing-signboard-5.jfif",
    "/images/missing signboard/missing-signboard-6.jfif",
    "/images/missing signboard/missing-signboard-7.jpg",
    "/images/missing signboard/missing-signboard-8.jfif",
    "/images/missing signboard/missing-signboard-9.jpeg",
    "/images/missing signboard/missing-signboard-10.jpg",
  ],

  "missing-crossing": [
    "/images/missing-crossing/missing-crossing-1.jpg",
    "/images/missing-crossing/missing-crossing-2.jfif",
  ],

  pothole: [
    "/images/pothole/pothole-1.jpeg",
    "/images/pothole/pothole-2.jpeg",
    "/images/pothole/pothole-3.jpeg",
    "/images/pothole/pothole-4.jpeg",
    "/images/pothole/pothole-5.jpeg",
    "/images/pothole/pothole-6.jpeg",
    "/images/pothole/pothole-7.jpeg",
    ],

  waterlogging: [
    "/images/waterlogging/waterlogging-1.jfif",
    "/images/waterlogging/waterlogging-2.jpg",
    "/images/waterlogging/waterlogging-3.jfif",
    "/images/waterlogging/waterlogging-4.jfif",
    "/images/waterlogging/waterlogging-5.jfif",
    "/images/waterlogging/waterlogging-6.jpg",
  ],
};

/*
 * Keeps track of how many times each defect type has been used.
 * This allows the images to rotate within their own category.
 *
 * Example:
 * pothole → 1 → 2 → 3 → ... → 10 → 1 → 2 → ...
 */
const imageCounters: Record<Defect["type"], number> = {
  pothole: 0,
  "damaged-road": 0,
  "missing-signboard": 0,
  "missing-crossing": 0,
  waterlogging: 0,
};

function getDefectImage(type: Defect["type"]): string {
  const images = DEFECT_IMAGES[type];

  const index = imageCounters[type] % images.length;

  imageCounters[type] += 1;

  return images[index];
}

export const mockDefects: Defect[] = Array.from({ length: 40 }, (_, i) => {
  const type = pick(rng, TYPES);
  const status = pick(rng, [
    "open",
    "open",
    "open",
    "in-review",
    "resolved",
  ] as const);

  const confidence = Number(
    (intBetween(rng, 62, 98) + rng()).toFixed(1)
  );

  const hoursAgo = intBetween(rng, 0, 240);

  return {
    id: `DFT-${String(500 + i)}`,

    type,

    lat: jitter(rng, BASE_LAT, 0.036),

    lng: jitter(rng, BASE_LNG, 0.036),

    ward: pick(rng, WARDS),

    zone: pick(rng, ZONES),

    busId: `BUS-0${intBetween(rng, 1, 5)}-${intBetween(rng, 1, 4)}`,

    // Category-specific local image
    imageUrl: getDefectImage(type),

    confidence,

    detectedAt: new Date(
      Date.now() - hoursAgo * 3_600_000 - i * 600_000
    ).toISOString(),

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

    "missing-signboard": mockDefects.filter(
      (d) => d.type === "missing-signboard"
    ).length,

    "missing-crossing": mockDefects.filter(
      (d) => d.type === "missing-crossing"
    ).length,

    waterlogging: mockDefects.filter(
      (d) => d.type === "waterlogging"
    ).length,
  },
};