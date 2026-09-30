import type { FleetStreamEvent } from "@/types/fleet";
import type { Violation } from "@/types/violation";
import type { AppNotification } from "@/types/notification";
import { getAccessToken } from "./auth";

export type WSChannelEvent =
  | { channel: "fleet"; event: FleetStreamEvent }
  | { channel: "violations"; event: Violation }
  | { channel: "notifications"; event: AppNotification };

export type WSChannel = "fleet" | "violations" | "notifications";

type ChannelListener = (payload: WSChannelEvent) => void;

const MAX_RETRIES = 5;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners = new Map<WSChannel, Set<ChannelListener>>();
  private retries = 0;
  private url: string;
  private enabled = false;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (!this.url || typeof window === "undefined") return;
    this.enabled = true;
    try {
      const token = getAccessToken();
      const full = `${this.url}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      this.ws = new WebSocket(full);
      this.ws.onmessage = (event) => this.handleMessage(event.data);
      this.ws.onclose = () => {
        if (this.enabled && this.retries < MAX_RETRIES) {
          this.retries += 1;
          setTimeout(() => this.connect(), 1500 * this.retries);
        }
      };
      this.ws.onopen = () => {
        this.retries = 0;
      };
    } catch {
      // WebSocket unavailable — callers fall back to polling.
    }
  }

  private handleMessage(raw: string) {
    try {
      const payload = JSON.parse(raw) as WSChannelEvent;
      const set = this.listeners.get(payload.channel);
      set?.forEach((l) => l(payload));
    } catch {
      // ignore malformed frames
    }
  }

  on(channel: WSChannel, listener: ChannelListener) {
    if (!this.listeners.has(channel)) this.listeners.set(channel, new Set());
    this.listeners.get(channel)!.add(listener);
    return () => this.off(channel, listener);
  }

  off(channel: WSChannel, listener: ChannelListener) {
    this.listeners.get(channel)?.delete(listener);
  }

  disconnect() {
    this.enabled = false;
    this.ws?.close();
    this.ws = null;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let manager: WebSocketManager | null = null;

export function getSocketManager(): WebSocketManager | null {
  if (typeof window === "undefined") return null;
  if (!manager) {
    manager = new WebSocketManager(process.env.NEXT_PUBLIC_WS_URL ?? "");
  }
  return manager;
}