"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InvestigationSearchParams, BusFootageResult, InvestigationCase, CaseClip } from "@/types/investigation";

interface InvestigationState {
  searchParams: InvestigationSearchParams | null;
  results: BusFootageResult[];
  selectedBusId: string | null;
  loading: boolean;
  draftCases: InvestigationCase[];
  setSearchParams: (p: InvestigationSearchParams) => void;
  setResults: (r: BusFootageResult[]) => void;
  selectBus: (busId: string | null) => void;
  setLoading: (l: boolean) => void;
  upsertCase: (c: InvestigationCase) => void;
  addClipToCase: (caseId: string, clip: CaseClip) => void;
  deleteCase: (caseId: string) => void;
}

export const useInvestigationStore = create<InvestigationState>()(
  persist(
    (set, get) => ({
      searchParams: null,
      results: [],
      selectedBusId: null,
      loading: false,
      draftCases: [],
      setSearchParams: (searchParams) => set({ searchParams }),
      setResults: (results) => set({ results, loading: false }),
      selectBus: (selectedBusId) => set({ selectedBusId }),
      setLoading: (loading) => set({ loading }),
      upsertCase: (caseItem) =>
        set((s) => {
          const exists = s.draftCases.some((c) => c.id === caseItem.id);
          const draftCases = exists
            ? s.draftCases.map((c) => (c.id === caseItem.id ? caseItem : c))
            : [caseItem, ...s.draftCases];
          return { draftCases };
        }),
      addClipToCase: (caseId, clip) =>
        set((s) => ({
          draftCases: s.draftCases.map((c) =>
            c.id === caseId ? { ...c, clips: [...c.clips.filter((x) => x.id !== clip.id), clip], updatedAt: new Date().toISOString() } : c,
          ),
        })),
      deleteCase: (caseId) => set((s) => ({ draftCases: s.draftCases.filter((c) => c.id !== caseId) })),
    }),
    {
      name: "cs-investigation",
      partialize: (state) => ({ draftCases: state.draftCases }),
      skipHydration: true,
    },
  ),
);

export function generateCaseId() {
  return `CAS-${Date.now().toString(36).toUpperCase()}`;
}