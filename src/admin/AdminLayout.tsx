"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminLogin from "./components/AdminLogin";
import AdminNavbar from "./components/AdminNavbar";
import OverviewPage from "./components/OverviewPage";
import PricesPage from "./components/PricesPage";
import TeamsPage from "./components/TeamsPage";
import { TournamentData, TeamRegistration } from "@/lib/types";

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "prices" | "teams">("overview");

  // State
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Check persisted admin session
  useEffect(() => {
    try {
      const stored = localStorage.getItem("patelesp_admin_auth");
      if (stored === "2412") {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // localStorage unavailable fallback
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
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
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("patelesp_admin_auth");
    } catch (e) {}
    setIsAuthenticated(false);
  };

  const handleTournamentUpdated = (updated: TournamentData) => {
    setTournament(updated);
  };

  const handleTeamDeleted = (deletedId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== deletedId));
    fetchData();
  };

  const handleResetAll = () => {
    setTeams([]);
    fetchData();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingData ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">Connecting to PATELESP database...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewPage
                tournament={tournament}
                teams={teams}
                onNavigateToPrices={() => setActiveTab("prices")}
                onNavigateToTeams={() => setActiveTab("teams")}
              />
            )}

            {activeTab === "prices" && (
              <PricesPage
                tournament={tournament}
                onTournamentUpdated={handleTournamentUpdated}
              />
            )}

            {activeTab === "teams" && (
              <TeamsPage
                teams={teams}
                onTeamDeleted={handleTeamDeleted}
                onRefresh={fetchData}
                onResetAll={handleResetAll}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>PATELESP Esports Administration • Created &amp; Developed by Juned</p>
      </footer>
    </div>
  );
}
