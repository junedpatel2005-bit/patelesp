"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

/**
 * Get or create the singleton Socket.IO client instance
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socketInstance) {
    // When in browser, connect to current origin using standard /socket.io path
    socketInstance = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket.IO Client] Connected to real-time server (ID: ${socketInstance?.id})`);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn(`[Socket.IO Client] Connection warning:`, err.message);
    });
  }

  if (socketInstance && !socketInstance.connected) {
    socketInstance.connect();
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
