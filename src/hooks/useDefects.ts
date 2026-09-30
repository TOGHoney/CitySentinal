"use client";

import { useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { useDefectStore } from "@/store/defectStore";
import { toast } from "@/lib/toast";
import { reportApiError } from "@/lib/errors";

export function useDefects() {
  const {
    defects,
    filters,
    stats,
    selectedDefectId,
    loading,
    setDefects,
    setStats,
    setFilters,
    setLoading,
    selectDefect,
    markResolved,
  } = useDefectStore();

  const loadDefects = useCallback(
    async () => {
      setLoading(true);
      try {
        const data = await api.getDefects(filters);
        setDefects(data);
      } catch (err) {
        reportApiError("Could not load defects", err);
      } finally {
        setLoading(false);
      }
    },
    [filters, setDefects, setLoading],
  );

  const loadStats = useCallback(async () => {
    try {
      const data = await api.getDefectStats();
      setStats(data);
    } catch (err) {
      reportApiError("Could not load defect statistics", err);
    }
  }, [setStats]);

  const resolve = useCallback(
    async (id: string) => {
      try {
        await api.markDefectResolved(id);
        markResolved(id);
        toast.success("Defect marked as resolved");
        void loadStats();
      } catch (err) {
        reportApiError("Could not mark defect as resolved", err);
      }
    },
    [markResolved, loadStats],
  );

  useEffect(() => {
    loadDefects();
  }, [loadDefects]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const selectedDefect = defects.find((d) => d.id === selectedDefectId) ?? null;

  return {
    defects,
    stats,
    filters,
    selectedDefect,
    loading,
    setFilters,
    selectDefect,
    resolve,
    refresh: loadDefects,
  };
}