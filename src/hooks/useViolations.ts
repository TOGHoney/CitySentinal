"use client";

import { getViolationImage, getPlateImage } from "@/mocks/data/violationImages";
import { useCallback, useState } from "react";
import { useDebouncedValue } from "@/lib/utils";
import { api } from "@/lib/api";
import { useViolationStore } from "@/store/violationStore";
import { toast } from "@/lib/toast";
import { reportApiError } from "@/lib/errors";
import { useInterval } from "@/lib/utils";

const VIOLATION_LABELS_MAP = {
  overspeeding: "Overspeeding",
  "wrong-way": "Wrong-way driving",
  "no-helmet": "No helmet",
  "red-light-jump": "Red-light jump",
  "rash-driving": "Rash driving",
};

export function useViolations() {
  const {
    liveViolations,
    history,
    filters,
    challanFilters,
    loading,
    setLiveViolations,
    prependViolation,
    setHistory,
    setFilters,
    setChallanFilters,
    setLoading,
  } = useViolationStore();
  const [refreshing, setRefreshing] = useState(false);
  const debouncedFrom = useDebouncedValue(filters.from, 300);
  const debouncedTo = useDebouncedValue(filters.to, 300);

  const loadViolations = useCallback(async () => {
    try {
      const data = await api.getViolations({
        type: filters.type,
        from: debouncedFrom,
        to: debouncedTo,
        zone: filters.zone,
      });
      setLiveViolations(data);
    } catch (err) {
      reportApiError("Could not load violations", err);
    }
  }, [filters.type, debouncedFrom, debouncedTo, filters.zone, setLiveViolations]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getChallanHistory(challanFilters);
      setHistory(data);
    } catch (err) {
      reportApiError("Could not load challan history", err);
    } finally {
      setLoading(false);
    }
  }, [challanFilters, setHistory, setLoading]);

  const generateChallan = useCallback(
    async (violationId: string) => {
      try {
        const res = await api.generateChallan(violationId);
        toast.success("E-Challan reference created", `Application ID ${res.reference.applicationId}`);
        return res.reference;
      } catch (err) {
        reportApiError("Could not generate e-challan reference", err);
        return null;
      }
    },
    [],
  );

  // When mocks are in use, occasionally inject a simulated live violation so the feed feels real-time.
  useInterval(
    () => {
      const types = Object.keys(VIOLATION_LABELS_MAP) as Array<keyof typeof VIOLATION_LABELS_MAP>;
      if (Math.random() < 0.55) return;
      const type = types[Math.floor(Math.random() * types.length)];
      const now = new Date().toISOString();
      prependViolation({
        id: `VIO-LIVE-${Date.now()}`,
        type,
        busId: "BUS-03-2",
        vehicleSnapshot: {
        imageUrl: getViolationImage(type),
        plateCropUrl: getPlateImage(),
        },anpr: {
          plateNumber: `TN ${["38", "20", "31"][Math.floor(Math.random() * 3)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(1000 + Math.random() * 9000)}`,
          confidence: Math.round(78 + Math.random() * 21),
        },
        lat: 11.0168445 + (Math.random() - 0.5) * 0.03,
        lng: 76.9558321 + (Math.random() - 0.5) * 0.03,
        locationLabel: "Avinashi Road, Live",
        detectedAt: now,
      });
    },
    15000,
  );

  return {
    liveViolations,
    history,
    filters,
    challanFilters,
    loading,
    refreshing,
    loadViolations,
    loadHistory,
    generateChallan,
    setFilters,
    setChallanFilters,
  };
}