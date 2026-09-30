"use client";

import { createContext, useContext } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

export interface MapContextValue {
  map: MapLibreMap | null;
  keyConfigured: boolean;
}

export const MapContext = createContext<MapContextValue>({ map: null, keyConfigured: false });

export function useMapContext() {
  return useContext(MapContext);
}