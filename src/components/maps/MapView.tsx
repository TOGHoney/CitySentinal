"use client";

import dynamic from "next/dynamic";
import type { Map as MapLibreMap } from "maplibre-gl";

export type { GeoapifyStyleKey } from "./GeoapifyMap";

export interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  style?: "light" | "streets" | "dark";
  className?: string;
  onLoad?: (map: MapLibreMap) => void;
  interactive?: boolean;
  children?: React.ReactNode;
}

const GeoapifyMap = dynamic(() => import("./GeoapifyMap").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-muted/30 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

export function MapView({ children, ...props }: MapViewProps) {
  return <GeoapifyMap {...props}>{children}</GeoapifyMap>;
}