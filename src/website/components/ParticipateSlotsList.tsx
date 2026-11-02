"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, Users, CheckCircle, Clock, PlusCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { TeamRegistration } from "@/lib/types";
import { getSocket } from "@/lib/socket-client";

export default function ParticipateSlotsList() {
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.teams)) {
        setTeams(data.teams);
      }
    } catch (e) {
      console.error("Failed to load participate teams:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();

    const socket = getSocket();

    const handleTeamsUpdate = (payload: any) => {
      if (Array.isArray(payload?.teams)) {
        setTeams(payload.teams);
      } else if (Array.isArray(payload)) {
        setTeams(payload);
      }
    };

    const handleTeamRegistered = (payload: any) => {
      if (payload?.team) {
        setTeams((prev) => {
          if (prev.some((t) => t.id === payload.team.id)) return prev;
          return [...prev, payload.team];
        });
      }
      if (Array.isArray(payload?.teams)) {
        setTeams(payload.teams);
      }
    };

    const handleTeamDeleted = (payload: any) => {
      if (payload?.teamId) {
        setTeams((prev) => prev.filter((t) => t.id !== payload.teamId));
      }
      if (Array.isArray(payload?.teams)) {
        setTeams(payload.teams);
      }
    };

    const handleTeamsReset = () => {
      setTeams([]);
    };

    const handlePaymentStatus = (payload: any) => {
      if (payload?.team) {
        setTeams((prev) =>
          prev.map((t) => (t.id === payload.team.id ? { ...t, ...payload.team } : t))
        );
      }
      if (Array.isArray(payload?.teams)) {
        setTeams(payload.teams);
      }
    };

    if (socket) {
      socket.on("teams:updated", handleTeamsUpdate);
      socket.on("team:registered", handleTeamRegistered);
      socket.on("team:deleted", handleTeamDeleted);
      socket.on("team:payment_status", handlePaymentStatus);
      socket.on("player:updated", handleTeamsUpdate);
      socket.on("teams:reset", handleTeamsReset);
    }

    const handleFocus = () => fetchTeams();
    window.addEventListener("focus", handleFocus);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "patelesp_price_sync") {
        fetchTeams();
      }
    };
    window.addEventListener("storage", handleStorage);

    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchTeams();
      }
    }, 5000);

    return () => {
      if (socket) {
        socket.off("teams:updated", handleTeamsUpdate);
        socket.off("team:registered", handleTeamRegistered);
        socket.off("team:deleted", handleTeamDeleted);
        socket.off("team:payment_status", handlePaymentStatus);
        socket.off("player:updated", handleTeamsUpdate);
        socket.off("teams:reset", handleTeamsReset);
      }
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchTeams]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

  // Map 12 slots
  const slots = Array.from({ length: 12 }, (_, i) => {
    const slotNumber = i + 1;
    const team = teams.find((t) => t.slotNumber === slotNumber);
    return {
      slotNumber,
      team,
    };
  });

  const filledCount = teams.length;
  const isFull = filledCount >= 12;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            Back to Tournament Home
          </Link>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-500" : ""}`} />
            Refresh Slots
          </button>
        </div>

        {/* Page Title & Slots Counter */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/40 border border-red-600/30 px-3.5 py-1 rounded-full mb-3">
            <Shield className="w-3.5 h-3.5" />
            Tournament Squad Roster
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            PARTICIPATING <span className="text-red-600">TEAMS</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Official 12 Custom Room Slots (48 Players Total). Check your assigned team slot below.
          </p>

          {/* Slots Status Meter */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-6 bg-zinc-950 border-2 border-zinc-800 px-6 py-3 rounded-2xl">
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">
                Slots Filled
              </span>
              <span className="text-2xl font-black text-white">
                {filledCount} <span className="text-sm text-gray-500 font-medium">/ 12 Teams</span>
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">
                Players Locked
              </span>
              <span className="text-2xl font-black text-white">
                {filledCount * 4} <span className="text-sm text-gray-500 font-medium">/ 48 Players</span>
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-xs text-gray-400 uppercase font-bold tracking-wider block">
                Status
              </span>
              <span className={`text-sm font-black uppercase ${isFull ? "text-red-500" : "text-green-500"}`}>
                {isFull ? "SLOTS FULL (12/12)" : `${12 - filledCount} SLOTS OPEN`}
              </span>
            </div>
          </div>

          {/* UTR Copy Notice */}
          <div className="mt-4 max-w-xl mx-auto bg-amber-950/60 border border-amber-500/60 rounded-xl p-2.5 flex items-center justify-center gap-2 text-center text-xs text-amber-200">
            <span className="bg-amber-500 text-black font-black uppercase text-[10px] px-1.5 py-0.5 rounded shrink-0">
              PAYMENT INFO
            </span>
            <span>
              Please copy your 12-digit UTR number after completing payment to verify your slot!
            </span>
          </div>
        </div>

        {/* 12 Slots Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-gray-400">Loading participating slots...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(({ slotNumber, team }) => (
              <div
                key={slotNumber}
                className={`rounded-2xl border-2 transition duration-200 flex flex-col justify-between p-6 ${
                  team
                    ? "bg-zinc-950 border-zinc-800 hover:border-red-600 shadow-lg shadow-black/50"
                    : "bg-black border-dashed border-zinc-850 hover:border-zinc-700"
                }`}
              >
                {/* Slot Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                        team
                          ? "bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                          : "bg-zinc-900 text-gray-400 border border-zinc-800"
                      }`}
                    >
                      SLOT #{slotNumber}
                    </span>

                    {team ? (
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-300 bg-red-950 border border-red-600 px-2 py-0.5 rounded-full shadow-sm">
                          SLOT IS BOOKED
                        </span>
                        {team.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/60 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            PAID
                          </span>
                        ) : team.paymentStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-950/80 border border-amber-500/60 px-2 py-0.5 rounded-full animate-pulse">
                            <Clock className="w-3 h-3 text-amber-400" />
                            PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-400 bg-yellow-950/60 border border-yellow-800/60 px-2 py-0.5 rounded-full">
                            UNPAID
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-zinc-900 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        AVAILABLE
                      </span>
                    )}
                  </div>

                  {team ? (
                    /* Registered Team Details */
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">
                        {team.teamName}
                      </h3>

                      {/* 4 Players List */}
                      <div className="space-y-2.5 bg-black border border-zinc-850 p-4 rounded-xl">
                        {/* Player 1 - IGL */}
                        <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-850">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                              1
                            </span>
                            <span className={`font-bold truncate max-w-[130px] ${team.igl.name ? "text-white" : "text-gray-500 italic"}`}>
                              {team.igl.name || "[Player Vacant]"}
                            </span>
                            <span className="text-[9px] uppercase font-black bg-red-950 text-red-400 px-1.5 py-0.5 rounded">
                              IGL
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {team.igl.uid ? `UID: ${team.igl.uid}` : "UID: N/A"}
                          </span>
                        </div>

                        {/* Player 2 */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-zinc-800 text-gray-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              2
                            </span>
                            <span className={`font-semibold truncate max-w-[140px] ${team.player2.name ? "text-gray-300" : "text-gray-500 italic"}`}>
                              {team.player2.name || "[Player Vacant]"}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {team.player2.uid ? `UID: ${team.player2.uid}` : "UID: N/A"}
                          </span>
                        </div>

                        {/* Player 3 */}
                        <div className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-zinc-800 text-gray-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              3
                            </span>
                            <span className={`font-semibold truncate max-w-[140px] ${team.player3.name ? "text-gray-300" : "text-gray-500 italic"}`}>
                              {team.player3.name || "[Player Vacant]"}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {team.player3.uid ? `UID: ${team.player3.uid}` : "UID: N/A"}
                          </span>
                        </div>

                        {/* Player 4 */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-zinc-800 text-gray-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              4
                            </span>
                            <span className={`font-semibold truncate max-w-[140px] ${team.player4.name ? "text-gray-300" : "text-gray-500 italic"}`}>
                              {team.player4.name || "[Player Vacant]"}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {team.player4.uid ? `UID: ${team.player4.uid}` : "UID: N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty Slot Placeholder */
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-600 mx-auto mb-3">
                        <Users className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-gray-400 uppercase">
                        Slot #{slotNumber} Open
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 mb-5">
                        Squad slot waiting for 4 players
                      </p>
                      <Link
                        href={`/#register?slot=${slotNumber}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase bg-zinc-900 hover:bg-red-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-zinc-800 hover:border-red-600 transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Claim Slot #{slotNumber}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Footer of card */}
                {team && (
                  <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-gray-500">
                    <span>Registered Squad</span>
                    <span className="font-mono text-gray-400">
                      {new Date(team.registeredAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
