"use client";

import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { useMapContext } from "@/hooks/useMap";
import { Checkbox } from "@/components/ui/checkbox";
import { mockDefects } from "@/mocks/data/defects";
import { mockAnalytics } from "@/mocks/data/analytics";
import { mockViolations } from "@/mocks/data/violations";
import { toFeatureCollection } from "@/lib/geojson";
import { isMapAlive } from "@/lib/geoapify";
import { cn } from "@/lib/utils";

type OverlayKey = "defects" | "traffic" | "violations" | "waterlogging";

const OVERLAYS: { key: OverlayKey; label: string; description: string }[] = [
  { key: "defects", label: "Road defects", description: "Potholes, damaged roads, signboards" },
  { key: "traffic", label: "Traffic density", description: "Live vehicle density heatmap" },
  { key: "violations", label: "Violation hotspots", description: "Recent violation locations" },
  { key: "waterlogging", label: "Waterlogging", description: "Flood-prone segments" },
];

function sourceId(key: OverlayKey) {
  return `ov-${key}`;
}

function layerId(key: OverlayKey) {
  return `ov-${key}-layer`;
}

function buildFeature(key: OverlayKey) {
  if (key === "defects") {
    return toFeatureCollection(mockDefects.filter((d) => d.status !== "resolved"));
  }
  if (key === "violations") {
    return toFeatureCollection(mockViolations);
  }
  if (key === "waterlogging") {
    return toFeatureCollection(mockDefects.filter((d) => d.type === "waterlogging"));
  }
  return toFeatureCollection(mockAnalytics.zones);
}

export function MapLayerToggle({ className }: { className?: string }) {
  const { map } = useMapContext();
  const [active, setActive] = useState<OverlayKey[]>([]);

  useEffect(() => {
    if (!isMapAlive(map)) return;

    for (const key of OVERLAYS.map((o) => o.key)) {
      const enabled = active.includes(key);
      const lId = layerId(key);
      if (!enabled && map.getLayer(lId)) {
        map.removeLayer(lId);
        if (map.getSource(sourceId(key))) map.removeSource(sourceId(key));
      }
      if (enabled && !map.getLayer(lId)) {
        const feature = buildFeature(key);
        if (key === "traffic") {
          map.addSource(sourceId(key), {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: feature.features.map((f) => ({
                ...f,
                properties: { ...f.properties, density: Number(f.properties?.density ?? 0.5) },
              })),
            } as never,
          });
          map.addLayer({
            id: lId,
            type: "heatmap",
            source: sourceId(key),
            paint: {
              "heatmap-weight": ["interpolate", ["linear"], ["get", "density"], 0, 0.2, 1, 1],
              "heatmap-intensity": 0.8,
              "heatmap-radius": 30,
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(68,206,120,0)",
                0.2,
                "rgba(34,197,94,0.6)",
                0.5,
                "rgba(250,204,21,0.7)",
                0.8,
                "rgba(249,115,22,0.8)",
                1,
                "rgba(239,68,68,0.9)",
              ],
            },
          } as never);
        } else {
          map.addSource(sourceId(key), { type: "geojson", data: feature as never });
          const circleColor = key === "waterlogging" ? "#38bdf8" : key === "violations" ? "#ef4444" : "#f59e0b";
          map.addLayer({
            id: lId,
            type: "circle",
            source: sourceId(key),
            paint: {
              "circle-radius": 6,
              "circle-color": circleColor,
              "circle-opacity": 0.85,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          } as never);
        }
      }
    }
  }, [map, active]);

  return (
    <div
      className={cn(
        "pointer-events-auto w-56 rounded-lg border bg-card/95 p-3 text-card-foreground shadow-lg backdrop-blur",
        className,
      )}
    >
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Layers className="h-3.5 w-3.5" /> Map layers
      </p>
      <div className="space-y-2.5">
        {OVERLAYS.map((overlay) => (
          <label key={overlay.key} className="flex cursor-pointer items-start gap-2.5">
            <Checkbox
              checked={active.includes(overlay.key)}
              onCheckedChange={(checked) => {
                setActive((cur) => (checked ? [...cur, overlay.key] : cur.filter((k) => k !== overlay.key)));
              }}
              className="mt-0.5"
            />
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-medium leading-tight">{overlay.label}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">{overlay.description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}