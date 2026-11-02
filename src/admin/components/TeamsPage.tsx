"use client";

import React, { useState } from "react";
import {
  Users,
  Phone,
  MessageCircle,
  Trash2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  RotateCcw,
  UserX,
  Edit2,
  Check,
  X,
  PlusCircle,
} from "lucide-react";
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
  const [deletingPlayer, setDeletingPlayer] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Edit Player State
  const [editingTarget, setEditingTarget] = useState<{
    teamId: string;
    playerKey: "igl" | "player2" | "player3" | "player4";
    label: string;
    currentName: string;
    currentUid: string;
    currentPhone?: string;
  } | null>(null);

  const [editName, setEditName] = useState("");
  const [editUid, setEditUid] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingPlayer, setSavingPlayer] = useState(false);

  const totalTeams = teams.length;
  const totalPlayers = totalTeams * 4;
  const maxTeams = 12;
  const maxPlayers = 48;
  const isFull = totalTeams >= maxTeams;

  // 1. Delete Full Team
  const handleDeleteFullTeam = async (teamId: string, teamName: string, slotNumber: number) => {
    const shouldDelete =
      typeof window !== "undefined"
        ? window.confirm(
            `Are you sure you want to remove the FULL TEAM "${teamName}" from Slot #${slotNumber}? This will free up Slot #${slotNumber} for a new squad.`
          )
        : true;

    if (!shouldDelete) {
      return;
    }

    setDeletingId(teamId);
    setActionMessage(null);

    try {
      const res = await fetch(
        `/api/teams?teamId=${encodeURIComponent(teamId)}&slot=${slotNumber}`,
        {
          method: "DELETE",
          headers: { "Cache-Control": "no-cache" },
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        onTeamDeleted(teamId);
        onRefresh();
        setActionMessage(
          `Full team "${teamName}" deleted successfully. Slot #${slotNumber} is now free!`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to delete team");
      }
    } catch (e) {
      alert("Error deleting team. Please check internet connection.");
    } finally {
      setDeletingId(null);
    }
  };

  // 2. Delete Single Player from Team
  const handleDeletePlayer = async (
    teamId: string,
    teamName: string,
    playerKey: "igl" | "player2" | "player3" | "player4",
    playerName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to DELETE player "${playerName || "this player"}" from team "${teamName}"?`
      )
    ) {
      return;
    }

    setDeletingPlayer(`${teamId}-${playerKey}`);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/teams?teamId=${teamId}&playerKey=${playerKey}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Player deleted from "${teamName}".`);
        onRefresh();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to delete player");
      }
    } catch (e) {
      alert("Error deleting player");
    } finally {
      setDeletingPlayer(null);
    }
  };

  // 3. Open Edit Player Modal
  const handleOpenEdit = (
    teamId: string,
    playerKey: "igl" | "player2" | "player3" | "player4",
    label: string,
    currentName: string,
    currentUid: string,
    currentPhone?: string
  ) => {
    setEditingTarget({
      teamId,
      playerKey,
      label,
      currentName,
      currentUid,
      currentPhone,
    });
    setEditName(currentName || "");
    setEditUid(currentUid || "");
    setEditPhone(currentPhone || "");
  };

  // 4. Save Edited Player
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setSavingPlayer(true);
    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: editingTarget.teamId,
          playerKey: editingTarget.playerKey,
          playerInfo: {
            name: editName.trim(),
            uid: editUid.trim(),
            phone: editPhone.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Player details updated successfully!`);
        setEditingTarget(null);
        onRefresh();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to update player");
      }
    } catch (e) {
      alert("Error updating player");
    } finally {
      setSavingPlayer(false);
    }
  };

  // 5. Reset All Teams
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
                Registered Teams &amp; Player Management
              </h2>
              <p className="text-xs text-slate-500">
                Delete full teams or remove/edit individual players inside any squad
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
                Reset All Teams
              </button>
            )}
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
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

      {/* Edit / Substitute Player Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 uppercase">
                Edit Player &bull; {editingTarget.label}
              </h3>
              <button
                onClick={() => setEditingTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Player Name"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Free Fire UID (Optional)
                </label>
                <input
                  type="text"
                  value={editUid}
                  onChange={(e) => setEditUid(e.target.value)}
                  placeholder="e.g. 512893471"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {editingTarget.playerKey === "igl" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    IGL Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10-digit WhatsApp number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlayer}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Check className="w-4 h-4" />
                  {savingPlayer ? "Saving..." : "Save Player"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            const cleanPhone = (team.igl.phone || "").replace(/[^0-9]/g, "");
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

                  {/* Actions for Full Team */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp IGL Button */}
                    {team.igl.phone && (
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
                    )}

                    {/* Delete Full Team Button */}
                    <button
                      onClick={() => handleDeleteFullTeam(team.id, team.teamName, team.slotNumber)}
                      disabled={deletingId === team.id}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-2 rounded-xl transition cursor-pointer"
                      title="Remove full team and release slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === team.id ? "Removing..." : "Delete Full Team"}</span>
                    </button>
                  </div>
                </div>

                {/* Team-Wise 4 Players Details Grid with Delete & Edit for EACH player */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Player 1 (IGL) */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Player 1 (IGL)
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleOpenEdit(
                                team.id,
                                "igl",
                                "Player 1 (IGL)",
                                team.igl.name,
                                team.igl.uid || "",
                                team.igl.phone
                              )
                            }
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit / Change IGL"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {team.igl.name && (
                            <button
                              onClick={() =>
                                handleDeletePlayer(team.id, team.teamName, "igl", team.igl.name)
                              }
                              disabled={deletingPlayer === `${team.id}-igl`}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete this player from squad"
                            >
                              <UserX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {team.igl.name ? (
                        <>
                          <div className="font-black text-slate-900 text-sm truncate">
                            {team.igl.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            UID: {team.igl.uid || "Not Provided"}
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-xs text-red-500 font-bold">
                          [Player Removed / Vacant]
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs text-blue-800 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{team.igl.phone || "No Phone"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          Player 2
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleOpenEdit(
                                team.id,
                                "player2",
                                "Player 2",
                                team.player2.name,
                                team.player2.uid || ""
                              )
                            }
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit / Replace Player 2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {team.player2.name && (
                            <button
                              onClick={() =>
                                handleDeletePlayer(team.id, team.teamName, "player2", team.player2.name)
                              }
                              disabled={deletingPlayer === `${team.id}-player2`}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete this player from squad"
                            >
                              <UserX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {team.player2.name ? (
                        <>
                          <div className="font-black text-slate-900 text-sm truncate">
                            {team.player2.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            UID: {team.player2.uid || "Not Provided"}
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-xs text-red-500 font-bold">
                          [Player Removed / Vacant]
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Squad Member</span>
                      {!team.player2.name && (
                        <button
                          onClick={() =>
                            handleOpenEdit(team.id, "player2", "Player 2", "", "")
                          }
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[10px]"
                        >
                          <PlusCircle className="w-3 h-3" /> Add Player
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Player 3 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          Player 3
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleOpenEdit(
                                team.id,
                                "player3",
                                "Player 3",
                                team.player3.name,
                                team.player3.uid || ""
                              )
                            }
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit / Replace Player 3"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {team.player3.name && (
                            <button
                              onClick={() =>
                                handleDeletePlayer(team.id, team.teamName, "player3", team.player3.name)
                              }
                              disabled={deletingPlayer === `${team.id}-player3`}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete this player from squad"
                            >
                              <UserX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {team.player3.name ? (
                        <>
                          <div className="font-black text-slate-900 text-sm truncate">
                            {team.player3.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            UID: {team.player3.uid || "Not Provided"}
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-xs text-red-500 font-bold">
                          [Player Removed / Vacant]
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Squad Member</span>
                      {!team.player3.name && (
                        <button
                          onClick={() =>
                            handleOpenEdit(team.id, "player3", "Player 3", "", "")
                          }
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[10px]"
                        >
                          <PlusCircle className="w-3 h-3" /> Add Player
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Player 4 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          Player 4
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleOpenEdit(
                                team.id,
                                "player4",
                                "Player 4",
                                team.player4.name,
                                team.player4.uid || ""
                              )
                            }
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit / Replace Player 4"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {team.player4.name && (
                            <button
                              onClick={() =>
                                handleDeletePlayer(team.id, team.teamName, "player4", team.player4.name)
                              }
                              disabled={deletingPlayer === `${team.id}-player4`}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete this player from squad"
                            >
                              <UserX className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {team.player4.name ? (
                        <>
                          <div className="font-black text-slate-900 text-sm truncate">
                            {team.player4.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            UID: {team.player4.uid || "Not Provided"}
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-center text-xs text-red-500 font-bold">
                          [Player Removed / Vacant]
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Squad Member</span>
                      {!team.player4.name && (
                        <button
                          onClick={() =>
                            handleOpenEdit(team.id, "player4", "Player 4", "", "")
                          }
                          className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[10px]"
                        >
                          <PlusCircle className="w-3 h-3" /> Add Player
                        </button>
                      )}
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
