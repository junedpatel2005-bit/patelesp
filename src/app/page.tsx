"use client";

import React, { useState, useEffect, useCallback } from "react";
import WebsiteLayout from "@/website/WebsiteLayout";
import HeroPrizeBoxes from "@/website/components/HeroPrizeBoxes";
import RegistrationSection from "@/website/components/RegistrationSection";
import AboutSection from "@/website/components/AboutSection";
import FreeFireRules from "@/website/components/FreeFireRules";
import { TournamentData, TeamRegistration } from "@/lib/types";
import { getSocket } from "@/lib/socket-client";

export default function HomePage() {
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Append cache buster to guarantee real-time fresh data from database
      const timestamp = Date.now();
      const [tournRes, teamsRes] = await Promise.all([
        fetch(`/api/tournament?_t=${timestamp}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        }),
        fetch(`/api/teams?_t=${timestamp}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
        }),
      ]);

      const tournData = await tournRes.json();
      const teamsData = await teamsRes.json();

      if (tournData.success && tournData.tournament) {
        setTournament(tournData.tournament);
      }
      if (teamsData.success && Array.isArray(teamsData.teams)) {
        setTeams(teamsData.teams);
      }
    } catch (err) {
      console.error("Failed to load tournament data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Setup real-time Socket.IO subscriptions
    const socket = getSocket();

    const handleTournamentUpdate = (payload: any) => {
      if (payload?.tournament) {
        setTournament(payload.tournament);
      } else if (payload && typeof payload === "object" && "squadPrice" in payload) {
        setTournament(payload);
      }
    };

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

    if (socket) {
      socket.on("tournament:updated", handleTournamentUpdate);
      socket.on("prices:updated", handleTournamentUpdate);
      socket.on("teams:updated", handleTeamsUpdate);
      socket.on("team:registered", handleTeamRegistered);
      socket.on("team:deleted", handleTeamDeleted);
      socket.on("player:updated", handleTeamsUpdate);
      socket.on("teams:reset", handleTeamsReset);
    }

    // Refresh immediately when tab gains focus
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "patelesp_price_sync") {
        fetchData();
      }
    };

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchData);
    window.addEventListener("storage", handleStorage);

    // Periodic live sync every 5 seconds while page is open
    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    }, 5000);

    return () => {
      if (socket) {
        socket.off("tournament:updated", handleTournamentUpdate);
        socket.off("prices:updated", handleTournamentUpdate);
        socket.off("teams:updated", handleTeamsUpdate);
        socket.off("team:registered", handleTeamRegistered);
        socket.off("team:deleted", handleTeamDeleted);
        socket.off("player:updated", handleTeamsUpdate);
        socket.off("teams:reset", handleTeamsReset);
      }
      clearInterval(pollInterval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchData);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchData]);

  const handleNewTeamRegistered = (team: TeamRegistration) => {
    setTeams((prev) => [...prev, team]);
    fetchData();
  };

  return (
    <WebsiteLayout>
      {/* Top Hero & 4 Prize Cards with live database sync */}
      <HeroPrizeBoxes tournament={tournament} loading={loading} />

      {/* Squad Registration Form (Team name, 4 player boxes, UID optional, IGL phone) */}
      <RegistrationSection
        teamsCount={teams.length}
        maxTeams={tournament?.maxTeams ?? 12}
        teams={teams}
        tournament={tournament}
        onRegistered={handleNewTeamRegistered}
      />

      {/* About PATELESP & QR Code next plan notice */}
      <AboutSection />

      {/* Official Free Fire Esports Rules */}
      <FreeFireRules tournament={tournament} />
    </WebsiteLayout>
  );
}
