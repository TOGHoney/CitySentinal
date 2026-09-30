import axios, { AxiosError, type AxiosRequestHeaders } from "axios";
import { mockDispatch, type MockApiResult } from "@/mocks";
import type {
  AuthUser,
  ForgotPasswordResponse,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "@/types/auth";
import type { Bus, FleetStats } from "@/types/fleet";
import type {
  ChallanFilters,
  ChallanReference,
  GenerateChallanResponse,
  Violation,
  ViolationFilters,
  FineRule,
} from "@/types/violation";
import type { Defect, DefectFilters, DefectStats } from "@/types/defect";
import type { AnalyticsData, AnalyticsRange } from "@/types/analytics";
import type { AlertThreshold } from "@/types/fleet";
import type { BusFootageResult, FootageClipRequest, ClipRequestResponse, InvestigationSearchParams } from "@/types/investigation";
import type { AppNotification } from "@/types/notification";
import { getAccessToken, getRefreshToken, setSessionTokens, clearSession, decodeMockToken } from "./auth";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const { data } = await axios.post<{ accessToken: string; expiresIn: number }>(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: refresh },
          { withCredentials: true },
        );
        const decoded = decodeMockToken(data.accessToken);
        setSessionTokens(data.accessToken, refresh, decoded?.exp ?? Math.floor(Date.now() / 1000) + 3600);
        return data.accessToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const token = await refreshAccessToken();
      if (token) {
        (original.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
        return http(original);
      }
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function raw<T>(
  method: "GET" | "POST" | "PATCH" | "PUT",
  url: string,
  params?: Record<string, string | undefined>,
  body?: unknown,
): Promise<T> {
  if (USE_MOCKS) {
    await delayForRealism(url);
    const result = await mockDispatch({ method, url, params, body });
    if (result && typeof result === "object" && "ok" in (result as object)) {
      const res = result as MockApiResult;
      if (!res.ok) {
        throw new ApiError(res.status, res.message);
      }
      return res.data as T;
    }
    return result as T;
  }
  const { data } = await http.request<T>({ method, url, params, data: body });
  return data;
}

function delayForRealism(url: string) {
  if (url.includes("forgot-password")) return sleep(600);
  if (url.includes("challan")) return sleep(700);
  return sleep(250);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  // Auth
  async login(payload: LoginPayload): Promise<LoginResponse> {
    return raw<LoginResponse>("POST", "/auth/login", undefined, payload);
  },
  async logout(): Promise<void> {
    await raw("POST", "/auth/logout");
    clearSession();
  },
  async forgotPassword(username: string): Promise<ForgotPasswordResponse> {
    return raw<ForgotPasswordResponse>("POST", "/auth/forgot-password", undefined, { username });
  },
  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return raw<ResetPasswordResponse>("POST", "/auth/reset-password", undefined, payload);
  },

  // Fleet
  async getFleet(): Promise<{ buses: Bus[]; stats: FleetStats }> {
    return raw("GET", "/fleet/buses");
  },
  async getBus(id: string): Promise<Bus> {
    return raw("GET", `/fleet/buses/${id}`);
  },

  // Violations
  async getViolations(filters: ViolationFilters = { type: "all" }): Promise<Violation[]> {
    return raw("GET", "/violations", {
      type: filters.type ?? "all",
      from: filters.from,
      to: filters.to,
      zone: filters.zone,
    });
  },
  async generateChallan(violationId: string): Promise<GenerateChallanResponse> {
    return raw("POST", `/violations/${violationId}/challan`);
  },
  async getChallanHistory(filters: ChallanFilters = { status: "all", type: "all" }): Promise<ChallanReference[]> {
    return raw("GET", "/challan/history", {
      status: filters.status ?? "all",
      type: filters.type ?? "all",
      from: filters.from,
      to: filters.to,
      zone: filters.zone,
    });
  },

  // Defects
  async getDefects(filters: DefectFilters = { type: "all", status: "all" }): Promise<Defect[]> {
    return raw("GET", "/defects", {
      type: filters.type ?? "all",
      status: filters.status ?? "all",
      ward: filters.ward,
      from: filters.from,
      to: filters.to,
    });
  },
  async getDefectStats(): Promise<DefectStats> {
    return raw("GET", "/defects/stats");
  },
  async markDefectResolved(id: string): Promise<Defect> {
    return raw("PATCH", `/defects/${id}/resolve`);
  },

  // Analytics
  async getCongestion(range: AnalyticsRange): Promise<AnalyticsData> {
    return raw("GET", "/analytics/congestion", { from: range.from, to: range.to });
  },

  // Investigation
  async searchFootage(params: InvestigationSearchParams): Promise<BusFootageResult[]> {
    return raw("POST", "/investigation/search", undefined, params);
  },
  async requestClip(req: FootageClipRequest): Promise<ClipRequestResponse> {
    return raw("POST", "/investigation/request-clip", undefined, req);
  },

  // Profile
  async getProfile(): Promise<AuthUser> {
    return raw("GET", "/profile");
  },
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return raw("PUT", "/profile/password", undefined, { currentPassword, newPassword });
  },
  async getFineRules(): Promise<FineRule[]> {
    return raw("GET", "/settings/fine-rules");
  },
  async getAlertThresholds(): Promise<AlertThreshold[]> {
    return raw("GET", "/settings/alert-thresholds");
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return raw("GET", "/notifications");
  },
  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return raw("PATCH", `/notifications/${id}`);
  },
  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return raw("POST", "/notifications/read-all");
  },
};