"use client";

import React from "react";
import { Trophy, Medal, Award, DollarSign } from "lucide-react";
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
  const totalPrizePool = Number(winnerPrize) + Number(runnerUpPrize) + Number(thirdPrize);

  return (
    <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Background Red Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Creator & Subtitle Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-red-600/40 text-red-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Official Free Fire Squad Battle Royale
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
            PATELESP <span className="text-red-600 text-glow-red">SHOWDOWN</span>
          </h1>

          {/* Explicit requirement: "first show haear creted and devloped by juned" */}
          <div className="mt-3 inline-block bg-zinc-900/90 border border-zinc-800 px-5 py-2 rounded-lg">
            <p className="text-sm sm:text-base font-bold text-gray-200">
              Created and Developed by <span className="text-red-500 font-extrabold uppercase">Juned</span>
            </p>
          </div>

          <p className="mt-4 text-sm sm:text-base text-gray-400">
            Exclusive 12 Squads Arena (48 Players Max). Mobile Only. Register your squad now and compete for the championship!
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-bold text-gray-300">
            <span className="text-red-500 font-black">●</span> TOTAL PRIZE POOL: <span className="text-white text-base font-black">₹{totalPrizePool.toLocaleString()}</span>
          </div>
        </div>

        {/* The 4 Boxes Requested:
            1st: Price per squad
            2nd: Winner
            3rd: Runner up
            4th: 3rd number
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Box 1: Price per Squad */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-red-500 uppercase bg-red-950/60 px-2.5 py-1 rounded border border-red-700/50">
                BOX #1
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

          {/* Box 2: Winner (1st Prize) */}
          <div className="relative bg-zinc-950 border-2 border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:shadow-[0_0_35px_rgba(239,68,68,0.45)] flex flex-col justify-between">
            <div className="absolute -top-3 right-4 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow">
              CHAMPION
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-white uppercase bg-red-600 px-2.5 py-1 rounded">
                BOX #2
              </span>
              <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500">
                <Trophy className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Winner (1st Place)
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

          {/* Box 3: Runner Up (2nd Prize) */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-gray-300 uppercase bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700">
                BOX #3
              </span>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-red-500 transition">
                <Medal className="w-5 h-5 text-gray-300" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Runner Up (2nd Place)
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

          {/* Box 4: 3rd Number (3rd Prize) */}
          <div className="relative bg-zinc-950 border-2 border-zinc-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 group shadow-lg hover:shadow-[0_0_25px_rgba(239,68,68,0.25)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black tracking-widest text-gray-300 uppercase bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700">
                BOX #4
              </span>
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white group-hover:border-red-500 transition">
                <Award className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                3rd Number (3rd Place)
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
