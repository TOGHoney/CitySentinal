"use client";

import { useState } from "react";
import { Search, Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/maps/MapView";
import { BboxDrawOverlay } from "./bbox-draw-overlay";
import { useInvestigation } from "@/hooks/useInvestigation";
import { formatCoords } from "@/lib/utils";
import type { GeoBounds, InvestigationSearchParams } from "@/types/investigation";

export function InvestigationSearchForm() {
  const { search, searchParams, loading } = useInvestigation();
  const [bbox, setBbox] = useState<GeoBounds | null>(searchParams?.bbox ?? null);
  const [from, setFrom] = useState(searchParams ? searchParams.from.slice(0, 16) : "");
  const [to, setTo] = useState(searchParams ? searchParams.to.slice(0, 16) : "");
  const [vehicleNumber, setVehicleNumber] = useState(searchParams?.vehicleNumber ?? "");

  const submit = () => {
    if (!bbox || !from || !to) return;
    const params: InvestigationSearchParams = {
      bbox,
      from: new Date(from).toISOString(),
      to: new Date(to).toISOString(),
      vehicleNumber: vehicleNumber.trim() || undefined,
    };
    void search(params);
  };

  const valid = !!bbox && !!from && !!to;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Search parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label className="text-xs">Search area (click + drag on map)</Label>
            {bbox ? (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => setBbox(null)}>
                Clear
              </Button>
            ) : null}
          </div>
          <div className="relative h-56 overflow-hidden rounded-md border bg-muted/40">
            <MapView zoom={11} interactive={!!bbox}>
              <BboxDrawOverlay enabled={!bbox} bbox={bbox} onBboxChange={setBbox} />
            </MapView>
            {!bbox && (
              <span className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md bg-card/90 px-2 py-1 text-[11px] text-muted-foreground shadow">
                <Crosshair className="h-3 w-3" /> Drag to draw search rectangle
              </span>
            )}
          </div>
          {bbox && (
            <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> SW {formatCoords(bbox.south, bbox.west)} · NE{" "}
              {formatCoords(bbox.north, bbox.east)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="invest-from" className="text-xs">
              From
            </Label>
            <Input id="invest-from" type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="invest-to" className="text-xs">
              To
            </Label>
            <Input id="invest-to" type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="invest-vehicle" className="text-xs">
            Vehicle number <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="invest-vehicle"
            placeholder="e.g. TN 38 1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={submit} disabled={!valid || loading}>
          {loading ? "Searching…" : "Search footage"}
          {!loading && <Search className="ml-2 h-4 w-4" />}
        </Button>
        {!valid && (
          <p className="text-[11px] text-muted-foreground">Draw a rectangle and select both timestamps to search.</p>
        )}
      </CardContent>
    </Card>
  );
}