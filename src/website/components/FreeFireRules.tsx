"use client";

import React from "react";
import { BookOpen, ShieldAlert, Smartphone, Award, Clock, FileCheck } from "lucide-react";

export default function FreeFireRules() {
  const pointsTable = [
    { rank: "1st (Booyah)", points: 12 },
    { rank: "2nd Place", points: 9 },
    { rank: "3rd Place", points: 8 },
    { rank: "4th Place", points: 7 },
    { rank: "5th Place", points: 6 },
    { rank: "6th Place", points: 5 },
    { rank: "7th Place", points: 4 },
    { rank: "8th Place", points: 3 },
    { rank: "9th Place", points: 2 },
    { rank: "10th Place", points: 1 },
    { rank: "11th - 12th", points: 0 },
  ];

  return (
    <section id="rules" className="py-16 bg-black relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/40 border border-red-600/30 px-3.5 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Official Tournament Rulebook
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            FREE FIRE ESPORTS <span className="text-red-600">RULES</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Standard Garena Free Fire competitive esports regulations. All players must strictly comply.
          </p>
        </div>

        {/* 4 Core Rule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Rule 1: Squad & Devices */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-red-600/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase">
                1. Devices &amp; Platform (Mobile Only)
              </h3>
            </div>
            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
              <li>Only touchscreen handheld smartphones (Android / iOS) are allowed.</li>
              <li>PC Emulators (BlueStacks, LDPlayer, Nox, MSI) are <strong className="text-red-400 font-bold">strictly prohibited</strong>.</li>
              <li>Any emulator player detected in the custom lobby will be instantly kicked and the team disqualified without refund.</li>
              <li>External triggers, physical macro buttons, and key-mappers are not permitted.</li>
            </ul>
          </div>

          {/* Rule 2: Anti-Cheat & Fair Play */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-red-600/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase">
                2. Anti-Cheat &amp; Disqualification
              </h3>
            </div>
            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
              <li>Zero tolerance for third-party scripts, auto-headshot, wallhacks, or modified APK/OBB files.</li>
              <li>Teaming up with another squad inside the match will result in a lifetime ban for both teams.</li>
              <li>Exploiting in-game glitches or map bugs will disqualify the squad.</li>
              <li>Toxic or abusive behavior towards tournament admins or opponents will lead to an immediate ban.</li>
            </ul>
          </div>

          {/* Rule 3: Custom Room Access */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-red-600/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase">
                3. Room ID &amp; Password Timing
              </h3>
            </div>
            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
              <li>Room ID and Password are sent strictly to the registered IGL&apos;s WhatsApp number 15 minutes before match start.</li>
              <li>Each team must sit strictly in their assigned Slot number (Slot 1 to 12).</li>
              <li>If a team enters the wrong slot, they will be moved or kicked if they refuse.</li>
              <li>Matches start on the exact scheduled time; late arrivals will not be waited for.</li>
            </ul>
          </div>

          {/* Rule 4: Proof & Score Reporting */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-red-600/60 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white uppercase">
                4. Screenshot &amp; Prize Payout
              </h3>
            </div>
            <ul className="text-xs text-gray-300 space-y-2 list-disc list-inside">
              <li>The winning team IGL must take a clear screenshot of the end-game Booyah scoreboard showing kills and placements.</li>
              <li>Submit the screenshot to the Admin WhatsApp within 10 minutes of match completion.</li>
              <li>Cash prizes (1st, 2nd, and 3rd place) are transferred directly via UPI to the IGL within 30 minutes of verification.</li>
            </ul>
          </div>
        </div>

        {/* Official Scoring Distribution Table */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-850">
            <div>
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Award className="w-5 h-5 text-red-500" />
                Official Placement Points Table
              </h3>
              <p className="text-xs text-gray-400">
                Standard Garena Free Fire competitive scoring system
              </p>
            </div>
            <div className="bg-red-600/20 border border-red-500 text-red-400 text-xs font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span>KILL POINTS:</span>
              <span className="text-white">1 Point per Kill</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {pointsTable.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-center ${
                  idx === 0
                    ? "bg-red-950/60 border-red-600 text-white font-black shadow-md"
                    : idx < 3
                    ? "bg-zinc-900 border-zinc-700 text-gray-200"
                    : "bg-black border-zinc-850 text-gray-400"
                }`}
              >
                <div className="text-[11px] uppercase tracking-wider">{item.rank}</div>
                <div className="text-lg font-black text-white mt-1">
                  {item.points} <span className="text-[10px] font-normal text-gray-400">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
