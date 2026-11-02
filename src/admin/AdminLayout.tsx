"use client";

import React, { useState, useEffect, useCallback } from "react";
import AdminLogin from "./components/AdminLogin";
import AdminNavbar from "./components/AdminNavbar";
import OverviewPage from "./components/OverviewPage";
import PricesPage from "./components/PricesPage";
import TeamsPage from "./components/TeamsPage";
import PaymentsPage from "./components/PaymentsPage";
import { TournamentData, TeamRegistration } from "@/lib/types";
import { getSocket } from "@/lib/socket-client";

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"overview" | "prices" | "teams" | "payments">("overview");

  // State
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState<boolean>(false);
  const [completingTournament, setCompletingTournament] = useState<boolean>(false);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);

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
    if (!isAuthenticated) return;

    fetchData();

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

    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);

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
      window.removeEventListener("focus", handleFocus);
    };
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

  const handleCompleteTournament = async () => {
    setCompletingTournament(true);
    try {
      const res = await fetch("/api/tournament/complete", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeams([]);
        setShowCompleteConfirm(false);
        setCompleteMessage(
          "🏆 Tournament marked as COMPLETED! All 12 squad slots, players, and payment records have been reset for the next season."
        );
        setTimeout(() => setCompleteMessage(null), 6000);
        fetchData();
      } else {
        alert(data.message || "Failed to complete tournament.");
      }
    } catch (e) {
      alert("Error completing tournament. Please check internet connection.");
    } finally {
      setCompletingTournament(false);
    }
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
        onCompleteTournament={() => setShowCompleteConfirm(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tournament Completed Global Banner */}
        {completeMessage && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-lg flex items-center justify-between font-bold text-sm">
            <span>{completeMessage}</span>
            <button
              onClick={() => setCompleteMessage(null)}
              className="text-xs bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 px-3 py-1 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}
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
                onCompleteTournament={() => setShowCompleteConfirm(true)}
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

            {activeTab === "payments" && (
              <PaymentsPage
                tournament={tournament}
                teams={teams}
                onRefresh={fetchData}
              />
            )}
          </>
        )}
      </main>

      {/* Confirmation Modal: Tournament Completed & Reset Everything */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
              🏆
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-900 tracking-tight">
              Mark Tournament as Completed?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will officially conclude the current match and <strong>reset all 12 registered squads (48 players)</strong>, release all slots, and clear payment records. All website visitors and players will see 12 fresh open slots ready for the next tournament!
            </p>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 font-semibold text-left">
              ⚠️ Note: This action resets live teams in both the local database and Supabase cloud. Real-time updates will broadcast instantly across all connected screens via Socket.IO.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setShowCompleteConfirm(false)}
                disabled={completingTournament}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteTournament}
                disabled={completingTournament}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs uppercase py-3 rounded-xl transition shadow-md shadow-amber-500/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {completingTournament ? "Resetting Everything..." : "Yes, Complete & Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>PATELESP Esports Administration • Created &amp; Developed by Juned</p>
      </footer>
    </div>
  );
}
