"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Trophy, Medal, Award, Save, History, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { TournamentData, PriceHistoryRecord } from "@/lib/types";

interface PricesPageProps {
  tournament: TournamentData | null;
  onTournamentUpdated: (updated: TournamentData) => void;
}

export default function PricesPage({ tournament, onTournamentUpdated }: PricesPageProps) {
  // Input form state
  const [squadPrice, setSquadPrice] = useState<number>(tournament?.squadPrice ?? 100);
  const [winnerPrize, setWinnerPrize] = useState<number>(tournament?.winnerPrize ?? 1000);
  const [runnerUpPrize, setRunnerUpPrize] = useState<number>(tournament?.runnerUpPrize ?? 500);
  const [thirdPrize, setThirdPrize] = useState<number>(tournament?.thirdPrize ?? 250);
  const [note, setNote] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Price history state
  const [history, setHistory] = useState<PriceHistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Sync inputs if tournament prop loads later
  useEffect(() => {
    if (tournament) {
      setSquadPrice(tournament.squadPrice);
      setWinnerPrize(tournament.winnerPrize);
      setRunnerUpPrize(tournament.runnerUpPrize);
      setThirdPrize(tournament.thirdPrize);
    }
  }, [tournament]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/price-history", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error("Failed to load price history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squadPrice: Number(squadPrice),
          winnerPrize: Number(winnerPrize),
          runnerUpPrize: Number(runnerUpPrize),
          thirdPrize: Number(thirdPrize),
          note: note.trim() || "Prizes modified from Admin Panel",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save prices");
      }

      onTournamentUpdated(data.tournament);
      if (data.historyRecord) {
        setHistory((prev) => [data.historyRecord, ...prev]);
      }
      setSaveSuccess(true);
      setNote("");
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update prices.");
    } finally {
      setSaving(false);
    }
  };

  const calculatedTotal = Number(winnerPrize) + Number(runnerUpPrize) + Number(thirdPrize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
              Page 2: Prize Pool Management &amp; Price History
            </h2>
            <p className="text-xs text-slate-500">
              Set entry fee and tournament cash rewards. Changes update instantly on the main website!
            </p>
          </div>
        </div>

        {/* Success / Error notification */}
        {saveSuccess && (
          <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-3 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              All tournament prices updated and saved successfully! The 4 boxes on the public website are now showing the new values immediately.
            </span>
          </div>
        )}

        {saveError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* EDIT PRICES FORM */}
        <form onSubmit={handleSavePrices} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Price Per Squad */}
            <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Box 1: Price Per Squad (₹)</span>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={squadPrice}
                  onChange={(e) => setSquadPrice(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Entry fee for full squad (₹{Math.round(squadPrice / 4)}/player)
              </p>
            </div>

            {/* 2. Winner (1st Prize) */}
            <div className="bg-blue-50/50 border-2 border-blue-300 focus-within:border-blue-600 rounded-xl p-4 transition">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center justify-between">
                <span>Box 2: Winner 1st Prize (₹)</span>
                <Trophy className="w-4 h-4 text-blue-600" />
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={winnerPrize}
                  onChange={(e) => setWinnerPrize(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-blue-300 rounded-lg pl-8 pr-3 py-2.5 text-blue-700 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-blue-700 mt-2 font-medium">
                1st Place Booyah Cash Prize
              </p>
            </div>

            {/* 3. Runner Up (2nd Prize) */}
            <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Box 3: Runner Up 2nd Prize (₹)</span>
                <Medal className="w-4 h-4 text-slate-600" />
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={runnerUpPrize}
                  onChange={(e) => setRunnerUpPrize(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                2nd Place Squad Cash Reward
              </p>
            </div>

            {/* 4. 3rd Number Prize */}
            <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                <span>Box 4: 3rd Number Prize (₹)</span>
                <Award className="w-4 h-4 text-slate-600" />
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={thirdPrize}
                  onChange={(e) => setThirdPrize(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                3rd Place Squad Cash Reward
              </p>
            </div>
          </div>

          {/* Reason note & Save bar */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Optional Revision Note (Logged in Price History)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Updated prize pool for weekend grand finals"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">
                  Total Prize Pool
                </span>
                <span className="text-xl font-black text-blue-600">
                  ₹{calculatedTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs uppercase px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer shrink-0"
              >
                {saving ? (
                  <span className="animate-pulse">SAVING...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    SAVE &amp; PUBLISH PRICES
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PRICE HISTORY TABLE - User requested: "also old proce history" */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase">
                Historical Price Change Log
              </h3>
              <p className="text-xs text-slate-500">
                Audited timeline of every entry fee &amp; prize revision saved by admin
              </p>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh History
          </button>
        </div>

        {loadingHistory ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Loading price history records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No price revisions logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Squad Price</th>
                  <th className="py-3 px-4">Winner (1st)</th>
                  <th className="py-3 px-4">Runner Up (2nd)</th>
                  <th className="py-3 px-4">3rd Number</th>
                  <th className="py-3 px-4">Total Pool</th>
                  <th className="py-3 px-4">Changed By / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{item.squadPrice}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600">
                      ₹{item.winnerPrize}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      ₹{item.runnerUpPrize}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      ₹{item.thirdPrize}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      ₹{item.totalPrizePool}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      <span className="font-semibold text-slate-800">{item.updatedBy}: </span>
                      {item.note || "Prize update"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
