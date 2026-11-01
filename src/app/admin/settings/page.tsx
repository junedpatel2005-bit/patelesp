"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, Settings, Trophy, Flame, ArrowLeft, Save, 
  IndianRupee, Calendar, Clock, MapPin, Check, AlertCircle, Key, Database, Cloud, Server 
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

  // Form states
  const [title, setTitle] = useState("");
  const [entryFee, setEntryFee] = useState<number>(50);
  const [firstPrize, setFirstPrize] = useState<number>(1000);
  const [secondPrize, setSecondPrize] = useState<number>(500);
  const [map, setMap] = useState("Bermuda");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [maxSlots, setMaxSlots] = useState<number>(48);
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
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
          setTitle(t.title);
          setEntryFee(t.entryFee);
          setFirstPrize(t.firstPrize);
          setSecondPrize(t.secondPrize);
          setMap(t.map);
          setMatchDate(t.matchDate);
          setMatchTime(t.matchTime);
          setMaxSlots(t.maxSlots);
          setUpiId(t.upiId);
          setUpiName(t.upiName);
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
          entryFee: Number(entryFee),
          firstPrize: Number(firstPrize),
          secondPrize: Number(secondPrize),
          map,
          matchDate,
          matchTime,
          maxSlots: Number(maxSlots),
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
        setSuccessMsg("Tournament settings and prizes updated successfully!");
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
          <div className="text-xs font-bold text-cyber-400">ADMIN CONTROL</div>
        </div>

        <div className="gaming-card-cyber rounded-3xl p-6 sm:p-8 border-cyber-500/30">
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-dark-800">
            <div className="w-12 h-12 rounded-2xl bg-cyber-500/10 text-cyber-400 flex items-center justify-center border border-cyber-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                Tournament & Prize Pool Settings
              </h1>
              <p className="text-xs text-gray-400">
                Update entry fee, 1st & 2nd prize amounts, custom room credentials, and UPI collection ID
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
                    {dbStatus.provider === "supabase" ? "Supabase Cloud Database" : "Local File Database"}
                    {dbStatus.connected && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">{dbStatus.message}</p>
                </div>
              </div>
              <div className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 uppercase">
                {dbStatus.provider === "supabase" ? "PostgreSQL" : "JSON Backup"}
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
            {/* PRIZE POOL & ENTRY FEE */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <h3 className="text-sm font-bold text-fire-400 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Entry Amount & Prize Pool (₹ INR)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-black text-lg focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Charged per squad</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    1st Prize Winner (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={firstPrize}
                    onChange={(e) => setFirstPrize(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-gold-500 rounded-xl px-4 py-2.5 text-gold-400 font-black text-lg focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Champion Cash Reward</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    2nd Prize Winner (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={secondPrize}
                    onChange={(e) => setSecondPrize(Number(e.target.value))}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-cyber-400 font-black text-lg focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Runner-up Cash Reward</p>
                </div>
              </div>
            </div>

            {/* TOURNAMENT TITLE & SLOTS */}
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
                  className="w-full bg-dark-900 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Max Squad Slots
                </label>
                <input
                  type="number"
                  required
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                  Match Map
                </label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                >
                  <option value="Bermuda">Bermuda</option>
                  <option value="Purgatory">Purgatory</option>
                  <option value="Kalahari">Kalahari</option>
                  <option value="Alpine">Alpine</option>
                  <option value="NexTerra">NexTerra</option>
                </select>
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
                  className="w-full bg-dark-900 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* UPI PAYMENT COLLECTION SETTINGS */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <h3 className="text-sm font-bold text-cyber-400 uppercase tracking-wider flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> UPI Payment Collection Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. patelesp@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Teams pay entry fee to this UPI</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Receiver / Business Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patel Esports"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CUSTOM ROOM BROADCAST */}
            <div className="p-5 rounded-2xl bg-dark-900 border border-dark-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-fire-400 uppercase tracking-wider flex items-center gap-2">
                  <Key className="w-4 h-4" /> Free Fire Custom Room Credentials
                </h3>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roomAnnounced}
                    onChange={(e) => setRoomAnnounced(e.target.checked)}
                    className="w-4 h-4 rounded text-fire-500 bg-dark-950 border-dark-750"
                  />
                  Broadcast to Verified Teams
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Room ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9812401"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
                    Room Password
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
                  />
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
                    Saving Changes...
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
