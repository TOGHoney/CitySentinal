"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import { useMapContext } from "@/hooks/useMap";
import { useFleetStore } from "@/store/fleetStore";
import type { Bus } from "@/types/fleet";

export const STATUS_COLORS: Record<Bus["status"], string> = {
  normal: "#22c55e",
  minor: "#f97316",
  critical: "#ef4444",
};

export function BusMarkers() {
  const map = useMapContext().map;
  const buses = useFleetStore((s) => s.buses);
  const selectedId = useFleetStore((s) => s.selectedBusId);
  const selectBus = useFleetStore((s) => s.selectBus);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());

  const busesById = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses]);

  useEffect(() => {
    if (!map) return;
    for (const [id, marker] of Array.from(markersRef.current.entries())) {
      if (!busesById.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }
    for (const bus of buses) {
      let marker = markersRef.current.get(bus.id);
      if (!marker) {
        const el = document.createElement("div");
        marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([bus.lng, bus.lat]).addTo(map);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          selectBus(bus.id);
        });
        markersRef.current.set(bus.id, marker);
      } else {
        marker.setLngLat([bus.lng, bus.lat]);
      }
      const active = selectedId === bus.id;
      const el = marker.getElement();
      el.innerHTML = "";
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Bus ${bus.vehicleNumber}`);
      const dot = document.createElement("div");
      dot.style.width = active ? "26px" : "20px";
      dot.style.height = active ? "26px" : "20px";
      dot.style.borderRadius = "9999px";
      dot.style.backgroundColor = STATUS_COLORS[bus.status];
      dot.style.border = "2px solid #fff";
      dot.style.boxShadow = active ? "0 0 0 3px rgba(59,130,246,0.45)" : "0 2px 6px rgba(0,0,0,0.3)";
      el.appendChild(dot);
    }
  }, [map, buses, busesById, selectedId, selectBus]);

  useEffect(() => {
    if (!map) return;
    const clear = () => selectBus(null);
    map.on("click", clear);
    return () => {
      map.off("click", clear);
    };
  }, [map, selectBus]);

  return null;
}