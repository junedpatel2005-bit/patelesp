"use client";

import React from "react";
import { useSocket } from "@/lib/socket-client";
import { Radio } from "lucide-react";

interface LiveStatusBadgeProps {
  className?: string;
  theme?: "dark" | "light";
  showLabel?: boolean;
}

export default function LiveStatusBadge({
  className = "",
  theme = "dark",
  showLabel = true,
}: LiveStatusBadgeProps) {
  const { isConnected } = useSocket();

  if (theme === "light") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition ${
          isConnected
            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
            : "bg-amber-50 text-amber-700 border border-amber-300"
        } ${className}`}
        title={isConnected ? "Socket.IO Realtime Connected" : "Connecting to Realtime..."}
      >
        <span className="relative flex h-2 w-2">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            }`}
          />
        </span>
        {showLabel && (
          <span className="uppercase flex items-center gap-1">
            <Radio className="w-3 h-3" />
            {isConnected ? "Socket Live" : "Connecting"}
          </span>
        )}
      </div>
    );
  }

  // Dark theme (for Website and Dark panels)
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition ${
        isConnected
          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          : "bg-amber-950/60 text-amber-400 border border-amber-500/40"
      } ${className}`}
      title={isConnected ? "Socket.IO Realtime Sync Active" : "Connecting to Realtime..."}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
          }`}
        />
      </span>
      {showLabel && (
        <span className="uppercase flex items-center gap-1 font-mono tracking-tight">
          <Radio className="w-3 h-3" />
          {isConnected ? "Live Socket" : "Connecting"}
        </span>
      )}
    </div>
  );
}
