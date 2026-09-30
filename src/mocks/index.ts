import { mockUser } from "./data/auth";
import { mockBuses, mockFleetStats } from "./data/buses";
import { mockViolations, mockChallanHistory, mockFineRules } from "./data/violations";
import { mockDefects, mockDefectStats } from "./data/defects";
import { mockAnalytics } from "./data/analytics";
import { buildNotifications } from "./data/notifications";
import { buildFootageResults } from "./data/investigation";
import type { AuthUser } from "@/types/auth";
import type { ChallanReference, ViolationType } from "@/types/violation";
import type { FootageClipRequest } from "@/types/investigation";
import type { AppNotification, NotificationCategory } from "@/types/notification";
import { setSessionTokens, clearSession } from "@/lib/auth";

export interface MockApiContext {
  method: string;
  url: string;
  params?: Record<string, string | undefined>;
  body?: unknown;
}

const LATENCY = 400;

function delay<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function randomId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function encodeTokenPayload(exp: number): string {
  const json = JSON.stringify({ user: mockUser, exp });
  const bytes = new TextEncoder().encode(json);
  return `mock.${base64Url(bytes)}`;
}

function issueSession() {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token = encodeTokenPayload(exp);
  setSessionTokens(token, `${token}.refresh`, exp);
  return { accessToken: token, expiresIn: 3600, exp };
}

export type MockApiResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; message: string };

let notifications = buildNotifications();

export async function mockDispatch(ctx: MockApiContext): Promise<unknown> {
  const { method, url, params = {}, body } = ctx;

  if (url === "/auth/login" && method === "POST") {
    const payload = body as { username: string; password: string };
    if (!payload?.username || !payload?.password) {
      return { ok: false, status: 400, message: "Username and password are required" };
    }
    try {
      const session = issueSession();
      return delay({ ok: true, data: { user: mockUser, accessToken: session.accessToken, expiresIn: session.expiresIn } });
    } catch (err) {
      console.error("mock login token issuance failed", err);
      return { ok: false, status: 500, message: "Could not issue a session. Please try again." };
    }
  }

  if (url === "/auth/logout" && method === "POST") {
    clearSession();
    return delay({ ok: true, data: { success: true } });
  }

  if (url === "/auth/forgot-password" && method === "POST") {
    return delay({ ok: true, data: { message: "If the account exists, a password reset link has been emailed.", resetSent: true } });
  }

  if (url === "/auth/reset-password" && method === "POST") {
    return delay({ ok: true, data: { message: "Password updated. You can now sign in.", success: true } }, 900);
  }

  if (url === "/auth/refresh" && method === "POST") {
    try {
      const session = issueSession();
      return delay({ ok: true, data: { accessToken: session.accessToken, expiresIn: session.expiresIn } });
    } catch (err) {
      console.error("mock refresh token issuance failed", err);
      return { ok: false, status: 500, message: "Could not refresh the session. Please sign in again." };
    }
  }

  if (url === "/fleet/buses" && method === "GET") {
    return delay({ ok: true, data: { buses: mockBuses, stats: mockFleetStats } });
  }

  if (url.startsWith("/fleet/buses/") && method === "GET") {
    const id = url.split("/").pop();
    const bus = mockBuses.find((b) => b.id === id);
    if (!bus) return { ok: false, status: 404, message: "Bus not found" };
    return delay(bus);
  }

  if (url === "/violations" && method === "GET") {
    const { type, from, to, zone } = params;
    let list = [...mockViolations];
    if (type && type !== "all") list = list.filter((v) => v.type === type);
    if (zone) list = list.filter((v) => v.locationLabel.includes(zone));
    if (from) list = list.filter((v) => new Date(v.detectedAt) >= new Date(from));
    if (to) list = list.filter((v) => new Date(v.detectedAt) <= new Date(to));
    return delay(list.slice(0, 50));
  }

  if (url.startsWith("/violations/") && url.endsWith("/challan") && method === "POST") {
    const violationId = url.split("/")[2];
    const violation = mockViolations.find((v) => v.id === violationId);
    if (!violation) return { ok: false, status: 404, message: "Violation not found" };
    const appId = `EC-${String(202600000 + mockChallanHistory.length + 1)}`;
    const reference: ChallanReference = {
      id: randomId("CHA"),
      violationId,
      applicationId: appId,
      plateNumber: violation.anpr.plateNumber,
      violationType: violation.type,
      lat: violation.lat,
      lng: violation.lng,
      locationLabel: violation.locationLabel,
      detectedAt: violation.detectedAt,
      busId: violation.busId,
      confidence: violation.anpr.confidence,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    mockChallanHistory.unshift(reference);
    return delay({ success: true, reference }, 900);
  }

  if (url === "/challan/history" && method === "GET") {
    const { status, type, from, to, zone } = params;
    let list = [...mockChallanHistory];
    if (status && status !== "all") list = list.filter((c) => c.status === status);
    if (type && type !== "all") list = list.filter((c) => c.violationType === type);
    if (zone) list = list.filter((c) => c.locationLabel.includes(zone));
    if (from) list = list.filter((c) => new Date(c.detectedAt) >= new Date(from));
    if (to) list = list.filter((c) => new Date(c.detectedAt) <= new Date(to));
    return delay(list);
  }

  if (url === "/defects" && method === "GET") {
    const { type, status, ward, from, to } = params;
    let list = [...mockDefects];
    if (type && type !== "all") list = list.filter((d) => d.type === type);
    if (status && status !== "all") list = list.filter((d) => d.status === status);
    if (ward) list = list.filter((d) => d.ward === ward);
    if (from) list = list.filter((d) => new Date(d.detectedAt) >= new Date(from));
    if (to) list = list.filter((d) => new Date(d.detectedAt) <= new Date(to));
    return delay(list);
  }

  if (url === "/defects/stats" && method === "GET") {
    return delay(mockDefectStats);
  }

  if (url.startsWith("/defects/") && url.endsWith("/resolve") && method === "PATCH") {
    const id = url.split("/")[2];
    const defect = mockDefects.find((d) => d.id === id);
    if (!defect) return { ok: false, status: 404, message: "Defect not found" };
    defect.status = "resolved";
    return delay(defect);
  }

  if (url === "/analytics/congestion" && method === "GET") {
    return delay(mockAnalytics);
  }

  if (url === "/investigation/search" && method === "POST") {
    const bodyParams = (body ?? {}) as { vehicleNumber?: string };
    return delay(buildFootageResults(bodyParams.vehicleNumber));
  }

  if (url === "/investigation/request-clip" && method === "POST") {
    const req = body as FootageClipRequest;
    return delay({
      clipId: randomId("CLIP"),
      signedUrl: `https://storage.example.in/clips/${req.busId}?signature=mock`,
      expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
    });
  }

  if (url === "/profile" && method === "GET") {
    return delay(mockUser);
  }

  if (url === "/profile/password" && method === "PUT") {
    return delay({ ok: true, data: { success: true } });
  }

  if (url === "/settings/fine-rules" && method === "GET") {
    return delay(mockFineRules);
  }

  if (url === "/settings/alert-thresholds" && method === "GET") {
    return delay([
      { rule: "Pothole confidence", value: 85, severity: "critical" },
      { rule: "Signboard confidence", value: 80, severity: "critical" },
      { rule: "Waterlogging confidence", value: 85, severity: "critical" },
      { rule: "Overspeed detection", value: 75, severity: "minor" },
      { rule: "ANPR plate confidence", value: 70, severity: "minor" },
      { rule: "Low-quality defect detections", value: 60, severity: "minor" },
    ]);
  }

  if (url === "/notifications" && method === "GET") {
    return delay(notifications);
  }

  if (url.startsWith("/notifications/") && method === "PATCH") {
    const id = url.split("/")[2];
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return delay({ ok: true, data: { success: true } });
  }

  if (url === "/notifications/read-all" && method === "POST") {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return delay({ ok: true, data: { success: true } });
  }

  if (url === "/notifications" && method === "POST") {
    const bodyParams = body as { type: NotificationCategory };
    const created = randomNotification(bodyParams.type);
    notifications.unshift(created);
    return delay(created);
  }

  if (url === "/zones" && method === "GET") {
    return delay(mockDefects.map((d) => d.zone).filter((v, i, a) => a.indexOf(v) === i));
  }

  if (url === "/wards" && method === "GET") {
    return delay(mockDefects.map((d) => d.ward).filter((v, i, a) => a.indexOf(v) === i));
  }

  return { ok: false, status: 404, message: `Mock endpoint not found: ${method} ${url}` };
}

function randomNotification(type: NotificationCategory): AppNotification {
  const templates: Record<NotificationCategory, AppNotification> = {
    "critical-incident": {
      id: randomId("N"),
      category: "critical-incident",
      severity: "critical",
      title: "Critical incident reported",
      message: "A new critical incident was flagged by the fleet.",
      timestamp: new Date().toISOString(),
      read: false,
    },
    violation: {
      id: randomId("N"),
      category: "violation",
      severity: "warning",
      title: "High-confidence violation",
      message: "A high-confidence violation was detected by ANPR.",
      timestamp: new Date().toISOString(),
      read: false,
    },
    defect: {
      id: randomId("N"),
      category: "defect",
      severity: "warning",
      title: "Road defect threshold crossed",
      message: "A road defect detection crossed the severity threshold.",
      timestamp: new Date().toISOString(),
      read: false,
    },
    investigation: {
      id: randomId("N"),
      category: "investigation",
      severity: "info",
      title: "Investigation search completed",
      message: "An investigation search finished matching buses.",
      timestamp: new Date().toISOString(),
      read: false,
    },
  };
  return templates[type] ?? templates.investigation;
}

export { mockFleetStats };

const BUS_ID_POOL = mockBuses.map((b) => b.id);

export function pickBusForAlert() {
  return BUS_ID_POOL[Math.floor(Math.random() * BUS_ID_POOL.length)];
}