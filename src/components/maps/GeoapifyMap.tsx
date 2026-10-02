"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapContext } from "@/hooks/useMap";
import { cn } from "@/lib/utils";
import { fetchGeoapifyStyle, geoapifyApiKey, type GeoapifyStyleKey } from "@/lib/geoapify";

const DEFAULT_CENTER: [number, number] = [76.9558321, 11.0168445];
const DEFAULT_ZOOM = 12;

export type { GeoapifyStyleKey };

interface GeoapifyMapProps {
  center?: [number, number];
  zoom?: number;
  style?: GeoapifyStyleKey;
  className?: string;
  onLoad?: (map: maplibregl.Map) => void;
  interactive?: boolean;
  children?: React.ReactNode;
}

export default function GeoapifyMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  style = "light",
  className,
  onLoad,
  interactive = true,
  children,
}: GeoapifyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<maplibregl.Map | null>(null);
  const initialized = useRef(false);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiKey = geoapifyApiKey();
  const keyConfigured = Boolean(apiKey);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    if (!keyConfigured) return;
    initialized.current = true;

    let cancelled = false;
    const container = containerRef.current;

    (async () => {
      let instance: maplibregl.Map;
      try {
        const styleSpec = await fetchGeoapifyStyle(style, apiKey);
        if (cancelled) return;
        instance = new maplibregl.Map({
          container,
          style: styleSpec,
          center,
          zoom,
        });
      } catch (err) {
        if (cancelled) return;
        initialized.current = false;
        setError(err instanceof Error ? err.message : "Failed to load map style");
        return;
      }

      if (cancelled) {
        instance.remove();
        return;
      }

      instanceRef.current = instance;
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      instance.on("load", () => {
        if (instanceRef.current !== instance) return;
        setMap(instance);
        onLoad?.(instance);
      });
    })();

    return () => {
      cancelled = true;
      const instance = instanceRef.current;
      if (instance) {
        if (instanceRef.current === instance) {
          instanceRef.current = null;
          setMap(null);
        }
        instance.remove();
      }
      initialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    const set = interactive ? "enable" : "disable";
    instance.dragPan[set]();
    instance.scrollZoom[set]();
    instance.doubleClickZoom[set]();
    instance.boxZoom[set]();
    instance.keyboard[set]();
    instance.touchZoomRotate[set]();
  }, [interactive, map]);

  if (!keyConfigured) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center rounded-lg border border-dashed bg-muted/40 p-6 text-center",
          className,
        )}
      >
        <div className="max-w-sm space-y-1">
          <p className="text-sm font-medium">GeoApify API key not configured</p>
          <p className="text-xs text-muted-foreground">
            Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_GEOAPIFY_API_KEY</code> to your{" "}
            <code className="rounded bg-muted px-1">.env.local</code> to enable the interactive map. All dashboard
            features are powered by the mock data layer regardless.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)} ref={containerRef}>
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center text-sm text-destructive">
          Map failed to load: {error}
        </div>
      )}
      {map && !error && <MapContext.Provider value={{ map, keyConfigured }}>{children}</MapContext.Provider>}
    </div>
  );
}