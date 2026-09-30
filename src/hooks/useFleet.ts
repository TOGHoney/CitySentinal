"use client";

import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useFleetStore } from "@/store/fleetStore";
import { reportApiError } from "@/lib/errors";
import { pickBusForAlert } from "@/mocks";
import { useInterval } from "@/lib/utils";

function jitterCoord(value: number, spread: number) {
  return value + (Math.random() - 0.5) * spread;
}

export function useFleet() {
  const {
    buses,
    stats,
    alerts,
    selectedBusId,
    loading,
    setBuses,
    setStats,
    setLoading,
    updateBusPosition,
    updateBusStatus,
    selectBus,
  } = useFleetStore();

  const loadFleet = useCallback(async () => {
    setLoading(true);
    try {
      const { buses: busList, stats: fleetStats } = await api.getFleet();
      setBuses(busList);
      setStats(fleetStats);
    } catch (err) {
      reportApiError("Could not load fleet data", err);
    } finally {
      setLoading(false);
    }
  }, [setBuses, setStats, setLoading]);

  // Simulated live stream: update positions.
  useInterval(() => {
    if (buses.length === 0) return;
    const bus = buses[Math.floor(Math.random() * buses.length)];
    updateBusPosition(bus.id, {
      lat: jitterCoord(bus.lat, 0.0015),
      lng: jitterCoord(bus.lng, 0.0015),
      speed: Math.max(0, Math.min(80, bus.speed + (Math.random() - 0.5) * 8)),
      heading: bus.heading,
    });
  }, 2000);

  // Simulated live stream: inject random alerts.
  useInterval(() => {
    if (buses.length === 0) return;
    if (Math.random() < 0.65) return;
    const bus = buses.find((b) => b.id === pickBusForAlert());
    if (!bus) return;
    const severity = Math.random() < 0.3 ? "critical" : "minor";
    const templates: Record<string, string> = {
      overspeeding: "Overspeeding detected",
      "wrong-way": "Possible wrong-way driving ahead",
      "no-helmet": "Two-wheeler without helmet detected",
      "red-light-jump": "Signal violation possible",
      "rash-driving": "Aggressive driving behaviour",
      pothole: "Pothole hazard ahead",
      waterlogging: "Waterlogging on this segment",
    };
    const keys = Object.keys(templates);
    const type = keys[Math.floor(Math.random() * keys.length)];
    updateBusStatus(bus.id, severity === "critical" ? "critical" : "minor", {
      type,
      severity,
      message: templates[type],
      timestamp: new Date().toISOString(),
    });
  }, 12000);

  useEffect(() => {
    loadFleet();
  }, [loadFleet]);

  const selectedBus = buses.find((b) => b.id === selectedBusId) ?? null;

  return {
    buses,
    stats,
    alerts,
    selectedBus,
    selectedBusId,
    loading,
    selectBus,
    refresh: loadFleet,
  };
}