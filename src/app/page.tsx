"use client";

import React, { useState, useEffect } from "react";
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

  const fetchData = async () => {
    try {
      const [tournRes, teamsRes] = await Promise.all([
        fetch("/api/tournament", { cache: "no-store" }),
        fetch("/api/teams", { cache: "no-store" }),
      ]);

      const tournData = await tournRes.json();
      const teamsData = await teamsRes.json();

      if (tournData.success) {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewTeamRegistered = (team: TeamRegistration) => {
    setTeams((prev) => [...prev, team]);
  };

  return (
    <WebsiteLayout>
      {/* Top Hero & 4 Prize Boxes (Squad Price, Winner, Runner Up, 3rd Number) */}
      <HeroPrizeBoxes tournament={tournament} loading={loading} />

      {/* Squad Registration Form (Team name, 4 player boxes, UID optional, IGL phone, 48 players / 12 teams max) */}
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
