"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useInvestigation } from "@/hooks/useInvestigation";
import { cn } from "@/lib/utils";

const POSITION_LABELS: Record<string, string> = {
  front: "Front bumper cam",
  rear: "Rear cam",
  left: "Left side cam",
  right: "Right side cam",
};

function CameraFeed({ position, url, online }: { position: string; url: string; online: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !online || !url) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, online]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-md border bg-black">
      <video ref={videoRef} controls={false} autoPlay muted loop playsInline className="h-full w-full object-contain" />
      {!online && (
        <span className="absolute inset-0 flex items-center justify-center bg-muted/80 text-sm text-muted-foreground">
          Camera offline
        </span>
      )}
      <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        {POSITION_LABELS[position] ?? position}
      </span>
    </div>
  );
}

export function MultiCamPlayer() {
  const { results, selectedBusId } = useInvestigation();
  const bus = results.find((r) => r.busId === selectedBusId);

  if (!bus) return null;

  const online = bus.camerasAvailable.filter((c) => c.online);
  const offline = bus.camerasAvailable.filter((c) => !c.online);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-sm font-bold">{bus.vehicleNumber}</p>
          <p className="text-xs text-muted-foreground">
            {bus.routeName} · {online.length} of {bus.camerasAvailable.length} cameras live
          </p>
        </div>
      </div>
      <div className={cn("grid grid-cols-2 gap-2")}>
        {[...online, ...offline].map((cam) => (
          <CameraFeed key={cam.position} position={cam.position} url={cam.url} online={cam.online} />
        ))}
      </div>
    </div>
  );
}