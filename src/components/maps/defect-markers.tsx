"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useMapContext } from "@/hooks/useMap";
import { useDefectStore } from "@/store/defectStore";

export const DEFECT_COLORS = {
  pothole: "#b91c1c",
  "damaged-road": "#f59e0b",
  "missing-signboard": "#3b82f6",
  "missing-crossing": "#8b5cf6",
  waterlogging: "#06b6d4",
} as const;

export function DefectMarkers() {
  const map = useMapContext().map;
  const defects = useDefectStore((s) => s.defects);
  const selectDefect = useDefectStore((s) => s.selectDefect);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  useEffect(() => {
    if (!map) return;
    for (const [id, marker] of Array.from(markersRef.current.entries())) {
      if (!defects.some((d) => d.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
    for (const defect of defects) {
      let marker = markersRef.current.get(defect.id);
      if (!marker) {
        const el = document.createElement("div");
        marker = new maplibregl.Marker({ element: el }).setLngLat([defect.lng, defect.lat]).addTo(map);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          selectDefect(defect.id);
        });
        markersRef.current.set(defect.id, marker);
      }
      const el = marker.getElement();
      el.innerHTML = "";
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Defect ${defect.id}, ${defect.type}`);
      const color = DEFECT_COLORS[defect.type] ?? "#64748b";
      const resolved = defect.status === "resolved";
      el.style.width = resolved ? "10px" : "14px";
      el.style.height = "14px";
      el.style.borderRadius = "9999px";
      el.style.backgroundColor = resolved ? "#94a3b8" : color;
      el.style.border = "1.5px solid #fff";
      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";
      el.style.opacity = resolved ? "0.5" : "1";
    }
  }, [map, defects, selectDefect]);

  useEffect(() => {
    if (!map) return;
    const clear = () => selectDefect(null);
    map.on("click", clear);
    return () => {
      map.off("click", clear);
    };
  }, [map, selectDefect]);

  return null;
}