"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { reportApiError } from "@/lib/errors";
import type { AnalyticsData, AnalyticsRange } from "@/types/analytics";

interface AnalyticsState {
  data: AnalyticsData | null;
  range: AnalyticsRange;
  loading: boolean;
  error: string | null;
  load: (r: AnalyticsRange) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  range: {
    from: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    to: new Date().toISOString(),
    label: "Last 24h",
  },
  loading: false,
  error: null,
  load: async (r) => {
    set({ loading: true, error: null });
    try {
      const result = await api.getCongestion(r);
      set({ data: result, range: r });
    } catch (err) {
      set({ error: reportApiError("Could not load congestion analytics", err) });
    } finally {
      set({ loading: false });
    }
  },
}));