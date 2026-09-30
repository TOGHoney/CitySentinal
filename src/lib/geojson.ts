import type { GeoBounds } from "@/types/investigation";
import type { CongestionLevel } from "@/types/analytics";

export interface GeoPoint {
  id?: string | number;
  lat: number;
  lng: number;
}

export function toFeatureCollection<T extends GeoPoint>(points: T[]) {
  return {
    type: "FeatureCollection",
    features: points.map((p, index) => ({
      type: "Feature",
      id: p.id ?? index,
      properties: Object.fromEntries(Object.entries(p).filter(([k]) => !["lat", "lng", "id", "zone"].includes(k))),
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
    })),
  };
}

export function bboxToFeature(bbox: GeoBounds) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [
        [
          [bbox.west, bbox.south],
          [bbox.east, bbox.south],
          [bbox.east, bbox.north],
          [bbox.west, bbox.north],
          [bbox.west, bbox.south],
        ],
      ],
    },
  };
}

export const CONGESTION_LEVEL_TO_COLOR: Record<CongestionLevel, string> = {
  low: "#22c55e",
  moderate: "#facc15",
  high: "#f97316",
  severe: "#ef4444",
};