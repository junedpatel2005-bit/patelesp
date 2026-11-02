"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Trophy,
  DollarSign,
  ExternalLink,
  Smartphone,
  CheckCircle,
  Clock,
  RotateCcw,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { TournamentData, TeamRegistration } from "@/lib/types";

interface OverviewPageProps {
  tournament: TournamentData | null;
  teams: TeamRegistration[];
  onNavigateToPrices: () => void;
  onNavigateToTeams: () => void;
  onNavigateToPayments?: () => void;
  onRefresh?: () => void;
  onCompleteTournament?: () => void;
}

export default function OverviewPage({
  tournament,
  teams,
  onNavigateToPrices,
  onNavigateToTeams,
  onNavigateToPayments,
  onRefresh,
  onCompleteTournament,
}: OverviewPageProps) {
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const registeredTeams = teams.length;
  const maxTeams = tournament?.maxTeams ?? 12;
  const registeredPlayers = registeredTeams * 4;
  const maxPlayers = 48;
  const isFull = registeredTeams >= maxTeams;

  const squadPrice = tournament?.squadPrice ?? 100;
  const winnerPrize = tournament?.winnerPrize ?? 1000;
  const runnerUpPrize = tournament?.runnerUpPrize ?? 500;
  const thirdPrize = tournament?.thirdPrize ?? 250;
  const totalPrizePool = Number(winnerPrize) + Number(runnerUpPrize) + Number(thirdPrize);
  const paidTeams = teams.filter((t) => t.paymentStatus === "paid").length;
  const unpaidTeams = teams.filter((t) => (t.paymentStatus || "unpaid") !== "paid").length;
  const totalCollected = paidTeams * squadPrice;

  // Toggle Payment Status directly from Overview
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
        if (onRefresh) onRefresh();
        setActionMessage(
          newStatus === "paid"
            ? `Payment APPROVED for "${teamName}"! Slot is now confirmed.`
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

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            Tournament Information &amp; Status
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            PATELESP CONTROL DASHBOARD
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Welcome to the official esports organizer panel. From here you can configure squad prices, review prize change history, and manage all 12 registered squads (48 players).
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-500/40 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-blue-100">
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Platform: <strong className="text-white">Free Fire Mobile</strong>
            </span>
            <span>•</span>
            <span>
              Developer: <strong className="text-white">Juned</strong>
            </span>
            <span>•</span>
            <span>
              Support: <strong className="text-white">+91 8849596369</strong>
            </span>
          </div>

          {onCompleteTournament && (
            <button
              onClick={onCompleteTournament}
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase px-4 py-2 rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer"
              title="Finish match and reset all slots & payments for the next season"
            >
              <Trophy className="w-4 h-4 text-amber-900" />
              Tournament Completed &amp; Reset All
            </button>
          )}
        </div>
      </div>

      {/* Action Message Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-[10px] text-emerald-700 hover:underline uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Teams Registered */}
        <div
          onClick={onNavigateToTeams}
          className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500">
              Teams Registered
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {registeredTeams} <span className="text-sm font-semibold text-slate-400">/ {maxTeams} Squads</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Slots Remaining</span>
            <span className={`font-bold ${isFull ? "text-red-600" : "text-blue-600"}`}>
              {isFull ? "0 (Full)" : maxTeams - registeredTeams}
            </span>
          </div>
        </div>

        {/* Stat 2: Players Total */}
        <div
          onClick={onNavigateToTeams}
          className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500">
              Total Players
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {registeredPlayers} <span className="text-sm font-semibold text-slate-400">/ {maxPlayers} Max</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Per Squad</span>
            <span className="font-bold text-slate-700">4 Players</span>
          </div>
        </div>

        {/* Stat 3: Total Prize Pool */}
        <div
          onClick={onNavigateToPrices}
          className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500">
              Total Prize Pool
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">
            ₹{totalPrizePool.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">1st + 2nd + 3rd</span>
            <span className="font-bold text-blue-700">Edit in Tab 2 &rarr;</span>
          </div>
        </div>

        {/* Stat 4: Squad Entry Fee */}
        <div
          onClick={onNavigateToPrices}
          className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-slate-500">
              Squad Entry Fee
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{squadPrice.toLocaleString()}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-500">Collected</span>
            <span className="font-bold text-emerald-600">
              ₹{totalCollected.toLocaleString()} ({paidTeams}/{registeredTeams} Paid)
            </span>
          </div>
        </div>
      </div>

      {/* Live Registered Squads & Payment Status Section (Prominently visible directly on Overview) */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900 uppercase">
                Registered Squads &amp; Live Payment Status
              </h3>
              <span className="text-xs font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                {teams.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Teams immediately show here as soon as they submit registration. Review unverified/unpaid teams and approve payments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToTeams}
              className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold uppercase px-3.5 py-2 rounded-xl transition"
            >
              <Users className="w-3.5 h-3.5" />
              Manage All Teams &rarr;
            </button>
            {onNavigateToPayments && (
              <button
                onClick={onNavigateToPayments}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase px-3.5 py-2 rounded-xl transition"
              >
                Payments Tab &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Unpaid Attention Banner */}
        {unpaidTeams > 0 && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-red-900 uppercase">
                  {unpaidTeams} Squad(s) Registered with UNPAID Status
                </h4>
                <p className="text-[11px] text-red-700 mt-0.5">
                  These teams submitted the registration form on the website. Verify their UPI payment and click &quot;Approve Payment&quot; below.
                </p>
              </div>
            </div>
            <span className="shrink-0 hidden sm:inline-block text-xs font-extrabold uppercase bg-red-600 text-white px-3 py-1 rounded-lg">
              Action Required
            </span>
          </div>
        )}

        {/* Teams Table / Cards */}
        {teams.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 uppercase">No Squads Registered Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              When a team submits registration on the website, they will immediately show up here with their slot number and UNPAID status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Slot &amp; Squad Name</th>
                  <th className="py-3 px-4">IGL Contact</th>
                  <th className="py-3 px-4">Players</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">UTR / Ref</th>
                  <th className="py-3 px-4 text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {teams.map((team) => {
                  const cleanPhone = (team.igl.phone || "").replace(/\D/g, "");
                  const reminderMsg = encodeURIComponent(
                    `Hello ${team.igl.name}! This is Juned from PATELESP. Your squad "${team.teamName}" is in Slot #${team.slotNumber}. Please complete your entry fee payment of ₹${squadPrice} to confirm your slot.`
                  );
                  const waUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${reminderMsg}`;

                  return (
                    <tr key={team.id} className="hover:bg-slate-50/70 transition">
                      {/* Slot & Squad Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            #{team.slotNumber}
                          </span>
                          <div>
                            <span className="font-black text-slate-900 uppercase block text-sm">
                              {team.teamName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {team.id} • Registered: {new Date(team.registeredAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* IGL Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{team.igl.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{team.igl.phone}</span>
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="text-[10px]">Chat</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Players */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5 max-w-xs">
                          <div className="font-semibold text-slate-800 truncate">
                            1. {team.igl.name} <span className="text-[10px] text-blue-600 font-bold">(IGL)</span>
                          </div>
                          <div className="text-slate-500 truncate">
                            2. {team.player2.name || "-"} • 3. {team.player3.name || "-"} • 4. {team.player4.name || "-"}
                          </div>
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4">
                        {team.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            🟢 PAID (₹{team.paymentAmount || squadPrice})
                          </span>
                        ) : team.paymentStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            🟡 PENDING APPROVAL
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            🔴 UNPAID
                          </span>
                        )}
                      </td>

                      {/* UTR / Ref */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {team.paymentUtr ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            {team.paymentUtr}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None submitted</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {team.paymentStatus === "paid" ? (
                          <button
                            onClick={() => handleTogglePayment(team.id, team.teamName, "unpaid")}
                            disabled={updatingPaymentId === team.id}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-lg transition"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                            <span>{updatingPaymentId === team.id ? "Updating..." : "Mark Unpaid"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePayment(team.id, team.teamName, "paid")}
                            disabled={updatingPaymentId === team.id}
                            className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{updatingPaymentId === team.id ? "Approving..." : "Approve Payment"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Website Info & Live Summary */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase">
              Current Live Tournament Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Data actively being broadcasted on the public website
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            Visit Live Website
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Tournament Name</span>
              <span className="font-bold text-slate-900">{tournament?.name || "PATELESP"}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Match Day &amp; Date</span>
              <span className="font-bold text-blue-600">
                {tournament?.tournamentDay || "Sunday"}, {tournament?.tournamentDate || "08 November 2026"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Match &amp; Entry Time</span>
              <span className="font-bold text-slate-900">
                Start: {tournament?.tournamentTime || "09:00 PM"} (Entry: {tournament?.entryTime || "08:45 PM"})
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Official Payment Mobile</span>
              <span className="font-bold text-emerald-600">
                {tournament?.paymentNumber || "+919054358668"} ({tournament?.paymentName || "Juned Rafik Patel"})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Squad Entry Fee</span>
              <span className="font-bold text-slate-900">₹{squadPrice}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Winner 1st Prize</span>
              <span className="font-bold text-blue-600">₹{winnerPrize}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Runner Up 2nd Prize</span>
              <span className="font-bold text-slate-900">₹{runnerUpPrize}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">3rd Place Prize</span>
              <span className="font-bold text-slate-900">₹{thirdPrize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
