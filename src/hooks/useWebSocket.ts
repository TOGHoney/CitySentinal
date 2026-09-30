"use client";

import { useEffect, useRef } from "react";
import { getSocketManager, type WSChannel, type WSChannelEvent } from "@/lib/websocket";

export function useWebSocket(channel: WSChannel, handler: (event: WSChannelEvent) => void) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const manager = getSocketManager();
    if (!manager) return;
    manager.connect();
    const unsubscribe = manager.on(channel, (event) => handlerRef.current(event));
    return () => {
      unsubscribe();
    };
  }, [channel]);
}

export function useWebSocketConnection() {
  useEffect(() => {
    const manager = getSocketManager();
    manager?.connect();
    return () => manager?.disconnect();
  }, []);
}