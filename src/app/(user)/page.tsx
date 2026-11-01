"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Trophy, Flame, Users, Calendar, Clock, MapPin, 
  ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2, ChevronRight 
} from "lucide-react";
import { TournamentConfig, TeamRegistration } from "@/lib/types";

export default function HomePage() {
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tournRes, teamsRes] = await Promise.all([
          fetch("/api/tournament"),
          fetch("/api/teams"),
        ]);
        const tournData = await tournRes.json();
        const teamsData = await teamsRes.json();

        if (tournData.success) setTournament(tournData.tournament);
        if (teamsData.success) setTeams(teamsData.teams);
      } catch (err) {
        console.error("Error loading tournament:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const approvedTeams = teams.filter((t) => t.status === "approved");
  const maxSlots = tournament?.maxSlots || 48;
  const filledSlots = approvedTeams.length;
  const progressPercent = Math.min(100, Math.round((filledSlots / maxSlots) * 100));

  return (
    <div className="relative min-h-screen bg-dark-950 bg-grid-pattern">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fire-500/10 border border-fire-500/30 text-fire-400 text-xs sm:text-sm font-bold tracking-wide shadow-glow-fire/40 animate-pulse-slow">
              <span className="w-2 h-2 rounded-full bg-fire-500 live-indicator" />
              REGISTRATION LIVE • 4-PLAYER SQUAD
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark-900 border border-dark-750 text-gray-300 text-xs font-semibold">
              <span>Created by</span>
              <strong className="text-fire-400">Juned Patel</strong>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-none">
            PATEL<span className="text-fire-500">ESP</span> FREE FIRE <br />
            <span className="text-transparent bg-clip-text bg-fire-gradient">SQUAD CUP</span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Assemble your 4-player squad, survive the battleground, and take home verified cash rewards. Official Free Fire tournament organized by <strong className="text-white">PATELESP</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-base uppercase tracking-wider bg-fire-gradient text-white shadow-glow-fire hover:brightness-110 active:scale-95 transition-all group"
            >
              <Flame className="w-5 h-5 text-white animate-bounce" />
              Register Squad (₹{tournament?.entryFee || 50})
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/ticket/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-bold text-sm tracking-wide bg-dark-900 border border-dark-750 hover:border-fire-500/50 text-gray-200 hover:text-white transition-all"
            >
              Check Team Ticket & Room ID
            </Link>
          </div>
        </div>

        {/* PRIZE POOL & ENTRY AMOUNT SHOWCASE */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* 1st Prize Winner */}
          <div className="relative gaming-card rounded-2xl p-6 sm:p-8 text-center border-gold-500/30 overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl group-hover:bg-gold-500/20 transition-all" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center mb-4 text-gold-400 shadow-glow-gold">
              <Trophy className="w-7 h-7" />
            </div>
            <span className="text-xs font-black tracking-widest text-gold-400 uppercase bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
              CHAMPION SQUAD
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-3 text-glow-gold">
              ₹{tournament ? tournament.firstPrize.toLocaleString() : "1,000"}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">1st Place Winner Cash Prize</p>
          </div>

          {/* Entry Fee (Center Highlight) */}
          <div className="relative gaming-card rounded-2xl p-6 sm:p-8 text-center border-fire-500/40 overflow-hidden bg-fire-950/20 shadow-glow-fire/30">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-fire-500/20 border border-fire-500/40 flex items-center justify-center mb-4 text-fire-400 shadow-glow-fire">
              <Flame className="w-7 h-7" />
            </div>
            <span className="text-xs font-black tracking-widest text-fire-400 uppercase bg-fire-500/10 px-3 py-1 rounded-full border border-fire-500/20">
              ENTRY AMOUNT
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-3 text-glow-fire">
              ₹{tournament ? tournament.entryFee : "50"}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">Per 4-Player Squad Registration</p>
          </div>

          {/* 2nd Prize Runner-Up */}
          <div className="relative gaming-card rounded-2xl p-6 sm:p-8 text-center border-cyber-500/30 overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyber-500/10 rounded-full blur-2xl group-hover:bg-cyber-500/20 transition-all" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-cyber-500/20 border border-cyber-500/40 flex items-center justify-center mb-4 text-cyber-400 shadow-glow-cyber">
              <Trophy className="w-7 h-7" />
            </div>
            <span className="text-xs font-black tracking-widest text-cyber-400 uppercase bg-cyber-500/10 px-3 py-1 rounded-full border border-cyber-500/20">
              RUNNER-UP SQUAD
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white mt-3 text-glow-cyber">
              ₹{tournament ? tournament.secondPrize.toLocaleString() : "500"}
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">2nd Place Cash Prize</p>
          </div>
        </div>

        {/* SLOT TRACKER BAR */}
        <div className="mt-12 max-w-4xl mx-auto gaming-card rounded-2xl p-6 border-dark-750">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-fire-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tournament Slots Availability</h3>
                <p className="text-xs text-gray-400">Total {maxSlots} Squads Allowed in Custom Room</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-fire-400">{filledSlots}</span>
              <span className="text-xs text-gray-400">/ {maxSlots} Squads Filled</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-dark-900 rounded-full h-3.5 p-0.5 border border-dark-800 overflow-hidden">
            <div
              className="bg-fire-gradient h-full rounded-full transition-all duration-700 shadow-glow-fire"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2">
            <span>{maxSlots - filledSlots} Slots Remaining</span>
            <span className="text-fire-400 font-semibold">{progressPercent}% Locked</span>
          </div>
        </div>

        {/* TOURNAMENT MATCH SPECIFICATIONS */}
        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="gaming-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-fire-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Map</p>
              <p className="text-sm font-bold text-white">{tournament?.map || "Bermuda"}</p>
            </div>
          </div>

          <div className="gaming-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-cyber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Squad Format</p>
              <p className="text-sm font-bold text-white">4 Players (Squad)</p>
            </div>
          </div>

          <div className="gaming-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Match Date</p>
              <p className="text-sm font-bold text-white">{tournament?.matchDate || "Next Sunday"}</p>
            </div>
          </div>

          <div className="gaming-card rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-green-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase font-semibold">Match Time</p>
              <p className="text-sm font-bold text-white">{tournament?.matchTime || "08:30 PM IST"}</p>
            </div>
          </div>
        </div>

        {/* HOW TO PARTICIPATE (4 STEPS) */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-fire-400 tracking-widest uppercase">EASY REGISTRATION</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">HOW TO ENTER THE TOURNAMENT</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="gaming-card rounded-2xl p-6 relative">
              <div className="text-3xl font-black text-dark-700 mb-2">01</div>
              <h4 className="text-base font-bold text-white mb-2">Enter Squad Details</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Provide your Team Name and all 4 Players&apos; in-game names and Free Fire UIDs.
              </p>
            </div>

            <div className="gaming-card rounded-2xl p-6 relative">
              <div className="text-3xl font-black text-dark-700 mb-2">02</div>
              <h4 className="text-base font-bold text-white mb-2">Pay ₹{tournament?.entryFee || 50} Entry Fee</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scan the official PATELESP UPI QR code with GPay/PhonePe and enter the 12-digit UTR.
              </p>
            </div>

            <div className="gaming-card rounded-2xl p-6 relative">
              <div className="text-3xl font-black text-dark-700 mb-2">03</div>
              <h4 className="text-base font-bold text-white mb-2">Get Team Ticket</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Save your unique digital Team Ticket ID. Once Admin verifies, status turns APPROVED.
              </p>
            </div>

            <div className="gaming-card rounded-2xl p-6 relative border-fire-500/40">
              <div className="text-3xl font-black text-fire-500/40 mb-2">04</div>
              <h4 className="text-base font-bold text-white mb-2">Room ID & Play</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Custom Room ID & Password appear directly on your Ticket 15 mins before match time!
              </p>
            </div>
          </div>
        </div>

        {/* REGISTERED TEAMS PREVIEW */}
        <div className="mt-20 max-w-4xl mx-auto gaming-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Verified Registered Squads
              </h3>
              <p className="text-xs text-gray-400">Teams ready for the battleground</p>
            </div>
            <Link
              href="/register"
              className="text-xs font-bold text-fire-400 hover:text-fire-300 flex items-center gap-1"
            >
              Add Your Squad <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teams.map((t, idx) => (
              <div
                key={t.id}
                className="bg-dark-900/80 border border-dark-800 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center font-black text-xs text-fire-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{t.teamName}</h5>
                    <p className="text-[11px] text-gray-400">
                      Captain: {t.players[0]?.name || "Captain"} • 4 Players
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    t.status === "approved"
                      ? "bg-green-500/10 text-green-400 border border-green-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
