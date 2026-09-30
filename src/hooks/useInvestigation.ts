"use client";

import { useCallback } from "react";
import { api } from "@/lib/api";
import { useInvestigationStore } from "@/store/investigationStore";
import { reportApiError } from "@/lib/errors";
import type { InvestigationSearchParams, FootageClipRequest, BusFootageResult, ClipRequestResponse } from "@/types/investigation";

export function useInvestigation() {
  const {
    searchParams,
    results,
    selectedBusId,
    loading,
    draftCases,
    setSearchParams,
    setResults,
    selectBus,
    setLoading,
    upsertCase,
    addClipToCase,
    deleteCase,
  } = useInvestigationStore();

  const search = useCallback(
    async (params: InvestigationSearchParams): Promise<BusFootageResult[] | null> => {
      setLoading(true);
      setSearchParams(params);
      try {
        const res = await api.searchFootage(params);
        setResults(res);
        return res;
      } catch (err) {
        reportApiError("Footage search failed", err);
        setResults([]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSearchParams, setResults],
  );

  const requestClip = useCallback(async (req: FootageClipRequest): Promise<ClipRequestResponse | null> => {
    try {
      return await api.requestClip(req);
    } catch (err) {
      reportApiError("Could not request footage clip", err);
      return null;
    }
  }, []);

  return {
    searchParams,
    results,
    selectedBusId,
    loading,
    draftCases,
    search,
    selectBus,
    requestClip,
    upsertCase,
    addClipToCase,
    deleteCase,
  };
}