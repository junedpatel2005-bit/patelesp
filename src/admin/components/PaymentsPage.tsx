"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Search,
  MessageCircle,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Shield,
  Smartphone,
  Users,
  Filter,
} from "lucide-react";
import { TournamentData, TeamRegistration } from "@/lib/types";

interface PaymentsPageProps {
  tournament: TournamentData | null;
  teams: TeamRegistration[];
  onRefresh: () => void;
}

export default function PaymentsPage({ tournament, teams, onRefresh }: PaymentsPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "unpaid">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  const squadPrice = Number(tournament?.squadPrice ?? 100);
  const maxTeams = tournament?.maxTeams ?? 12;

  // Financial Metrics
  const metrics = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let unpaidCount = 0;
    let totalCollected = 0;
    let totalPending = 0;

    for (const team of teams) {
      const amount = Number(team.paymentAmount || squadPrice);
      if (team.paymentStatus === "paid") {
        paidCount++;
        totalCollected += amount;
      } else if (team.paymentStatus === "pending") {
        pendingCount++;
        totalPending += amount;
      } else {
        unpaidCount++;
        totalPending += amount;
      }
    }

    const expectedTotal = teams.length * squadPrice;
    const maxCapacityTotal = maxTeams * squadPrice;
    const percentage = expectedTotal > 0 ? Math.round((totalCollected / expectedTotal) * 100) : 0;

    return {
      paidCount,
      pendingCount,
      unpaidCount,
      totalCollected,
      totalPending,
      expectedTotal,
      maxCapacityTotal,
      percentage,
    };
  }, [teams, squadPrice, maxTeams]);

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      // Status filter
      if (statusFilter !== "all") {
        const teamStatus = team.paymentStatus || "unpaid";
        if (teamStatus !== statusFilter) return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        team.teamName.toLowerCase().includes(q) ||
        team.igl.name.toLowerCase().includes(q) ||
        team.igl.phone.includes(q) ||
        (team.paymentUtr && team.paymentUtr.toLowerCase().includes(q)) ||
        String(team.slotNumber).includes(q)
      );
    });
  }, [teams, statusFilter, searchTerm]);

  // Toggle payment status
  const handleUpdatePayment = async (teamId: string, teamName: string, newStatus: "paid" | "unpaid") => {
    setUpdatingId(teamId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/teams/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          paymentStatus: newStatus,
          paymentAmount: squadPrice,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onRefresh();
        setActionMessage(
          newStatus === "paid"
            ? `Payment verified & approved for "${teamName}"!`
            : `Status changed to UNPAID for "${teamName}".`
        );
        setTimeout(() => setActionMessage(null), 4000);
      } else {
        alert(data.message || "Failed to update payment.");
      }
    } catch (e) {
      alert("Error updating payment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUtr(text);
      setTimeout(() => setCopiedUtr(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 border border-blue-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <CreditCard className="w-3.5 h-3.5" />
            Tournament Financial &amp; UPI Ledger
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            PAYMENT MANAGEMENT &amp; COLLECTIONS
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            Monitor squad entry fee collections, verify 12-digit UTR numbers, approve pending
            transactions, and send payment reminders directly to Team IGLs via WhatsApp.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-500/40 flex flex-wrap items-center gap-6 text-xs font-medium text-blue-100">
          <div>
            Entry Fee / Squad: <strong className="text-white text-sm">₹{squadPrice}</strong>
          </div>
          <div>•</div>
          <div>
            Payee UPI: <strong className="text-white font-mono">{tournament?.upiId || "junedpatel2005@okaxis"}</strong>
          </div>
          <div>•</div>
          <div>
            Recipient: <strong className="text-white">{tournament?.paymentName || "Juned Rafik Patel"}</strong>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 p-4 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Financial KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Collected */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Collected Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ₹{metrics.totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.paidCount} Squads Paid</span>
            <span className="font-bold text-emerald-700">{metrics.percentage}% Collected</span>
          </div>
        </div>

        {/* Card 2: Pending Revenue */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Pending Collection</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            ₹{metrics.totalPending.toLocaleString("en-IN")}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.pendingCount + metrics.unpaidCount} Squads Pending</span>
            <span className="font-bold text-amber-700">{metrics.pendingCount} Under Review</span>
          </div>
        </div>

        {/* Card 3: Target Revenue */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Total Registered Pool</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{metrics.expectedTotal.toLocaleString("en-IN")}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{teams.length} Registered Squads</span>
            <span className="text-slate-400">Max Cap: ₹{metrics.maxCapacityTotal}</span>
          </div>
        </div>

        {/* Card 4: Verified Ratio */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-500">Payment Status Ratio</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">
            {metrics.paidCount}{" "}
            <span className="text-sm font-semibold text-slate-400">/ {teams.length} Paid</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-semibold">{metrics.paidCount} Paid</span>
            <span className="text-slate-300">•</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-semibold">{metrics.pendingCount} Review</span>
            <span className="text-slate-300">•</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-600 font-semibold">{metrics.unpaidCount} Unpaid</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Team Name, IGL Name, Phone, or UTR..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                statusFilter === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({teams.length})
            </button>
            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Paid ({metrics.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pending ({metrics.pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter("unpaid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                statusFilter === "unpaid"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unpaid ({metrics.unpaidCount})
            </button>
          </div>
        </div>
      </div>

      {/* Payment Details Table */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black uppercase text-slate-900 tracking-tight">
              Squad Payment Breakdown ({filteredTeams.length} Records)
            </h3>
            <p className="text-xs text-slate-500">
              Review transaction proof and verify squad entries
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition"
            >
              Refresh Records
            </button>
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No payment records found.</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm ? "Try searching with a different term." : "No teams currently registered."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Slot &amp; Team</th>
                  <th className="py-3 px-4">IGL Contact</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">UTR / Transaction ID</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTeams.map((team) => {
                  const cleanPhone = (team.igl.phone || "").replace(/\D/g, "");
                  const reminderMsg = encodeURIComponent(
                    `Hello ${team.igl.name}! This is Juned from PATELESP. Please complete the squad entry fee of ₹${squadPrice} for "${team.teamName}" in Slot #${team.slotNumber} to confirm your room access.`
                  );
                  const waUrl = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${reminderMsg}`;

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* Slot & Team */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            #{team.slotNumber}
                          </span>
                          <div>
                            <span className="font-black text-slate-900 uppercase block text-sm">
                              {team.teamName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {team.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* IGL Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{team.igl.name}</div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{team.igl.phone}</span>
                          {cleanPhone && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 inline" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-slate-900">
                          ₹{team.paymentAmount || squadPrice}
                        </span>
                        <span className="text-[10px] text-slate-400 block">4 Players Squad</span>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4">
                        {team.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            🟢 PAID
                          </span>
                        ) : team.paymentStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            🟡 PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            🔴 UNPAID
                          </span>
                        )}
                      </td>

                      {/* UTR / Transaction ID */}
                      <td className="py-3.5 px-4">
                        {team.paymentUtr ? (
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded font-mono text-[11px] font-bold text-slate-800">
                            <span>{team.paymentUtr}</span>
                            <button
                              onClick={() => handleCopy(team.paymentUtr || "")}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy UTR"
                            >
                              {copiedUtr === team.paymentUtr ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No UTR provided</span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(team.registeredAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {team.paymentStatus === "paid" ? (
                            <button
                              onClick={() => handleUpdatePayment(team.id, team.teamName, "unpaid")}
                              disabled={updatingId === team.id}
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1.5 rounded-lg transition"
                              title="Change status to Unpaid"
                            >
                              <RotateCcw className="w-3 h-3 text-amber-600" />
                              <span>{updatingId === team.id ? "Updating..." : "Mark Unpaid"}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdatePayment(team.id, team.teamName, "paid")}
                              disabled={updatingId === team.id}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition shadow-sm shadow-emerald-500/20"
                              title="Approve & Verify Payment"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>{updatingId === team.id ? "Approving..." : "Approve"}</span>
                            </button>
                          )}

                          {/* Quick WhatsApp Reminder Link */}
                          {cleanPhone && team.paymentStatus !== "paid" && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1.5 rounded-lg transition"
                              title="Send WhatsApp payment reminder to IGL"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>Reminder</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
