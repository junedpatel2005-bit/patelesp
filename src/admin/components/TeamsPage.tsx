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
  ArrowRightLeft,
  Gamepad2,
  LayoutGrid,
  List,
  Shield,
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
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"slots" | "list">("slots");

  // Move Slot State
  const [movingTeam, setMovingTeam] = useState<TeamRegistration | null>(null);
  const [targetSlot, setTargetSlot] = useState<number>(1);
  const [movingLoading, setMovingLoading] = useState(false);

  // Manual Add Squad State
  const [manualSlot, setManualSlot] = useState<number | null>(null);
  const [manualTeamName, setManualTeamName] = useState("");
  const [manualIglName, setManualIglName] = useState("");
  const [manualIglUid, setManualIglUid] = useState("");
  const [manualIglPhone, setManualIglPhone] = useState("");
  const [manualP2Name, setManualP2Name] = useState("");
  const [manualP2Uid, setManualP2Uid] = useState("");
  const [manualP3Name, setManualP3Name] = useState("");
  const [manualP3Uid, setManualP3Uid] = useState("");
  const [manualP4Name, setManualP4Name] = useState("");
  const [manualP4Uid, setManualP4Uid] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

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

  const paidCount = teams.filter((t) => t.paymentStatus === "paid").length;
  const unpaidCount = teams.filter((t) => (t.paymentStatus || "unpaid") !== "paid").length;

  const filteredTeams = teams.filter((team) => {
    if (statusFilter === "unpaid" && team.paymentStatus === "paid") return false;
    if (statusFilter === "paid" && team.paymentStatus !== "paid") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        team.teamName.toLowerCase().includes(q) ||
        team.igl.name.toLowerCase().includes(q) ||
        team.igl.phone.includes(q) ||
        team.player2.name.toLowerCase().includes(q) ||
        team.player3.name.toLowerCase().includes(q) ||
        team.player4.name.toLowerCase().includes(q) ||
        String(team.slotNumber).includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Toggle Payment Status (Paid / Unpaid)
  const handleTogglePayment = async (teamId: string, teamName: string, newStatus: "paid" | "unpaid") => {
    setUpdatingPaymentId(teamId);
    try {
      const res = await fetch("/api/teams/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paymentStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onRefresh();
        setActionMessage(
          newStatus === "paid"
            ? `Payment APPROVED for "${teamName}"! Slot is verified.`
            : `Payment marked as UNPAID for "${teamName}".`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to update payment status");
      }
    } catch (e) {
      alert("Error updating payment status. Please try again.");
    } finally {
      setUpdatingPaymentId(null);
    }
  };

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

  // 5. Move Team to another Slot
  const handleMoveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingTeam) return;
    setMovingLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: movingTeam.id,
          newSlotNumber: targetSlot,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Team "${movingTeam.teamName}" moved to Free Fire Custom Room Slot #${targetSlot}!`);
        setMovingTeam(null);
        onRefresh();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to move team slot");
      }
    } catch (err) {
      alert("Error moving team slot");
    } finally {
      setMovingLoading(false);
    }
  };

  // 6. Manual Add Team to a specific Slot by Admin
  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSlot) return;
    setManualError(null);
    setManualLoading(true);

    const cleanPhone = manualIglPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setManualError("Please enter a valid 10-digit WhatsApp/Phone Number for the IGL.");
      setManualLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: manualTeamName.trim(),
          slotNumber: manualSlot,
          igl: {
            name: manualIglName.trim(),
            uid: manualIglUid.trim(),
            phone: `+91${cleanPhone}`,
          },
          player2: { name: manualP2Name.trim(), uid: manualP2Uid.trim() },
          player3: { name: manualP3Name.trim(), uid: manualP3Uid.trim() },
          player4: { name: manualP4Name.trim(), uid: manualP4Uid.trim() },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage(`Team "${manualTeamName}" successfully assigned to Slot #${manualSlot}!`);
        setManualSlot(null);
        setManualTeamName("");
        setManualIglName("");
        setManualIglUid("");
        setManualIglPhone("");
        setManualP2Name("");
        setManualP2Uid("");
        setManualP3Name("");
        setManualP3Uid("");
        setManualP4Name("");
        setManualP4Uid("");
        onRefresh();
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        setManualError(data.message || "Failed to register squad");
      }
    } catch (err: any) {
      setManualError(err?.message || "Failed to register squad");
    } finally {
      setManualLoading(false);
    }
  };

  // 7. Reset All Teams
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

      {/* Move Slot Modal */}
      {movingTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-blue-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Move Squad to Different Room Slot
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Squad: <strong>{movingTeam.teamName}</strong> (Currently in Slot #{movingTeam.slotNumber})
                </p>
              </div>
              <button
                onClick={() => setMovingTeam(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Select New Custom Room Slot (1 to 12)
                </label>
                <select
                  value={targetSlot}
                  onChange={(e) => setTargetSlot(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const s = i + 1;
                    const occ = teams.find((t) => t.slotNumber === s && t.id !== movingTeam.id);
                    return (
                      <option key={s} value={s} disabled={Boolean(occ)}>
                        Slot #{s} {occ ? `(Occupied: ${occ.teamName})` : s === movingTeam.slotNumber ? "(Current Slot)" : "— Available / Empty"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                Notice: When you move this squad to Slot #{targetSlot}, make sure to notify the IGL so they sit in Slot #{targetSlot} inside Free Fire.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMovingTeam(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={movingLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {movingLoading ? "Moving Slot..." : `Move to Slot #${targetSlot}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Squad Modal */}
      {manualSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-blue-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Assign Squad to Room Slot #{manualSlot}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manually register a squad into this vacant room slot
                </p>
              </div>
              <button
                onClick={() => setManualSlot(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handleManualRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={manualTeamName}
                  onChange={(e) => setManualTeamName(e.target.value)}
                  placeholder="e.g. TEAM VIPER"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Player 1 - IGL */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-blue-700 uppercase block">1. Player 1 (IGL / Captain) *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualIglName}
                    onChange={(e) => setManualIglName(e.target.value)}
                    placeholder="IGL Name *"
                    required
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="tel"
                    value={manualIglPhone}
                    onChange={(e) => setManualIglPhone(e.target.value)}
                    placeholder="10-digit Phone/WhatsApp *"
                    required
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <input
                  type="text"
                  value={manualIglUid}
                  onChange={(e) => setManualIglUid(e.target.value)}
                  placeholder="Free Fire UID (Optional)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Player 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase block">2. Player 2 *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualP2Name}
                    onChange={(e) => setManualP2Name(e.target.value)}
                    placeholder="Player 2 Name *"
                    required
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={manualP2Uid}
                    onChange={(e) => setManualP2Uid(e.target.value)}
                    placeholder="Free Fire UID (Optional)"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Player 3 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase block">3. Player 3 *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualP3Name}
                    onChange={(e) => setManualP3Name(e.target.value)}
                    placeholder="Player 3 Name *"
                    required
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={manualP3Uid}
                    onChange={(e) => setManualP3Uid(e.target.value)}
                    placeholder="Free Fire UID (Optional)"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Player 4 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase block">4. Player 4 *</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={manualP4Name}
                    onChange={(e) => setManualP4Name(e.target.value)}
                    placeholder="Player 4 Name *"
                    required
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={manualP4Uid}
                    onChange={(e) => setManualP4Uid(e.target.value)}
                    placeholder="Free Fire UID (Optional)"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setManualSlot(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  {manualLoading ? "Assigning..." : `Assign to Slot #${manualSlot}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unpaid Squads Attention Banner */}
      {unpaidCount > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-sm">
              !
            </span>
            <div>
              <h3 className="text-sm font-black text-red-900 uppercase">
                {unpaidCount} Squad(s) Registered &bull; UNPAID Status
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Teams submitted their registration on the website. Verify their UPI payment and click &quot;Approve Payment&quot; on their card below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("unpaid")}
            className="text-xs font-black uppercase bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Show Unpaid Only ({unpaidCount})
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      {teams.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All ({totalTeams})
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "unpaid"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              }`}
            >
              <span>🔴 Unpaid</span>
              <span className="font-mono text-[11px] font-black">({unpaidCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <span>🟢 Paid</span>
              <span className="font-mono text-[11px] font-black">({paidCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("slots")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                  viewMode === "slots"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                12 Room Slots
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List View
              </button>
            </div>

            <div className="sm:max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, player, phone, slot..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
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
            When teams register through the website, their details (team name, 4 players, UIDs, and IGL phone number) will appear here instantly as UNPAID until approved.
          </p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">No teams match your filter criteria.</p>
          <button
            onClick={() => { setStatusFilter("all"); setSearchQuery(""); }}
            className="mt-2 text-xs font-bold text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === "slots" && !searchQuery.trim() && statusFilter === "all" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50 border border-blue-200 px-4 py-3 rounded-2xl text-xs text-blue-900 font-bold">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-blue-600" />
                <span>Free Fire Custom Room Roster &bull; 12 Slots Number-Wise</span>
              </span>
              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black self-start sm:self-auto">
                {totalTeams} / 12 SLOTS OCCUPIED
              </span>
            </div>
          )}

          {(viewMode === "slots" && !searchQuery.trim() && statusFilter === "all"
            ? Array.from({ length: 12 }, (_, i) => {
                const s = i + 1;
                return teams.find((t) => t.slotNumber === s) || ({ isVacant: true, slotNumber: s } as any);
              })
            : filteredTeams
          ).map((team) => {
            if ((team as any).isVacant) {
              const sNum = team.slotNumber;
              return (
                <div
                  key={`vacant-${sNum}`}
                  className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 font-black text-sm flex items-center justify-center">
                      #{sNum}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-700 uppercase">
                          Free Fire Custom Room Slot #{sNum} &bull; Vacant
                        </h4>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Open Slot
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Empty room slot waiting for 4 players
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setManualSlot(sNum);
                      setManualError(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer self-start sm:self-auto"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Assign Squad to Slot #{sNum}
                  </button>
                </div>
              );
            }

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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 uppercase">
                          {team.teamName}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                          SLOT {team.slotNumber}
                        </span>

                        {/* Paid / Unpaid Status Badge */}
                        {team.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            🟢 PAID (₹{team.paymentAmount || 100})
                          </span>
                        ) : team.paymentStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            🟡 PENDING APPROVAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            🔴 UNPAID
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Registered: {new Date(team.registeredAt).toLocaleString("en-IN")}
                        {team.paymentUtr && (
                          <span className="ml-2 text-emerald-700 font-bold font-mono">
                            • UTR: {team.paymentUtr}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions for Full Team */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Approve / Mark Payment Button */}
                    {team.paymentStatus === "paid" ? (
                      <button
                        onClick={() => handleTogglePayment(team.id, team.teamName, "unpaid")}
                        disabled={updatingPaymentId === team.id}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-2 rounded-xl transition cursor-pointer"
                        title="Revoke and mark as Unpaid"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>{updatingPaymentId === team.id ? "Updating..." : "Mark Unpaid"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTogglePayment(team.id, team.teamName, "paid")}
                        disabled={updatingPaymentId === team.id}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition shadow-sm shadow-emerald-500/20 cursor-pointer"
                        title="Approve & Mark Entry Fee as Paid"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{updatingPaymentId === team.id ? "Approving..." : "Approve Payment"}</span>
                      </button>
                    )}

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

                    {/* Move Slot Button */}
                    <button
                      type="button"
                      onClick={() => { setMovingTeam(team); setTargetSlot(team.slotNumber); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-2 rounded-xl transition cursor-pointer"
                      title="Move this squad to another custom room slot"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                      Move Slot
                    </button>

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
