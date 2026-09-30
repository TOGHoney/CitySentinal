"use client";

import Link from "next/link";
import { Camera, Gauge, MapPin, TrendingUp } from "lucide-react";
import { useFleetStore } from "@/store/fleetStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatSpeed, timeAgo } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  normal: "#22c55e",
  minor: "#f97316",
  critical: "#ef4444",
};

export function BusDetailModal() {
  const buses = useFleetStore((s) => s.buses);
  const selectedBusId = useFleetStore((s) => s.selectedBusId);
  const selectBus = useFleetStore((s) => s.selectBus);
  const bus = buses.find((b) => b.id === selectedBusId) ?? null;

  return (
    <Dialog open={!!bus} onOpenChange={(open) => !open && selectBus(null)}>
      <DialogContent className="max-w-md">
        {bus && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[bus.status] }}
                />
                <DialogTitle>{bus.vehicleNumber}</DialogTitle>
                <Badge variant={bus.status === "critical" ? "destructive" : bus.status === "minor" ? "warning" : "success"}>
                  {bus.status}
                </Badge>
              </div>
              <DialogDescription>
                Bus {bus.id} · Route {bus.routeId} — {bus.routeName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5" /> Current speed
                </p>
                <p className="mt-1 text-lg font-bold">{formatSpeed(bus.speed)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Last alert
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {bus.lastAlertAt ? timeAgo(bus.lastAlertAt) : "No alerts"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Camera className="h-4 w-4" /> Live camera feeds
              </p>
              <div className="grid grid-cols-2 gap-2">
                {bus.cameras.map((cam) => (
                  <div key={cam.position} className="relative overflow-hidden rounded-md border">
                    <img
                      src={cam.url}
                      alt={`${cam.position} camera`}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium uppercase text-white">
                      {cam.position}
                    </span>
                    {!cam.online && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">
                        Offline
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Route ID</p>
                <p className="font-semibold">{bus.routeId}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Driver</p>
                <p className="font-semibold">{bus.driverName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Last alert {bus.lastAlertAt ? formatDateTime(bus.lastAlertAt) : "—"}
              </p>
              <Button asChild size="sm">
                <Link href="/analytics">
                  <TrendingUp className="mr-1.5 h-4 w-4" /> View detailed analytics
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}