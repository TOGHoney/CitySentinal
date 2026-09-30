"use client";

import { create } from "zustand";
import type { Bus, BusAlert, FleetStats } from "@/types/fleet";

interface FleetState {
  buses: Bus[];
  stats: FleetStats | null;
  alerts: BusAlert[];
  selectedBusId: string | null;
  loading: boolean;
  setBuses: (buses: Bus[]) => void;
  setStats: (stats: FleetStats) => void;
  updateBusPosition: (busId: string, position: { lat: number; lng: number; speed: number; heading: number }) => void;
  updateBusStatus: (busId: string, status: Bus["status"], alert?: BusAlert) => void;
  pushAlert: (alert: BusAlert) => void;
  selectBus: (busId: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  buses: [],
  stats: null,
  alerts: [],
  selectedBusId: null,
  loading: false,
  setBuses: (buses) => set({ buses, loading: false }),
  setStats: (stats) => set({ stats }),
  updateBusPosition: (busId, position) =>
    set((s) => ({
      buses: s.buses.map((b) => (b.id === busId ? { ...b, ...position } : b)),
    })),
  updateBusStatus: (busId, status, alert) =>
    set((s) => {
      const buses = s.buses.map((b) =>
        b.id === busId ? { ...b, status, lastAlertAt: alert ? alert.timestamp : b.lastAlertAt } : b,
      );
      const stats: FleetStats = {
        total: buses.length,
        normal: buses.filter((b) => b.status === "normal").length,
        minor: buses.filter((b) => b.status === "minor").length,
        critical: buses.filter((b) => b.status === "critical").length,
        avgSpeed: Math.round(buses.reduce((acc, b) => acc + b.speed, 0) / Math.max(buses.length, 1)),
      };
      return { buses, stats, alerts: alert ? [{ ...alert, type: alert.type, severity: alert.severity, message: alert.message, timestamp: alert.timestamp }, ...s.alerts].slice(0, 50) : s.alerts };
    }),
  pushAlert: (alert) => set((s) => ({ alerts: [alert, ...s.alerts].slice(0, 50) })),
  selectBus: (selectedBusId) => set({ selectedBusId }),
  setLoading: (loading) => set({ loading }),
}));