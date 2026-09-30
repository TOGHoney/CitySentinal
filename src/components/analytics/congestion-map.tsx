"use client";

import { useEffect, useMemo } from "react";
import type { GeoJSONSource } from "maplibre-gl";
import { useMapContext } from "@/hooks/useMap";
import { useAnalytics } from "@/hooks/useAnalytics";
import { MapView } from "@/components/maps/MapView";
import { CONGESTION_LEVEL_TO_COLOR } from "@/lib/geojson";
import { CONGESTION_LABELS } from "@/lib/constants";
import { isMapAlive } from "@/lib/geoapify";

function ZoneLayer() {
  const { map } = useMapContext();
  const data = useAnalytics().data;
  const zones = useMemo(() => data?.zones ?? [], [data]);

  useEffect(() => {
    if (!isMapAlive(map)) return;
    if (zones.length === 0) return;
    const SOURCE = "congestion-zones";
    const CIRCLE = "congestion-zones-circle";
    const LABEL = "congestion-zones-label";

    const source = map.getSource(SOURCE) as GeoJSONSource | undefined;
    const features = zones.map((z) => ({
      type: "Feature" as const,
      properties: {
        name: z.name,
        level: z.level,
        avgSpeed: z.avgSpeed,
        vehicleCount: z.vehicleCount,
        color: CONGESTION_LEVEL_TO_COLOR[z.level],
        label: CONGESTION_LABELS[z.level],
      },
      geometry: { type: "Point" as const, coordinates: [z.lng, z.lat] },
    }));

    const geojson = { type: "FeatureCollection" as const, features };

    if (!source) {
      map.addSource(SOURCE, { type: "geojson", data: geojson });
    } else {
      (source as GeoJSONSource).setData(geojson);
    }

    if (!map.getLayer(CIRCLE)) {
      map.addLayer({
        id: CIRCLE,
        type: "circle",
        source: SOURCE,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 12, 14, 26],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.55,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.85,
        },
      });
      map.addLayer({
        id: LABEL,
        type: "symbol",
        source: SOURCE,
        layout: {
          "text-field": ["format", ["get", "name"], { "font-scale": 0.8 }, "\n", ["get", "label"]],
          "text-size": 10,
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#334155",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });
    }

    return () => {
      if (!isMapAlive(map)) return;
      if (map.getLayer(CIRCLE)) map.removeLayer(CIRCLE);
      if (map.getLayer(LABEL)) map.removeLayer(LABEL);
      if (map.getSource(SOURCE)) map.removeSource(SOURCE);
    };
  }, [map, zones]);

  return null;
}

export function CongestionMap() {
  const data = useAnalytics().data;

  return (
    <div className="relative min-h-[380px] overflow-hidden rounded-lg border bg-muted/40">
      <MapView className="absolute inset-0">
        <ZoneLayer />
      </MapView>
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-1.5 rounded-md bg-card/90 p-2 shadow backdrop-blur">
        {(Object.keys(CONGESTION_LEVEL_TO_COLOR) as Array<keyof typeof CONGESTION_LEVEL_TO_COLOR>).map((level) => (
          <span key={level} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CONGESTION_LEVEL_TO_COLOR[level] }} />
            {CONGESTION_LABELS[level]}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-md bg-card/90 px-2.5 py-1 text-xs text-muted-foreground shadow backdrop-blur">
        {data?.zones.length ?? 0} congestion zones monitored
      </div>
    </div>
  );
}