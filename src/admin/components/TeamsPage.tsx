"use client";

import React, { useState } from "react";
import { Users, Phone, MessageCircle, Trash2, Shield, AlertCircle, RefreshCw, CheckCircle, RotateCcw } from "lucide-react";
import { TeamRegistration } from "@/lib/types";

interface TeamsPageProps {
  teams: TeamRegistration[];
  onTeamDeleted: (teamId: string) => void;
  onRefresh: () => void;
  onResetAll: () => void;
}

export default function TeamsPage({
  teams,
  onTeamDeleted,
  onRefresh,
  onResetAll,
}: TeamsPageProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const totalTeams = teams.length;
  const totalPlayers = totalTeams * 4;
  const maxTeams = 12;
  const maxPlayers = 48;
  const isFull = totalTeams >= maxTeams;

  const handleDelete = async (teamId: string, teamName: string, slotNumber: number) => {
    if (!confirm(`Are you sure you want to remove team "${teamName}" from Slot #${slotNumber}? This will free up the slot for another squad.`)) {
      return;
    }

    setDeletingId(teamId);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/teams?teamId=${teamId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        onTeamDeleted(teamId);
        setActionMessage(`Team "${teamName}" removed successfully. Slot #${slotNumber} is now free!`);
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to delete team");
      }
    } catch (e) {
      alert("Error deleting team");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmReset = async () => {
    try {
      const res = await fetch("/api/teams?reset=true", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        onResetAll();
        setShowResetConfirm(false);
        setActionMessage("All teams have been reset. All 12 slots are now open!");
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (e) {
      alert("Failed to reset teams");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Capacity Overview */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                Page 3: Registered Teams (12 Teams / 48 Players)
              </h2>
              <p className="text-xs text-slate-500">
                Team-wise breakdown showing all 4 players per squad, IGL contact, and slot assignment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            {teams.length > 0 && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Action message */}
        {actionMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-5 text-red-900">
            <div className="flex items-center gap-2 font-black text-sm text-red-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              CONFIRM TOURNAMENT ROSTER RESET
            </div>
            <p className="text-xs text-red-600 mb-4">
              Are you sure you want to remove ALL registered teams? This cannot be undone. All 12 slots will be reset to open.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmReset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                YES, RESET ALL TEAMS
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-white border border-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Capacity Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Registered Teams
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalTeams} <span className="text-sm font-semibold text-slate-500">/ {maxTeams} Max</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Registered Players
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalPlayers} <span className="text-sm font-semibold text-slate-500">/ {maxPlayers} Max</span>
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">
              Website Slot Status
            </span>
            <span className={`text-base font-black uppercase ${isFull ? "text-red-600" : "text-emerald-600"}`}>
              {isFull ? "🔴 SLOTS FULL (48/48)" : `🟢 ${maxTeams - totalTeams} SLOTS AVAILABLE`}
            </span>
          </div>
        </div>
      </div>

      {/* Team-Wise View (Each Team With 4 Players) */}
      {teams.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 uppercase">
            No Teams Registered Yet
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When teams register through the website, their details (team name, 4 players, UIDs, and IGL phone number) will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {teams.map((team) => {
            const cleanPhone = team.igl.phone.replace(/[^0-9]/g, "");
            const whatsappMsg = encodeURIComponent(
              `Hello ${team.igl.name}! This is Juned from PATELESP. Your squad "${team.teamName}" is assigned to SLOT #${team.slotNumber}. Here are your tournament details:`
            );
            const iglWhatsAppUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${whatsappMsg}`;

            return (
              <div
                key={team.id}
                className="bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-6 shadow-sm transition"
              >
                {/* Team Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm shadow-blue-500/30">
                      #{team.slotNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 uppercase">
                          {team.teamName}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                          SLOT {team.slotNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Registered: {new Date(team.registeredAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Team */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp IGL Button */}
                    <a
                      href={iglWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition shadow-sm shadow-emerald-500/20"
                      title="Send Room ID & Password to IGL via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat with IGL
                    </a>

                    {/* Delete Team Button */}
                    <button
                      onClick={() => handleDelete(team.id, team.teamName, team.slotNumber)}
                      disabled={deletingId === team.id}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-2 rounded-xl transition"
                      title="Remove team and release slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === team.id ? "Removing..." : "Delete"}</span>
                    </button>
                  </div>
                </div>

                {/* Team-Wise 4 Players Details Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Player 1 (IGL) */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        Player 1 (IGL)
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Captain</span>
                    </div>
                    <div className="font-black text-slate-900 text-sm truncate">
                      {team.igl.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      UID: {team.igl.uid || "Not Provided"}
                    </div>
                    <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center gap-1.5 text-xs text-blue-800 font-bold">
                      <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>{team.igl.phone}</span>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded inline-block mb-1.5">
                      Player 2
                    </span>
                    <div className="font-black text-slate-900 text-sm truncate">
                      {team.player2.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      UID: {team.player2.uid || "Not Provided"}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                      Squad Member
                    </div>
                  </div>

                  {/* Player 3 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded inline-block mb-1.5">
                      Player 3
                    </span>
                    <div className="font-black text-slate-900 text-sm truncate">
                      {team.player3.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      UID: {team.player3.uid || "Not Provided"}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                      Squad Member
                    </div>
                  </div>

                  {/* Player 4 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded inline-block mb-1.5">
                      Player 4
                    </span>
                    <div className="font-black text-slate-900 text-sm truncate">
                      {team.player4.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      UID: {team.player4.uid || "Not Provided"}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400">
                      Squad Member
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
