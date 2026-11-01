"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Settings, Trophy, Flame, ArrowLeft, Save, 
  IndianRupee, Calendar, Clock, MapPin, Check, AlertCircle, Key, 
  Database, Users, Phone, Sparkles, Calculator, Swords
} from "lucide-react";
import { TournamentConfig } from "@/lib/types";
import { soundManager } from "@/lib/sound";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dbStatus, setDbStatus] = useState<{ provider: string; connected: boolean; message: string } | null>(null);

  // Form states - Pricing & Prizes (stored as string to prevent 040 erasing bug)
  const [entryFee, setEntryFee] = useState<string>("50");
  const [firstPrize, setFirstPrize] = useState<string>("1000");
  const [secondPrize, setSecondPrize] = useState<string>("500");
  const [perKillPrize, setPerKillPrize] = useState<string>("0");

  // Helper to cleanly handle number inputs, allowing empty inputs and removing leading zeros
  const handleNumericInput = (val: string, setter: (v: string) => void) => {
    if (val === "") {
      setter("");
      return;
    }
    // Remove non-numeric characters except digits
    const digitsOnly = val.replace(/\D/g, "");
    if (digitsOnly === "") {
      setter("");
      return;
    }
    // Remove leading zeros like "040" -> "40"
    const cleaned = digitsOnly.replace(/^0+(?=\d)/, "");
    setter(cleaned);
  };

  // Tournament Info & Schedule
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [map, setMap] = useState("Bermuda");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [maxSlots, setMaxSlots] = useState<string>("48");
  const [contactNumber, setContactNumber] = useState("");

  // UPI Details
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");

  // Custom Room Credentials
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomAnnounced, setRoomAnnounced] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("patelesp_admin_key");
    if (!key) {
      router.push("/admin/login");
      return;
    }
    setAdminKey(key);

    async function loadData() {
      try {
        const [tournRes, statusRes] = await Promise.all([
          fetch("/api/tournament"),
          fetch("/api/db-status"),
        ]);
        const data = await tournRes.json();
        const statusData = await statusRes.json();
        if (statusData.success) {
          setDbStatus(statusData);
        }
        if (data.success && data.tournament) {
          const t: TournamentConfig = data.tournament;
          setTournament(t);
          setTitle(t.title || "");
          setTagline(t.tagline || "");
          setEntryFee(String(t.entryFee ?? 50));
          setFirstPrize(String(t.firstPrize ?? 1000));
          setSecondPrize(String(t.secondPrize ?? 500));
          setPerKillPrize(String(t.perKillPrize ?? 0));
          setMap(t.map || "Bermuda");
          setMatchDate(t.matchDate || "2026-11-08");
          setMatchTime(t.matchTime || "08:30 PM IST");
          setMaxSlots(String(t.maxSlots ?? 48));
          setContactNumber(t.contactNumber || "+91 98765 43210");
          setUpiId(t.upiId || "patelesp@upi");
          setUpiName(t.upiName || "Patel Esports Arena");
          setRoomId(t.roomId || "");
          setRoomPassword(t.roomPassword || "");
          setRoomAnnounced(t.roomAnnounced || false);
        }
      } catch (err) {
        setErrorMsg("Failed to load tournament settings");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          title,
          tagline,
          entryFee: Number(entryFee),
          firstPrize: Number(firstPrize),
          secondPrize: Number(secondPrize),
          perKillPrize: Number(perKillPrize),
          map,
          matchDate,
          matchTime,
          maxSlots: Number(maxSlots),
          contactNumber,
          upiId,
          upiName,
          roomId,
          roomPassword,
          roomAnnounced,
        }),
      });

      const data = await res.json();
      if (data.success) {
        soundManager.playSuccessSound();
        setSuccessMsg("Tournament prices, winning rewards, and configuration updated successfully in cloud!");
        setTournament(data.tournament);
      } else {
        setErrorMsg(data.message || "Failed to update settings");
      }
    } catch (err) {
      setErrorMsg("Network error updating settings");
    } finally {
      setSaving(false);
    }
  };

  // Live Financial Calculations
  const calculatedPrizePool = Number(firstPrize || 0) + Number(secondPrize || 0);
  const potentialCollection = Number(entryFee || 0) * Number(maxSlots || 0);
  const organizerNetMargin = potentialCollection - calculatedPrizePool;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-cyber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400">Created by <strong className="text-cyber-400">Juned Patel</strong></span>
            <span className="text-gray-600">|</span>
            <div className="text-xs font-bold text-cyber-400">ADMIN COMMAND CENTER</div>
          </div>
        </div>

        <div className="gaming-card-cyber rounded-3xl p-6 sm:p-8 border-cyber-500/30">
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-dark-800">
            <div className="w-12 h-12 rounded-2xl bg-cyber-500/10 text-cyber-400 flex items-center justify-center border border-cyber-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                Tournament Pricing & Configuration
              </h1>
              <p className="text-xs text-gray-400">
                Configure entry fees per squad, 1st & 2nd winning rewards, match schedule, UPI ID, and room broadcaster
              </p>
            </div>
          </div>

          {/* Database Cloud Status Banner */}
          {dbStatus && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
              dbStatus.provider === "supabase" && dbStatus.connected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : dbStatus.provider === "supabase" && !dbStatus.connected
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  dbStatus.provider === "supabase" && dbStatus.connected
                    ? "bg-emerald-500/20 text-emerald-400"
                    : dbStatus.provider === "supabase"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    {dbStatus.provider === "supabase" ? "Supabase PostgreSQL Database Connected" : "Local File Database"}
                    {dbStatus.connected && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">{dbStatus.message}</p>
                </div>
              </div>
              <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 uppercase">
                {dbStatus.provider === "supabase" ? "Live Cloud Sync" : "JSON Backup"}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. SQUAD ENTRY FEE & WINNING PRIZES */}
            <div className="p-5 sm:p-6 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-fire-400 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Squad Entry Price & Winning Prize Pool (₹ INR)
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-fire-500/10 text-fire-400 border border-fire-500/20">
                  Total Prize: ₹{calculatedPrizePool.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Entry Fee Per Squad */}
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-fire-500 transition-colors">
                  <label className="block text-xs font-black uppercase tracking-wider text-fire-400 mb-1">
                    Entry Fee (₹ Per Squad)
                  </label>
                  <div className="relative flex items-center mt-2">
                    <span className="absolute left-3 text-lg font-bold text-gray-500">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="0"
                      value={entryFee}
                      onChange={(e) => handleNumericInput(e.target.value, setEntryFee)}
                      className="w-full bg-transparent pl-8 pr-3 py-1 text-white font-black text-2xl focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">Charged for all 4 players combined</p>
                </div>

                {/* 1st Prize Winner */}
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-gold-500 transition-colors">
                  <label className="block text-xs font-black uppercase tracking-wider text-gold-400 mb-1">
                    1st Prize Champion (₹)
                  </label>
                  <div className="relative flex items-center mt-2">
                    <span className="absolute left-3 text-lg font-bold text-gray-500">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="0"
                      value={firstPrize}
                      onChange={(e) => handleNumericInput(e.target.value, setFirstPrize)}
                      className="w-full bg-transparent pl-8 pr-3 py-1 text-gold-400 font-black text-2xl focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">Booyah #1 Winner Cash Reward</p>
                </div>

                {/* 2nd Prize Runner-up */}
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-750 focus-within:border-cyber-500 transition-colors">
                  <label className="block text-xs font-black uppercase tracking-wider text-cyber-400 mb-1">
                    2nd Prize Runner-Up (₹)
                  </label>
                  <div className="relative flex items-center mt-2">
                    <span className="absolute left-3 text-lg font-bold text-gray-500">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="0"
                      value={secondPrize}
                      onChange={(e) => handleNumericInput(e.target.value, setSecondPrize)}
                      className="w-full bg-transparent pl-8 pr-3 py-1 text-cyber-400 font-black text-2xl focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2">2nd Place Squad Cash Reward</p>
                </div>
              </div>

              {/* Live Financial Projection Card */}
              <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calculator className="w-4 h-4 text-cyber-400" />
                  <span>Live Financial Summary ({maxSlots} Squads):</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Total Entry Collection: <strong className="text-white">₹{potentialCollection.toLocaleString()}</strong></span>
                  <span>Prize Payout: <strong className="text-fire-400">₹{calculatedPrizePool.toLocaleString()}</strong></span>
                  <span>Host Profit Margin: <strong className={organizerNetMargin >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {organizerNetMargin >= 0 ? `+₹${organizerNetMargin.toLocaleString()}` : `-₹${Math.abs(organizerNetMargin).toLocaleString()}`}
                  </strong></span>
                </div>
              </div>
            </div>

            {/* 2. TOURNAMENT INFO & SCHEDULE */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <h3 className="text-sm font-bold text-cyber-400 uppercase tracking-wider flex items-center gap-2">
                <Swords className="w-4 h-4" /> Tournament Branding & Match Schedule
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Tournament Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. PATELESP FREE FIRE SQUAD SHOWDOWN"
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. India's Ultimate Free Fire Battle Royale Arena"
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Match Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Match Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08:30 PM IST"
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Battle Royale Map
                  </label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  >
                    <option value="Bermuda">Bermuda (Standard)</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari (Desert)</option>
                    <option value="Alpine">Alpine (Snow/Forest)</option>
                    <option value="NexTerra">NexTerra (Sci-Fi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Max Allowed Squad Slots
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="48"
                    value={maxSlots}
                    onChange={(e) => handleNumericInput(e.target.value, setMaxSlots)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Default 48 slots for full custom lobby</p>
                </div>
              </div>
            </div>

            {/* 3. UPI PAYMENT COLLECTION & SUPPORT HELPLINE */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <h3 className="text-sm font-bold text-cyber-400 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> UPI Payment Collection & Support Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Host UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. patelesp@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Generates dynamic QR for entry fee</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Receiver / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel Esports Arena"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Appears on UPI apps (GPay, PhonePe)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Organizer WhatsApp / Helpline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Displayed on ticket for player queries</p>
                </div>
              </div>
            </div>

            {/* 4. CUSTOM ROOM BROADCASTER */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-fire-400 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4" /> Free Fire Custom Room Credentials
                </h3>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-750">
                  <input
                    type="checkbox"
                    checked={roomAnnounced}
                    onChange={(e) => setRoomAnnounced(e.target.checked)}
                    className="w-4 h-4 rounded text-fire-500 bg-dark-950 border-dark-750"
                  />
                  <span>Broadcast to Verified Teams</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Custom Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9812401"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Only revealed when Broadcast is enabled</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Custom Room Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Kept confidential until match broadcast</p>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-cyber-gradient text-dark-950 text-sm font-black uppercase tracking-wider shadow-glow-cyber hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                    Saving to Cloud...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Tournament Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
