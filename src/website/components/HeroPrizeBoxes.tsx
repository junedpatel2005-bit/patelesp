"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  DollarSign,
  Calendar,
  Clock,
  Sun,
  Users,
  Copy,
  Check,
  MessageCircle,
  Flame,
} from "lucide-react";
import { TournamentData } from "@/lib/types";

interface HeroPrizeBoxesProps {
  tournament: TournamentData | null;
  loading: boolean;
}

export default function HeroPrizeBoxes({ tournament, loading }: HeroPrizeBoxesProps) {
  const squadPrice = tournament?.squadPrice ?? 100;
  const winnerPrize = tournament?.winnerPrize ?? 1000;
  const runnerUpPrize = tournament?.runnerUpPrize ?? 500;
  const thirdPrize = tournament?.thirdPrize ?? 250;

  const tournamentDate = tournament?.tournamentDate || "08 November 2026";
  const tournamentDay = tournament?.tournamentDay || "Sunday";
  const tournamentTime = tournament?.tournamentTime || "09:00 PM IST";
  const entryTime = tournament?.entryTime || "08:45 PM IST";

  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Live countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        const cleanDate = tournamentDate.replace(/^[A-Za-z]+,\s*/, "");
        const cleanTime = tournamentTime.replace(/\s*IST/i, "").trim();
        const combinedStr = `${cleanDate} ${cleanTime}`;
        const targetDate = new Date(combinedStr);

        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (isNaN(targetDate.getTime()) || diff <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isLive: false });
      } catch (e) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [tournamentDate, tournamentTime]);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch (e) {}
  };

  const whatsappLink =
    tournament?.whatsappGroupLink ||
    `https://wa.me/${(tournament?.whatsappNumber || "918849596369").replace(/\D/g, "")}`;

  return (
    <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Background Red Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Creator & Subtitle Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Official Free Fire Squad Battle Royale
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
            PATELESP <span className="text-red-600 text-glow-red">SHOWDOWN</span>
          </h1>

          <div className="mt-3 inline-block bg-zinc-900/90 border border-zinc-800 px-5 py-2 rounded-lg">
            <p className="text-sm sm:text-base font-bold text-gray-200">
              Created and Developed by <span className="text-red-500 font-extrabold uppercase">Juned</span>
            </p>
          </div>

          <p className="mt-4 text-sm sm:text-base text-gray-400">
            Exclusive 12 Squads Arena (48 Players Max). Mobile Only. Register your squad now and compete for the championship!
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#register"
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-600/30"
            >
              <Users className="w-4 h-4" />
              Register Squad Now
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/30"
            >
              <MessageCircle className="w-4 h-4" />
              Join Official WhatsApp Group
            </a>
          </div>
        </div>

        {/* LIVE COUNTDOWN TIMER */}
        <div className="mb-8 max-w-2xl mx-auto bg-gradient-to-r from-red-950/80 via-zinc-900/90 to-red-950/80 border-2 border-red-600/60 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.25)] text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-red-400">
              {timeLeft.isLive ? "🔥 TOURNAMENT MATCH IN SESSION" : "MATCH COUNTDOWN TIMER"}
            </span>
          </div>

          {timeLeft.isLive ? (
            <div className="py-2 text-center">
              <span className="inline-block bg-red-600 text-white font-black text-sm uppercase px-5 py-2 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse">
                Custom Room Open &amp; Match In Progress
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              <div className="bg-black/80 border border-red-600/40 rounded-xl p-2 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white font-mono block">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Days
                </span>
              </div>
              <div className="bg-black/80 border border-red-600/40 rounded-xl p-2 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white font-mono block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Hours
                </span>
              </div>
              <div className="bg-black/80 border border-red-600/40 rounded-xl p-2 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-white font-mono block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Mins
                </span>
              </div>
              <div className="bg-black/80 border border-red-600/40 rounded-xl p-2 sm:p-3">
                <span className="text-xl sm:text-3xl font-black text-red-500 font-mono block">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  Secs
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CUSTOM ROOM ID & PASSWORD LIVE BROADCAST (WHEN ADMIN ENABLES) */}
        {tournament?.isRoomLive && tournament?.roomId && (
          <div className="mb-8 max-w-3xl mx-auto bg-gradient-to-r from-emerald-950 via-zinc-950 to-emerald-950 border-2 border-emerald-500 rounded-2xl p-5 shadow-[0_0_35px_rgba(16,185,129,0.35)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-3 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base sm:text-lg font-black uppercase text-emerald-300 tracking-tight">
                  🎮 FREE FIRE CUSTOM ROOM CREDENTIALS LIVE!
                </h3>
              </div>
              <span className="bg-emerald-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full shadow">
                Join In-Game Now
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Room ID */}
              <div className="bg-black/80 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Custom Room ID</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-widest">
                    {tournament.roomId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(tournament.roomId || "", setCopiedId)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId ? "Copied!" : "Copy ID"}</span>
                </button>
              </div>

              {/* Room Password */}
              <div className="bg-black/80 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Room Password</span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-widest">
                    {tournament.roomPassword || "None"}
                  </span>
                </div>
                {tournament.roomPassword && (
                  <button
                    type="button"
                    onClick={() => handleCopy(tournament.roomPassword || "", setCopiedPass)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPass ? "Copied!" : "Copy Pass"}</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-emerald-200/90 text-center mt-3 font-semibold">
              ⚠️ Strict Note: Please enter only in your assigned Slot Number (1 to 12). Unregistered squads will be kicked immediately.
            </p>
          </div>
        )}

        {/* AFTER HEADER BEFORE BOX: TOURNAMENT DATE, TIME, & DAY (ADMIN CONFIGURABLE) */}
        <div className="mb-10 max-w-4xl mx-auto bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-red-600/60 hover:border-red-500 rounded-2xl p-5 sm:p-6 shadow-[0_0_30px_rgba(239,68,68,0.25)] transition">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* 1. Date */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                  Tournament Date
                </span>
                <span className="text-base sm:text-lg font-black text-white tracking-wide">
                  {tournamentDate}
                </span>
              </div>
            </div>

            {/* 2. Day */}
            <div className="flex items-center gap-3.5 md:border-l md:border-zinc-800 md:pl-5">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                  Tournament Day
                </span>
                <span className="text-base sm:text-lg font-black text-red-500 uppercase tracking-wide">
                  {tournamentDay}
                </span>
              </div>
            </div>

            {/* 3. Time (Entry & Match) */}
            <div className="flex items-center gap-3.5 md:border-l md:border-zinc-800 md:pl-5">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                  Match &amp; Entry Time
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-black text-white">
                    {tournamentTime}
                  </span>
                  <span className="bg-red-950 border border-red-600/80 text-yellow-300 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                    Entry: {entryTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Boxes with Real Names (No box numbers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Entry Fee / Squad Price */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-red-400 uppercase bg-red-950/60 px-3 py-1 rounded border border-red-700/50">
                SQUAD ENTRY FEE
              </span>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-red-500 transition">
                <DollarSign className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Price Per Squad
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 group-hover:text-red-500 transition">
                {loading ? "..." : `₹${squadPrice.toLocaleString()}`}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                Entry fee for full squad (4 Players)
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-gray-400">
              <span>Per Player</span>
              <span className="font-bold text-white">₹{Math.round(squadPrice / 4)}</span>
            </div>
          </div>

          {/* Card 2: Winner (1st Prize) */}
          <div className="relative bg-zinc-950 border-2 border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] flex flex-col justify-between">
            <div className="absolute -top-3 right-4 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow">
              BOOYAH!
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-white uppercase bg-red-600 px-3 py-1 rounded">
                1ST PLACE WINNER
              </span>
              <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Tournament Champions
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 text-glow-red">
                {loading ? "..." : `₹${winnerPrize.toLocaleString()}`}
              </h3>
              <p className="text-[11px] text-gray-300 mt-2 font-medium">
                1st Place Booyah Champions Prize
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-red-900/50 flex items-center justify-between text-[11px] text-red-300">
              <span>Payout Method</span>
              <span className="font-bold text-white">Instant UPI</span>
            </div>
          </div>

          {/* Card 3: Runner Up (2nd Prize) */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-gray-200 uppercase bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
                2ND PLACE RUNNER UP
              </span>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-red-500 transition">
                <Medal className="w-5 h-5 text-gray-300" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                2nd Place Squad
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 group-hover:text-red-500 transition">
                {loading ? "..." : `₹${runnerUpPrize.toLocaleString()}`}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                2nd Place Squad Cash Reward
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-gray-400">
              <span>Payout Method</span>
              <span className="font-bold text-white">Instant UPI</span>
            </div>
          </div>

          {/* Card 4: 3rd Place Cash Prize */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-gray-200 uppercase bg-zinc-900 px-3 py-1 rounded border border-zinc-700">
                3RD PLACE REWARD
              </span>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-red-500 transition">
                <Award className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                3rd Place Squad
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-white mt-1 group-hover:text-red-500 transition">
                {loading ? "..." : `₹${thirdPrize.toLocaleString()}`}
              </h3>
              <p className="text-[11px] text-gray-400 mt-2 font-medium">
                3rd Place Squad Cash Reward
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-850 flex items-center justify-between text-[11px] text-gray-400">
              <span>Payout Method</span>
              <span className="font-bold text-white">Instant UPI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
