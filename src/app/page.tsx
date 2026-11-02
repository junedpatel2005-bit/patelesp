"use client";

import React, { useState, useEffect, useCallback } from "react";
import WebsiteLayout from "@/website/WebsiteLayout";
import HeroPrizeBoxes from "@/website/components/HeroPrizeBoxes";
import RegistrationSection from "@/website/components/RegistrationSection";
import AboutSection from "@/website/components/AboutSection";
import FreeFireRules from "@/website/components/FreeFireRules";
import { TournamentData, TeamRegistration } from "@/lib/types";

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
    fetchData();

    // Live auto-refresh every 3 seconds to reflect admin price changes in real-time
    const interval = setInterval(fetchData, 3000);

    // Refresh immediately when tab gains focus
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", fetchData);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", fetchData);
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
        onRegistered={handleNewTeamRegistered}
      />

      {/* About PATELESP & QR Code next plan notice */}
      <AboutSection />

      {/* Official Free Fire Esports Rules */}
      <FreeFireRules />
    </WebsiteLayout>
  );
}
