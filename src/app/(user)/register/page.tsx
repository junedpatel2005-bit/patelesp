"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { 
  Users, Shield, Trophy, Flame, QrCode, Copy, Check, 
  AlertCircle, ArrowRight, CheckCircle2, UserCheck, Smartphone 
} from "lucide-react";
import { TournamentConfig, Player } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [tournament, setTournament] = useState<TournamentConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");

  const [players, setPlayers] = useState<[Player, Player, Player, Player]>([
    { name: "", freeFireUid: "", inGameName: "", isCaptain: true },
    { name: "", freeFireUid: "", inGameName: "" },
    { name: "", freeFireUid: "", inGameName: "" },
    { name: "", freeFireUid: "", inGameName: "" },
  ]);

  const [utrNumber, setUtrNumber] = useState("");
  const [includeSub, setIncludeSub] = useState(false);
  const [substitute, setSubstitute] = useState<Player>({ name: "", freeFireUid: "", inGameName: "" });

  useEffect(() => {
    async function fetchTournament() {
      try {
        const res = await fetch("/api/tournament");
        const data = await res.json();
        if (data.success) {
          setTournament(data.tournament);
        }
      } catch (err) {
        console.error("Failed to load tournament config", err);
      }
    }
    fetchTournament();
  }, []);

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    const updated = [...players] as [Player, Player, Player, Player];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPlayers(updated);
  };

  const copyUpiId = () => {
    const upi = tournament?.upiId || "patelesp@upi";
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Only Name is required! All other placeholders/fields are optional
    const p1Name = players[0]?.name?.trim();
    const tName = teamName.trim();
    if (!p1Name && !tName) {
      setErrorMsg("Please enter your Name to register");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: tName || (p1Name ? `${p1Name}'s Squad` : "Patel Squad"),
          captainPhone: captainPhone.trim() || "Not Provided",
          captainEmail: captainEmail?.trim() || undefined,
          players,
          substitutePlayer: includeSub && substitute.name ? substitute : undefined,
          utrNumber: utrNumber.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Registration failed. Please check your details.");
        setLoading(false);
        return;
      }

      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect to ticket page
      setTimeout(() => {
        router.push(`/ticket/${data.team.id}`);
      }, 1000);
    } catch (err) {
      setErrorMsg("Network error. Please try submitting again.");
      setLoading(false);
    }
  };

  const upiId = tournament?.upiId || "patelesp@upi";
  const upiName = tournament?.upiName || "Patel Esports";
  const entryFee = tournament?.entryFee || 50;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${entryFee}&cu=INR&tn=PATELESP%20Squad%20Entry`
  )}`;

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Summary */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fire-500/10 border border-fire-500/30 text-fire-400 text-xs font-bold uppercase mb-3">
            <Flame className="w-3.5 h-3.5" /> 4-Player Squad Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            REGISTER YOUR SQUAD
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl mx-auto">
            Fill in your 4 players&apos; names and Free Fire UIDs, pay the ₹{entryFee} entry amount, and lock your squad slot.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="gaming-card rounded-2xl p-4 mb-8 grid grid-cols-3 gap-2 text-center border-dark-750">
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">Squad Entry Fee</p>
            <p className="text-xl sm:text-2xl font-black text-fire-400">₹{entryFee}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">1st Prize Winner</p>
            <p className="text-xl sm:text-2xl font-black text-gold-400">₹{tournament?.firstPrize || 1000}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-semibold uppercase">2nd Prize Winner</p>
            <p className="text-xl sm:text-2xl font-black text-cyber-400">₹{tournament?.secondPrize || 500}</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: TEAM & CAPTAIN CONTACT */}
          <div className="gaming-card rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-dark-800">
              <div className="w-9 h-9 rounded-xl bg-fire-500/20 text-fire-400 flex items-center justify-center font-black">
                1
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Squad & Contact Details</h3>
                <p className="text-xs text-gray-400">All fields below are optional - enter if available</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Team Name <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. SoulFire Esports, Total Dominators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Captain WhatsApp / Phone <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">Room ID will be sent here if provided</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Captain Email <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="captain@email.com"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-3 text-white placeholder-gray-400 text-sm focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: PLAYERS ROSTER (ONLY NAME REQUIRED) */}
          <div className="gaming-card rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-dark-800">
              <div className="w-9 h-9 rounded-xl bg-fire-500/20 text-fire-400 flex items-center justify-center font-black">
                2
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Squad Players (Only Name Required)</h3>
                <p className="text-xs text-gray-400">Only your name is mandatory; all other placeholders and fields are optional</p>
              </div>
            </div>

            <div className="space-y-5">
              {players.map((player, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-dark-900/90 border border-dark-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-fire-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4" />
                      Player #{idx + 1} {idx === 0 ? "(Captain / You)" : "(Teammate)"}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {idx === 0 ? "Required Name" : "Optional"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                        Player Name {idx === 0 ? <span className="text-fire-500 font-bold">* (Required)</span> : <span className="text-gray-400">(Optional)</span>}
                      </label>
                      <input
                        type="text"
                        required={idx === 0}
                        placeholder={idx === 0 ? "Enter Your Name *" : `Player ${idx + 1} Name`}
                        value={player.name}
                        onChange={(e) => handlePlayerChange(idx, "name", e.target.value)}
                        className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-lg px-3 py-2 text-white text-xs focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        Free Fire UID <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 192837465"
                        value={player.freeFireUid}
                        onChange={(e) => handlePlayerChange(idx, "freeFireUid", e.target.value)}
                        className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                        In-Game Name <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PTL・HUNTER"
                        value={player.inGameName || ""}
                        onChange={(e) => handlePlayerChange(idx, "inGameName", e.target.value)}
                        className="w-full bg-dark-950 border border-dark-750 focus:border-fire-500 rounded-lg px-3 py-2 text-white text-xs focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Optional 5th Substitute */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIncludeSub(!includeSub)}
                  className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${includeSub ? "bg-fire-500 border-fire-500 text-white" : "border-dark-700"}`}>
                    {includeSub && <Check className="w-3 h-3" />}
                  </span>
                  Add 5th Substitute Player (Optional backup)
                </button>

                {includeSub && (
                  <div className="mt-3 p-4 rounded-xl bg-dark-900/60 border border-dark-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sub Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="Substitute Name"
                        value={substitute.name}
                        onChange={(e) => setSubstitute({ ...substitute, name: e.target.value })}
                        className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sub Free Fire UID (Optional)</label>
                      <input
                        type="text"
                        placeholder="Free Fire UID"
                        value={substitute.freeFireUid}
                        onChange={(e) => setSubstitute({ ...substitute, freeFireUid: e.target.value })}
                        className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-400 mb-1">Sub IGN (Optional)</label>
                      <input
                        type="text"
                        placeholder="In-Game Name"
                        value={substitute.inGameName || ""}
                        onChange={(e) => setSubstitute({ ...substitute, inGameName: e.target.value })}
                        className="w-full bg-dark-950 border border-dark-750 rounded-lg px-3 py-2 text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: UPI ENTRY FEE PAYMENT */}
          <div className="gaming-card rounded-2xl p-5 sm:p-8 border-fire-500/30">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-dark-800">
              <div className="w-9 h-9 rounded-xl bg-fire-500/20 text-fire-400 flex items-center justify-center font-black">
                3
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Entry Fee Payment (₹{entryFee})</h3>
                <p className="text-xs text-gray-400">Scan QR Code using PhonePe, Google Pay, or Paytm (UTR is optional)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* QR Code & UPI Copy */}
              <div className="flex flex-col items-center text-center p-5 sm:p-6 bg-dark-900 rounded-2xl border border-dark-800">
                <div className="p-3 bg-white rounded-2xl shadow-glow-fire/20 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrUrl}
                    alt="PATELESP UPI QR Code"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg"
                  />
                </div>

                <div className="w-full flex items-center justify-between bg-dark-950 px-4 py-2.5 rounded-xl border border-dark-750 text-xs">
                  <div className="text-left font-mono text-gray-300 truncate mr-2">
                    {upiId}
                  </div>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="flex items-center gap-1 text-fire-400 hover:text-white font-bold transition-colors"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copiedUpi ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Accepted on GPay, PhonePe, Paytm, BHIM</p>
              </div>

              {/* UTR Input Form */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-fire-500/10 border border-fire-500/20 text-xs text-fire-300 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-fire-400">
                    <Smartphone className="w-4 h-4" /> Payment Reference:
                  </p>
                  <p>1. Scan the QR code or send ₹{entryFee} to {upiId}.</p>
                  <p>2. Enter your 12-digit UTR below if available, or submit and verify later.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">
                    12-Digit UTR / UPI Ref ID <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 431289124012 (Optional)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-3 text-white font-mono text-sm tracking-wider focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">If not paid yet, leave empty and register now</p>
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="text-center pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider bg-fire-gradient text-white shadow-glow-fire hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Locking Your Squad Slot...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5" />
                  SUBMIT SQUAD REGISTRATION (₹{entryFee})
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400">
              Only Name is required • Fast instant squad registration
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-400">
                Created by <strong className="text-fire-400">Juned Patel</strong>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
