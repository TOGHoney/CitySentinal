"use client";

import { create } from "zustand";
import type { Violation, ChallanReference, ViolationFilters, ChallanFilters } from "@/types/violation";

interface ViolationState {
  liveViolations: Violation[];
  history: ChallanReference[];
  filters: ViolationFilters;
  challanFilters: ChallanFilters;
  loading: boolean;
  setLiveViolations: (v: Violation[]) => void;
  prependViolation: (v: Violation) => void;
  setHistory: (h: ChallanReference[]) => void;
  setFilters: (f: Partial<ViolationFilters>) => void;
  setChallanFilters: (f: Partial<ChallanFilters>) => void;
  setLoading: (l: boolean) => void;
}

export const useViolationStore = create<ViolationState>((set) => ({
  liveViolations: [],
  history: [],
  filters: { type: "all" },
  challanFilters: { status: "all", type: "all" },
  loading: false,
  setLiveViolations: (liveViolations) => set({ liveViolations }),
  prependViolation: (violation) => set((s) => ({ liveViolations: [violation, ...s.liveViolations].slice(0, 100) })),
  setHistory: (history) => set({ history, loading: false }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setChallanFilters: (challanFilters) => set((s) => ({ challanFilters: { ...s.challanFilters, ...challanFilters } })),
  setLoading: (loading) => set({ loading }),
}));