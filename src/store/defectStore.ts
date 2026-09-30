"use client";

import { create } from "zustand";
import type { Defect, DefectFilters, DefectStats } from "@/types/defect";

interface DefectState {
  defects: Defect[];
  filters: DefectFilters;
  stats: DefectStats | null;
  selectedDefectId: string | null;
  loading: boolean;
  setDefects: (d: Defect[]) => void;
  setStats: (s: DefectStats) => void;
  setFilters: (f: Partial<DefectFilters>) => void;
  selectDefect: (id: string | null) => void;
  markResolved: (id: string) => void;
  setLoading: (l: boolean) => void;
}

export const useDefectStore = create<DefectState>((set) => ({
  defects: [],
  filters: { type: "all", status: "all" },
  stats: null,
  selectedDefectId: null,
  loading: false,
  setDefects: (defects) => set({ defects, loading: false }),
  setStats: (stats) => set({ stats }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  selectDefect: (selectedDefectId) => set({ selectedDefectId }),
  markResolved: (id) =>
    set((s) => ({ defects: s.defects.map((d) => (d.id === id ? { ...d, status: "resolved" } : d)) })),
  setLoading: (loading) => set({ loading }),
}));