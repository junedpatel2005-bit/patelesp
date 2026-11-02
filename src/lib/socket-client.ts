"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/**
 * Check if the current environment supports persistent WebSockets.
 * Vercel is a serverless platform that does NOT support long-lived WebSockets.
 */
function isWebSocketSupported(): boolean {
  if (typeof window === "undefined") return false;
  // Disable WebSocket on Vercel domain to prevent console spam
  if (window.location.hostname.includes("vercel.app")) {
    return false;
  }
  return true;
}

/**
 * Get or create the singleton Socket.IO client instance
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined" || !isWebSocketSupported()) {
    return null;
  }

  if (!socketInstance) {
    try {
      socketInstance = io({
        path: "/socket.io",
        transports: ["polling", "websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 2, // Stop retrying after 2 attempts to keep console clean
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      socketInstance.on("connect", () => {
        // Connected silently
      });

      socketInstance.on("disconnect", () => {
        // Disconnected silently
      });

      socketInstance.on("connect_error", () => {
        // Silently disconnect if failed so console stays clean
        socketInstance?.disconnect();
      });
    } catch (e) {
      return null;
    }
  }

  return socketInstance;
}

/**
 * React hook for using Socket.IO in components with real-time connection state
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    setSocket(s);
    setIsConnected(s.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, isConnected };
}
