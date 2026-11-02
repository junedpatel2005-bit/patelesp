"use client";

import React from "react";
import Link from "next/link";
import { Shield, Users, Trophy, DollarSign, ExternalLink, Smartphone } from "lucide-react";
import { TournamentData, TeamRegistration } from "@/lib/types";

interface OverviewPageProps {
  tournament: TournamentData | null;
  teams: TeamRegistration[];
  onNavigateToPrices: () => void;
  onNavigateToTeams: () => void;
  onCompleteTournament?: () => void;
}

export default function OverviewPage({
  tournament,
  teams,
  onNavigateToPrices,
  onNavigateToTeams,
  onCompleteTournament,
}: OverviewPageProps) {
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
  const totalCollected = paidTeams * squadPrice;

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
