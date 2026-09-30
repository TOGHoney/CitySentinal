"use client";

import { useAnalyticsStore } from "@/store/analyticsStore";

export function useAnalytics() {
  return useAnalyticsStore();
}