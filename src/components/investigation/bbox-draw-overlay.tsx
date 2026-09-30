"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, LngLat, MapMouseEvent } from "maplibre-gl";
import { useMapContext } from "@/hooks/useMap";
import { bboxToFeature } from "@/lib/geojson";
import { isMapAlive } from "@/lib/geoapify";
import type { GeoBounds } from "@/types/investigation";

const SOURCE = "bbox-source";
const FILL = "bbox-fill";
const LINE = "bbox-line";

export function BboxDrawOverlay({
  enabled,
  bbox,
  onBboxChange,
}: {
  enabled: boolean;
  bbox: GeoBounds | null;
  onBboxChange: (bbox: GeoBounds | null) => void;
}) {
  const { map } = useMapContext();
  const [draft, setDraft] = useState<[LngLat, LngLat] | null>(null);
  const startRef = useRef<LngLat | null>(null);

  const paint = useCallback(
    (bounds: GeoBounds | null) => {
      if (!map) return;
      const src = map.getSource(SOURCE) as GeoJSONSource | undefined;
      if (bounds) {
        const data = bboxToFeature(bounds);
        if (!src) {
          map.addSource(SOURCE, { type: "geojson", data });
        } else {
          src.setData(data);
        }
        if (!map.getLayer(FILL)) {
          map.addLayer({
            id: FILL,
            type: "fill",
            source: SOURCE,
            paint: {
              "fill-color": "#0ea5e9",
              "fill-opacity": 0.15,
            },
          });
          map.addLayer({
            id: LINE,
            type: "line",
            source: SOURCE,
            paint: {
              "line-color": "#0ea5e9",
              "line-width": 1.5,
              "line-dasharray": [3, 2],
            },
          });
        }
      } else {
        if (!isMapAlive(map)) return;
        if (map.getLayer(FILL)) map.removeLayer(FILL);
        if (map.getLayer(LINE)) map.removeLayer(LINE);
        if (src) map.removeSource(SOURCE);
      }
    },
    [map],
  );

  useEffect(() => {
    paint(bbox);
  }, [bbox, paint]);

  useEffect(() => {
    if (!isMapAlive(map) || !enabled) return;

    const onDown = (e: MapMouseEvent) => {
      if (!enabled) return;
      startRef.current = e.lngLat;
    };
    const onMove = (e: MapMouseEvent) => {
      if (startRef.current) setDraft([startRef.current, e.lngLat]);
    };
    const onUp = (e: MapMouseEvent) => {
      if (!startRef.current) return;
      setDraft(null);
      const a = startRef.current;
      startRef.current = null;
      if (startRef.current) return;
      const b = e.lngLat;
      if (Math.abs(a.lng - b.lng) < 0.0005 || Math.abs(a.lat - b.lat) < 0.0005) return;
      const bounds: GeoBounds = {
        west: Math.min(a.lng, b.lng),
        south: Math.min(a.lat, b.lat),
        east: Math.max(a.lng, b.lng),
        north: Math.max(a.lat, b.lat),
      };
      onBboxChange(bounds);
    };
    const onDblClick = () => onBboxChange(null);

    map.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);
    map.on("dblclick", onDblClick);
    return () => {
      map.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
      map.off("dblclick", onDblClick);
    };
  }, [map, enabled, onBboxChange]);

  const liveBounds = draft
    ? ((): GeoBounds => ({
        west: Math.min(draft[0].lng, draft[1].lng),
        south: Math.min(draft[0].lat, draft[1].lat),
        east: Math.max(draft[0].lng, draft[1].lng),
        north: Math.max(draft[0].lat, draft[1].lat),
      }))()
    : null;

  useEffect(() => {
    paint(liveBounds ?? bbox);
  }, [liveBounds, bbox, paint]);

  return null;
}