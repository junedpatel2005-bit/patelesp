"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Trophy,
  Medal,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  Sun,
  CreditCard,
  EyeOff,
  Eye,
  Trash2,
  Radio,
  MessageCircle,
} from "lucide-react";
import { TournamentData } from "@/lib/types";
import { getSocket } from "@/lib/socket-client";

interface PricesPageProps {
  tournament: TournamentData | null;
  onTournamentUpdated: (updated: TournamentData) => void;
}

export default function PricesPage({ tournament, onTournamentUpdated }: PricesPageProps) {
  // Input form state initialized from tournament (Strings to avoid leading zero bugs)
  const [squadPrice, setSquadPrice] = useState<string>(() =>
    tournament?.squadPrice !== undefined ? String(tournament.squadPrice) : "40"
  );
  const [winnerPrize, setWinnerPrize] = useState<string>(() =>
    tournament?.winnerPrize !== undefined ? String(tournament.winnerPrize) : "180"
  );
  const [runnerUpPrize, setRunnerUpPrize] = useState<string>(() =>
    tournament?.runnerUpPrize !== undefined ? String(tournament.runnerUpPrize) : "100"
  );
  const [thirdPrize, setThirdPrize] = useState<string>(() =>
    tournament?.thirdPrize !== undefined ? String(tournament.thirdPrize) : "60"
  );

  // Helper to parse date string into YYYY-MM-DD for native <input type="date">
  const parseToIso = (str: string): string => {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {}
    return "2026-11-07";
  };

  // Schedule & Timing state
  const [tournamentDate, setTournamentDate] = useState<string>(() =>
    tournament?.tournamentDate || "07 November 2026"
  );
  const [tournamentDay, setTournamentDay] = useState<string>(() =>
    tournament?.tournamentDay || "Saturday"
  );
  const [tournamentTime, setTournamentTime] = useState<string>(() =>
    tournament?.tournamentTime || "09:00 PM IST"
  );
  const [entryTime, setEntryTime] = useState<string>(() =>
    tournament?.entryTime || "08:45 PM IST"
  );
  const [calendarIso, setCalendarIso] = useState<string>(() =>
    tournament?.tournamentDate ? parseToIso(tournament.tournamentDate) : "2026-11-07"
  );

  // Payment details state
  const [paymentNumber, setPaymentNumber] = useState<string>(() =>
    tournament?.paymentNumber || "+919054358668"
  );
  const [paymentName, setPaymentName] = useState<string>(() =>
    tournament?.paymentName || "Juned Rafik Patel"
  );
  const [upiId, setUpiId] = useState<string>(() =>
    tournament?.upiId || "9054358668@ybl"
  );

  // WhatsApp Group link & Room Credentials state
  const [whatsappGroupLink, setWhatsappGroupLink] = useState<string>(() =>
    tournament?.whatsappGroupLink || "https://chat.whatsapp.com/invite"
  );
  const [roomId, setRoomId] = useState<string>(() =>
    tournament?.roomId || ""
  );
  const [roomPassword, setRoomPassword] = useState<string>(() =>
    tournament?.roomPassword || ""
  );
  const [isRoomLive, setIsRoomLive] = useState<boolean>(() =>
    tournament?.isRoomLive ?? false
  );

  // Points table visibility toggle
  const [hidePointsTable, setHidePointsTable] = useState<boolean>(() =>
    tournament?.hidePointsTable !== undefined ? tournament.hidePointsTable : true
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Prevent background refreshes/window focus from wiping out unsaved edits
  const hasInitializedRef = React.useRef(false);
  const isDirtyRef = React.useRef(false);

  const isModified = Boolean(
    tournament &&
    (squadPrice !== String(tournament.squadPrice ?? 40) ||
      winnerPrize !== String(tournament.winnerPrize ?? 180) ||
      runnerUpPrize !== String(tournament.runnerUpPrize ?? 100) ||
      thirdPrize !== String(tournament.thirdPrize ?? 60) ||
      tournamentDate !== (tournament.tournamentDate || "07 November 2026") ||
      tournamentDay !== (tournament.tournamentDay || "Saturday") ||
      tournamentTime !== (tournament.tournamentTime || "09:00 PM IST") ||
      entryTime !== (tournament.entryTime || "08:45 PM IST") ||
      paymentNumber !== (tournament.paymentNumber || "+919054358668") ||
      paymentName !== (tournament.paymentName || "Juned Rafik Patel") ||
      upiId !== (tournament.upiId || "9054358668@ybl") ||
      hidePointsTable !== (tournament.hidePointsTable !== undefined ? tournament.hidePointsTable : true))
  );

  useEffect(() => {
    isDirtyRef.current = isModified;
  }, [isModified]);

  // Sync inputs ONLY when NOT modified by user, so background polls never overwrite edits!
  useEffect(() => {
    if (!tournament) return;

    if (hasInitializedRef.current && isDirtyRef.current) {
      // User is currently editing! Do NOT overwrite inputs.
      return;
    }

    setSquadPrice(String(tournament.squadPrice ?? 40));
    setWinnerPrize(String(tournament.winnerPrize ?? 180));
    setRunnerUpPrize(String(tournament.runnerUpPrize ?? 100));
    setThirdPrize(String(tournament.thirdPrize ?? 60));
    setTournamentDate(tournament.tournamentDate || "07 November 2026");
    setTournamentDay(tournament.tournamentDay || "Saturday");
    setTournamentTime(tournament.tournamentTime || "09:00 PM IST");
    setEntryTime(tournament.entryTime || "08:45 PM IST");
    setPaymentNumber(tournament.paymentNumber || "+919054358668");
    setPaymentName(tournament.paymentName || "Juned Rafik Patel");
    setUpiId(tournament.upiId || "9054358668@ybl");
    setWhatsappGroupLink(tournament.whatsappGroupLink || "https://chat.whatsapp.com/invite");
    setRoomId(tournament.roomId || "");
    setRoomPassword(tournament.roomPassword || "");
    setIsRoomLive(tournament.isRoomLive ?? false);
    setHidePointsTable(tournament.hidePointsTable !== undefined ? tournament.hidePointsTable : true);

    if (tournament.tournamentDate) {
      const iso = parseToIso(tournament.tournamentDate);
      if (iso) setCalendarIso(iso);
    }

    hasInitializedRef.current = true;
  }, [tournament]);

  const handleDiscardChanges = () => {
    if (!tournament) return;
    setSquadPrice(String(tournament.squadPrice ?? 40));
    setWinnerPrize(String(tournament.winnerPrize ?? 180));
    setRunnerUpPrize(String(tournament.runnerUpPrize ?? 100));
    setThirdPrize(String(tournament.thirdPrize ?? 60));
    setTournamentDate(tournament.tournamentDate || "07 November 2026");
    setTournamentDay(tournament.tournamentDay || "Saturday");
    setTournamentTime(tournament.tournamentTime || "09:00 PM IST");
    setEntryTime(tournament.entryTime || "08:45 PM IST");
    setPaymentNumber(tournament.paymentNumber || "+919054358668");
    setPaymentName(tournament.paymentName || "Juned Rafik Patel");
    setUpiId(tournament.upiId || "9054358668@ybl");
    setHidePointsTable(tournament.hidePointsTable !== undefined ? tournament.hidePointsTable : true);
    isDirtyRef.current = false;
  };

  // Handle calendar date picker change
  const handleCalendarPick = (isoVal: string) => {
    setCalendarIso(isoVal);
    if (!isoVal) return;
    try {
      const [y, m, d] = isoVal.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (!isNaN(dateObj.getTime())) {
        const pretty = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        const day = dateObj.toLocaleDateString("en-US", { weekday: "long" });
        setTournamentDate(pretty);
        setTournamentDay(day);
      }
    } catch (e) {}
  };

  // Quick Date Shortcut buttons
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    handleCalendarPick(iso);
  };

  const setNextWeekday = (targetDayIndex: number) => {
    const d = new Date();
    const currentDay = d.getDay();
    const distance = (targetDayIndex + 7 - currentDay) % 7 || 7;
    d.setDate(d.getDate() + distance);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    handleCalendarPick(iso);
  };

  const setTimePreset = (start: string, entry: string) => {
    setTournamentTime(start);
    setEntryTime(entry);
  };

  // Clean price input to completely prevent "040" or leading zeroes
  const handlePriceInput = (value: string, setter: (val: string) => void) => {
    if (value === "") {
      setter("");
      return;
    }
    // Remove all non-digits, then strip leading zeros if followed by other digits (e.g. "040" -> "40")
    const cleaned = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setter(cleaned);
  };

  const handleSaveAll = async (e?: any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const numSquadPrice = Number(squadPrice || 0);
    const numWinnerPrize = Number(winnerPrize || 0);
    const numRunnerUp = Number(runnerUpPrize || 0);
    const numThirdPrize = Number(thirdPrize || 0);

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          squadPrice: numSquadPrice,
          winnerPrize: numWinnerPrize,
          runnerUpPrize: numRunnerUp,
          thirdPrize: numThirdPrize,
          tournamentDate: tournamentDate.trim(),
          tournamentDay: tournamentDay.trim(),
          tournamentTime: tournamentTime.trim(),
          entryTime: entryTime.trim(),
          paymentNumber: paymentNumber.trim(),
          paymentName: paymentName.trim(),
          upiId: upiId.trim(),
          whatsappGroupLink: whatsappGroupLink.trim(),
          roomId: roomId.trim(),
          roomPassword: roomPassword.trim(),
          isRoomLive,
          hidePointsTable,
          note: "Prizes & Tournament settings modified from Admin Panel",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save tournament settings");
      }

      onTournamentUpdated(data.tournament);
      isDirtyRef.current = false;
      hasInitializedRef.current = false;
      try {
        localStorage.setItem("patelesp_price_sync", Date.now().toString());
      } catch (e) {}

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 6000);
    } catch (err: any) {
      setSaveError(err?.message || "Failed to update prices.");
    } finally {
      setSaving(false);
    }
  };

  const calculatedTotal =
    Number(squadPrice || 0) > 0
      ? Number(winnerPrize || 0) + Number(runnerUpPrize || 0) + Number(thirdPrize || 0)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                Prize Pool &amp; Tournament Schedule Management
              </h2>
              <p className="text-xs text-slate-500">
                Update prizes, match date, day, entry timing, and payment number. All changes reflect live on the website instantly!
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className={`font-black text-xs uppercase px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto shrink-0 ${
              isModified
                ? "bg-amber-600 hover:bg-amber-700 text-white animate-bounce shadow-amber-500/30"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
            }`}
          >
            {saving ? (
              <span className="animate-pulse">SAVING TO DATABASE...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isModified ? "SAVE UNPUBLISHED CHANGES" : "SAVE & PUBLISH CHANGES"}
              </>
            )}
          </button>
        </div>

        {/* Unsaved Changes Banner */}
        {isModified && (
          <div className="mt-4 bg-amber-50 border-2 border-amber-400 text-amber-900 p-4 rounded-xl text-xs font-black flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                ⚠️ You have edited values on this screen that are NOT yet published! Click <u>SAVE &amp; PUBLISH CHANGES</u> to update the public website.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscardChanges}
                disabled={saving}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase px-3 py-2 rounded-lg transition"
              >
                DISCARD
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase px-4 py-2 rounded-lg transition"
              >
                SAVE NOW
              </button>
            </div>
          </div>
        )}

        {/* Success / Error notification */}
        {saveSuccess && (
          <div className="mt-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center gap-3 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-black text-sm">Changes Successfully Saved &amp; Live!</p>
              <p className="font-medium text-emerald-800">
                All updated prizes, match dates, timing, and payment number are saved to the database and updated immediately on the website cards.
              </p>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* MAIN CONFIGURATION FORM */}
        <form onSubmit={handleSaveAll} className="mt-6 space-y-8">
          {/* SECTION 1: PRIZE POOL CARDS (NO 040 BUG) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                1. Entry Fee &amp; Prize Distribution (₹)
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Click input to replace value directly without leading 0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. Squad Entry Price */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Squad Entry Price (₹)</span>
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={squadPrice}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handlePriceInput(e.target.value, setSquadPrice)}
                    placeholder="100"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>Per Player: ₹{Math.round(Number(squadPrice || 0) / 4)}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSquadPrice("100")}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold"
                    >
                      100
                    </button>
                    <button
                      type="button"
                      onClick={() => setSquadPrice("150")}
                      className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold"
                    >
                      150
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Winner (1st Prize) */}
              <div className="bg-blue-50/50 border-2 border-blue-300 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center justify-between">
                  <span>Winner 1st Prize (₹)</span>
                  <Trophy className="w-4 h-4 text-blue-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={winnerPrize}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handlePriceInput(e.target.value, setWinnerPrize)}
                    placeholder="1000"
                    required
                    className="w-full bg-white border border-blue-300 rounded-lg pl-8 pr-3 py-2.5 text-blue-700 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-blue-700 mt-2 font-medium">
                  1st Place Booyah Cash Prize
                </p>
              </div>

              {/* 3. Runner Up (2nd Prize) */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Runner Up 2nd Prize (₹)</span>
                  <Medal className="w-4 h-4 text-slate-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={runnerUpPrize}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handlePriceInput(e.target.value, setRunnerUpPrize)}
                    placeholder="500"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  2nd Place Squad Cash Reward
                </p>
              </div>

              {/* 4. 3rd Place Prize */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>3rd Place Prize (₹)</span>
                  <Award className="w-4 h-4 text-slate-600" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={thirdPrize}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handlePriceInput(e.target.value, setThirdPrize)}
                    placeholder="250"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2.5 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  3rd Place Squad Cash Reward
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: TOURNAMENT SCHEDULE & CALENDAR (USER REQUIREMENT) */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  2. Tournament Schedule, Calendar &amp; Match Day
                </h3>
                <p className="text-xs text-slate-500">
                  Pick a date from the calendar below. The day of the week and display format will auto-fill automatically!
                </p>
              </div>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Quick:</span>
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 transition"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setNextWeekday(6)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold text-blue-700 transition"
                >
                  Saturday
                </button>
                <button
                  type="button"
                  onClick={() => setNextWeekday(0)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-bold text-blue-700 transition"
                >
                  Sunday
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. INTERACTIVE CALENDAR DATE PICKER */}
              <div className="bg-blue-50/60 border-2 border-blue-400 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-black uppercase tracking-wider text-blue-900 mb-2 flex items-center justify-between">
                  <span>Pick Date on Calendar</span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </label>
                <input
                  type="date"
                  value={calendarIso}
                  onChange={(e) => handleCalendarPick(e.target.value)}
                  className="w-full bg-white border-2 border-blue-300 hover:border-blue-500 rounded-lg px-3 py-2 text-sm font-black text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-inner"
                />
                <p className="text-[11px] text-blue-700 mt-2 font-medium">
                  Click to open calendar popup &amp; pick day
                </p>
              </div>

              {/* 2. Display Formatted Date */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Formatted Date Text</span>
                  <Calendar className="w-4 h-4 text-slate-500" />
                </label>
                <input
                  type="text"
                  value={tournamentDate}
                  onChange={(e) => setTournamentDate(e.target.value)}
                  placeholder="08 November 2026"
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Auto-formatted from calendar pick
                </p>
              </div>

              {/* 3. Tournament Day */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Tournament Day</span>
                  <Sun className="w-4 h-4 text-amber-500" />
                </label>
                <input
                  type="text"
                  value={tournamentDay}
                  onChange={(e) => setTournamentDay(e.target.value)}
                  placeholder="Sunday"
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-2">
                  Auto-detected: <strong className="text-slate-700">{tournamentDay}</strong>
                </p>
              </div>

              {/* 4. Match Start & Room Entry Timing */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition shadow-sm">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Start &amp; Entry Timing</span>
                  <Clock className="w-4 h-4 text-slate-500" />
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase w-12 shrink-0">Match:</span>
                    <input
                      type="text"
                      value={tournamentTime}
                      onChange={(e) => setTournamentTime(e.target.value)}
                      placeholder="09:00 PM IST"
                      required
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-black text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-500 uppercase w-12 shrink-0">Entry:</span>
                    <input
                      type="text"
                      value={entryTime}
                      onChange={(e) => setEntryTime(e.target.value)}
                      placeholder="08:45 PM IST"
                      required
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-black text-red-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setTimePreset("09:00 PM IST", "08:45 PM IST")}
                    className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded text-slate-700"
                  >
                    9:00 (Entry 8:45)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePreset("08:30 PM IST", "08:15 PM IST")}
                    className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded text-slate-700"
                  >
                    8:30 (Entry 8:15)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePreset("08:00 PM IST", "07:45 PM IST")}
                    className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded text-slate-700"
                  >
                    8:00 (Entry 7:45)
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW OF WEBSITE SCHEDULE BANNER */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-inner">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Website Schedule Preview (Banner Before 4 Prize Boxes)
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  Real-time Preview
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tournament Date:</span>
                  <span className="font-black text-white text-sm">{tournamentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tournament Day:</span>
                  <span className="font-black text-red-500 text-sm uppercase">{tournamentDay}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Match &amp; Entry Time:</span>
                  <span className="font-black text-white text-sm">{tournamentTime}</span>{" "}
                  <span className="text-[10px] bg-red-950 border border-red-700 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                    Entry: {entryTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: OFFICIAL PAYMENT DETAILS (USER REQUIREMENT) */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-blue-600" />
              3. Official Payment Credentials (UPI / GPay / PhonePe)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Payment Mobile Number */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Official Payment Number
                </label>
                <input
                  type="text"
                  value={paymentNumber}
                  onChange={(e) => setPaymentNumber(e.target.value)}
                  placeholder="+919054358668"
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Displayed on website registration for entry fee payment
                </p>
              </div>

              {/* Payee Name */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Payee Account Name
                </label>
                <input
                  type="text"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder="Juned Rafik Patel"
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Official UPI account holder name
                </p>
              </div>

              {/* Payee UPI ID */}
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-blue-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Official UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="9054358668@ybl"
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Used for dynamic QR generation &amp; deep linking
                </p>
              </div>

              {/* Points Table Toggle */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Website Points Table Visibility
                </label>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {hidePointsTable ? (
                      <EyeOff className="w-5 h-5 text-red-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-emerald-600" />
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {hidePointsTable ? "Point Table Hidden" : "Point Table Visible"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHidePointsTable(!hidePointsTable)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition ${
                      hidePointsTable
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                  >
                    {hidePointsTable ? "Click to Show" : "Click to Hide"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Currently {hidePointsTable ? "HIDDEN from website rules" : "VISIBLE on website rules"}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: TOURNAMENT DAY ROOM CREDENTIALS & WHATSAPP GROUP */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase">
                    4. Custom Room Credentials &amp; WhatsApp Community Group
                  </h4>
                  <p className="text-xs text-slate-500">
                    Broadcast Free Fire Custom Room ID &amp; Password live to players before match start
                  </p>
                </div>
              </div>

              {/* Live Broadcast Toggle */}
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRoomLive ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                <button
                  type="button"
                  onClick={() => setIsRoomLive(!isRoomLive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    isRoomLive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {isRoomLive ? "🟢 Room Broadcast: LIVE ON WEBSITE" : "⚪ Room Broadcast: HIDDEN"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Custom Room ID */}
              <div className="bg-white border-2 border-slate-200 focus-within:border-emerald-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Free Fire Custom Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. 8492014"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Generated in Free Fire app 15 mins prior to match
                </p>
              </div>

              {/* Room Password */}
              <div className="bg-white border-2 border-slate-200 focus-within:border-emerald-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Custom Room Password
                </label>
                <input
                  type="text"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="e.g. 2412"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-black font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keep simple for players to type quickly
                </p>
              </div>

              {/* Official WhatsApp Group Link */}
              <div className="bg-white border-2 border-slate-200 focus-within:border-emerald-600 rounded-xl p-4 transition">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Official WhatsApp Group Link
                </label>
                <input
                  type="url"
                  value={whatsappGroupLink}
                  onChange={(e) => setWhatsappGroupLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/invite/..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Players can join the tournament WhatsApp group with 1 tap
                </p>
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase">
                Save &amp; Publish Configuration
              </p>
              <p className="text-xs text-slate-500">
                Clicking save immediately updates prices, match date, timing, and UPI credentials on the public website.
              </p>
            </div>

            <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-bold block">
                  Total Prize Pool
                </span>
                <span className="text-2xl font-black text-blue-600">
                  ₹{calculatedTotal.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/30 cursor-pointer shrink-0"
              >
                {saving ? (
                  <span className="animate-pulse">SAVING TO DATABASE...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    SAVE &amp; PUBLISH CHANGES
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
