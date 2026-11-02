"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Phone, UserCheck, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2, Trash2 } from "lucide-react";
import { TeamRegistration } from "@/lib/types";
import PaymentModal from "./PaymentModal";

interface RegistrationSectionProps {
  teamsCount: number;
  maxTeams: number;
  tournament?: any;
  onRegistered: (team: TeamRegistration) => void;
}

export default function RegistrationSection({
  teamsCount,
  maxTeams = 12,
  tournament,
  onRegistered,
}: RegistrationSectionProps) {
  const isFull = teamsCount >= maxTeams;

  const [teamName, setTeamName] = useState("");
  // IGL (Player 1)
  const [iglName, setIglName] = useState("");
  const [iglUid, setIglUid] = useState("");
  const [iglPhone, setIglPhone] = useState("");

  // Player 2
  const [p2Name, setP2Name] = useState("");
  const [p2Uid, setP2Uid] = useState("");

  // Player 3
  const [p3Name, setP3Name] = useState("");
  const [p3Uid, setP3Uid] = useState("");

  // Player 4
  const [p4Name, setP4Name] = useState("");
  const [p4Uid, setP4Uid] = useState("");

  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTeam, setSuccessTeam] = useState<TeamRegistration | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const resetAllFormFields = () => {
    setTeamName("");
    setIglName("");
    setIglUid("");
    setIglPhone("");
    setP2Name("");
    setP2Uid("");
    setP3Name("");
    setP3Uid("");
    setP4Name("");
    setP4Uid("");
  };

  const handleCancelRegistration = async () => {
    if (!successTeam) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel the registration for squad "${successTeam.teamName}"? Slot #${successTeam.slotNumber} will be released and opened for other teams immediately.`
    );
    if (!confirmed) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/teams?teamId=${successTeam.id}&slot=${successTeam.slotNumber}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Slot #${successTeam.slotNumber} has been successfully cancelled and released.`);
        setSuccessTeam(null);
        setShowPaymentModal(false);
        resetAllFormFields();
        setError(null);
        try {
          localStorage.setItem("patelesp_price_sync", String(Date.now()));
          window.dispatchEvent(new Event("teams:registered_event"));
        } catch (e) {}
      } else {
        alert(data.message || "Failed to cancel registration.");
      }
    } catch (err: any) {
      alert("Error cancelling registration. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isFull) {
      setError("Registration is closed! All 12 slots are full.");
      return;
    }

    if (!teamName.trim()) {
      setError("Please enter your Team Name.");
      return;
    }
    if (!iglName.trim()) {
      setError("Please enter Player 1 (IGL) Name.");
      return;
    }
    const cleanPhone = iglPhone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit WhatsApp/Phone Number for the IGL (+91).");
      return;
    }
    if (!p2Name.trim() || !p3Name.trim() || !p4Name.trim()) {
      setError("All 4 player names are required for squad participation.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          igl: {
            name: iglName,
            uid: iglUid,
            phone: `+91${cleanPhone}`,
          },
          player2: {
            name: p2Name,
            uid: p2Uid,
          },
          player3: {
            name: p3Name,
            uid: p3Uid,
          },
          player4: {
            name: p4Name,
            uid: p4Uid,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccessTeam(data.team);
      setShowPaymentModal(true);
      onRegistered(data.team);

      // Trigger cross-tab sync so admin panel immediately picks up the new unpaid registration
      try {
        localStorage.setItem("patelesp_price_sync", String(Date.now()));
        window.dispatchEvent(new Event("teams:registered_event"));
      } catch (e) {}

      // Reset form
      setTeamName("");
      setIglName("");
      setIglUid("");
      setIglPhone("");
      setP2Name("");
      setP2Uid("");
      setP3Name("");
      setP3Uid("");
      setP4Name("");
      setP4Uid("");
    } catch (err: any) {
      setError(err?.message || "Failed to register squad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register" className="py-16 bg-black relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 bg-red-950/40 border border-red-600/30 px-3.5 py-1 rounded-full mb-3">
            <Users className="w-3.5 h-3.5" />
            Official Squad Registration
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            REGISTER YOUR <span className="text-red-600">SQUAD</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Total capacity: 12 Teams (48 Players). Slots assigned chronologically.
          </p>

          {/* Slot Capacity Status Indicator */}
          <div className="mt-4 inline-flex items-center gap-4 bg-zinc-950 border border-zinc-800 px-5 py-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isFull ? "bg-red-600 animate-ping" : "bg-green-500 animate-pulse"}`} />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {isFull ? "Registration Status:" : "Slots Remaining:"}
              </span>
            </div>
            <span className="text-base font-black text-white">
              {isFull ? (
                <span className="text-red-500">SLOTS FULL (12/12)</span>
              ) : (
                <span className="text-white">
                  {maxTeams - teamsCount} Slots Open <span className="text-gray-500 text-xs font-normal">({teamsCount}/{maxTeams} Teams • {teamsCount * 4}/48 Players)</span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* SLOTS FULL BANNER - User required: "also when 48 player done then at main website show slots full" */}
        {isFull ? (
          <div className="bg-red-950/70 border-2 border-red-600 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-lg">
              !
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
              SLOTS FULL - ALL 48 PLAYERS REGISTERED
            </h3>
            <p className="mt-2 text-gray-300 max-w-lg mx-auto text-sm">
              All 12 Squad slots (48 players) for this tournament have been officially claimed. Stay tuned for the next season or check the live participating squads below.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/participate"
                className="bg-white text-black hover:bg-gray-200 font-extrabold text-sm uppercase px-6 py-3 rounded-lg flex items-center gap-2 transition"
              >
                View Participating Teams (Slots 1-12)
                <ArrowRight className="w-4 h-4 text-red-600" />
              </Link>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form
            onSubmit={handleSubmit}
            className="bg-zinc-950 border-2 border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 sm:p-8 shadow-xl relative"
          >
            {/* Success Modal / Banner */}
            {successTeam && (
              <div className="mb-8 bg-zinc-950 border-2 border-red-500 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-xl sm:text-2xl font-black text-white uppercase">
                  Squad Registered Successfully!
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  Team <span className="text-red-400 font-bold">{successTeam.teamName}</span> has secured{" "}
                  <span className="bg-red-600 text-white font-extrabold px-2.5 py-0.5 rounded ml-1">
                    SLOT #{successTeam.slotNumber}
                  </span>
                </p>

                {/* Next Step Payment Notice */}
                <div className="mt-5 p-4 rounded-xl bg-black border border-red-600/50 text-left max-w-lg mx-auto">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-zinc-800">
                    <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">
                      ⚠️ Final Step to Confirm Slot
                    </span>
                    <span className="text-xs font-bold text-white bg-red-600/60 px-2 py-0.5 rounded">
                      Fee: ₹{tournament?.squadPrice ?? 150}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mb-2">
                    Pay the squad entry fee to complete slot verification:
                  </p>
                  <div className="bg-zinc-900 p-2.5 rounded-lg text-xs space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Number:</span>
                      <strong className="text-white text-sm">
                        {tournament?.paymentNumber || "+919054358668"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <strong className="text-red-400 font-bold">
                        {tournament?.paymentName || "Juned Rafik Patel"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">App:</span>
                      <span className="text-gray-300">GPay / PhonePe / Paytm / UPI</span>
                    </div>
                  </div>

                  {/* UTR Copy reminder */}
                  <div className="mt-3 bg-amber-950/70 border border-amber-500/80 rounded-lg p-2.5 flex items-start gap-2">
                    <span className="text-xs bg-amber-500 text-black font-black uppercase px-1.5 py-0.5 rounded shrink-0">
                      UTR
                    </span>
                    <p className="text-xs font-bold text-amber-200">
                      ⚠️ <strong>Please copy your UTR / UPI Ref number</strong> when you complete payment in your UPI app, and paste it in the payment window!
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="text-xs uppercase font-black bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    <span>⚡ Pay ₹{tournament?.squadPrice ?? 100} &amp; View QR Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/918849596369?text=${encodeURIComponent(
                      `Hello Juned, I have registered squad "${successTeam.teamName}" for Slot #${successTeam.slotNumber}. Here is my payment screenshot for the entry fee.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs uppercase font-black bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-md"
                  >
                    <span>Send Screenshot on WhatsApp</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <Link
                    href="/participate"
                    className="text-xs uppercase font-extrabold bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
                  >
                    View Slot in Participate List
                  </Link>

                  {tournament?.whatsappGroupLink && (
                    <a
                      href={tournament.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs uppercase font-extrabold bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Join WhatsApp Group</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Cancel Registration Button (when payment not done) */}
                  {successTeam.paymentStatus !== "paid" && (
                    <button
                      type="button"
                      onClick={handleCancelRegistration}
                      disabled={cancelling}
                      className="text-xs uppercase font-extrabold bg-zinc-900 hover:bg-red-950/80 text-red-400 hover:text-red-300 border border-zinc-800 hover:border-red-600 px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      title="Cancel squad registration and release this slot"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${cancelling ? "animate-spin" : "text-red-500"}`} />
                      <span>{cancelling ? "Cancelling Slot..." : "Cancel Registration"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-950/80 border border-red-600 text-red-200 p-4 rounded-xl text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* BOX: TEAM NAME */}
            <div className="mb-8">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-300 mb-2">
                1. Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter Official Squad Name (e.g., TEAM DRAGON)"
                required
                className="w-full bg-black border-2 border-zinc-800 focus:border-red-600 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 font-bold focus:outline-none transition shadow-inner"
              />
            </div>

            {/* 4 BOXES FOR PLAYERS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  2. Squad Players Details (4 Players Required)
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  UID is Optional • IGL Phone is Required
                </span>
              </div>

              {/* BOX 1: IGL (In-Game Leader) */}
              <div className="bg-black/80 border-2 border-red-600/70 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="text-sm font-black text-white uppercase tracking-wider">
                      Player 1 — IGL (In-Game Leader)
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-red-950 text-red-400 border border-red-700/60 px-2 py-0.5 rounded">
                    Team Captain
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Player Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={iglName}
                      onChange={(e) => setIglName(e.target.value)}
                      placeholder="IGL Name"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>

                  {/* Free Fire UID (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Free Fire UID <span className="text-gray-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={iglUid}
                      onChange={(e) => setIglUid(e.target.value)}
                      placeholder="e.g. 512893471"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>

                  {/* IGL Phone Number with +91 prefilled and 10 digits restriction */}
                  <div>
                    <label className="block text-[11px] font-bold text-red-400 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-red-500" />
                        IGL Phone / WhatsApp <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {iglPhone.length}/10 digits
                      </span>
                    </label>
                    <div className="flex rounded-lg overflow-hidden border-2 border-red-900/60 focus-within:border-red-500 transition">
                      <span className="inline-flex items-center px-3 bg-zinc-900 text-gray-200 font-mono font-bold text-sm border-r border-zinc-800 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={iglPhone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setIglPhone(digitsOnly);
                        }}
                        placeholder="10-digit number"
                        required
                        className="flex-1 bg-zinc-950 px-3 py-2 text-white text-sm font-mono placeholder-gray-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  * Custom Room ID &amp; Password will be sent strictly to this IGL WhatsApp number 15 mins prior to the match.
                </p>
              </div>

              {/* BOX 2: Player 2 */}
              <div className="bg-black/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded bg-zinc-800 text-gray-300 font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                    Player 2
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Player Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      placeholder="Player 2 Name"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Free Fire UID <span className="text-gray-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={p2Uid}
                      onChange={(e) => setP2Uid(e.target.value)}
                      placeholder="e.g. 512893472"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BOX 3: Player 3 */}
              <div className="bg-black/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded bg-zinc-800 text-gray-300 font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                    Player 3
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Player Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={p3Name}
                      onChange={(e) => setP3Name(e.target.value)}
                      placeholder="Player 3 Name"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Free Fire UID <span className="text-gray-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={p3Uid}
                      onChange={(e) => setP3Uid(e.target.value)}
                      placeholder="e.g. 512893473"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BOX 4: Player 4 */}
              <div className="bg-black/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded bg-zinc-800 text-gray-300 font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <span className="text-sm font-bold text-gray-200 uppercase tracking-wider">
                    Player 4
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 mb-1">
                      Player Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={p4Name}
                      onChange={(e) => setP4Name(e.target.value)}
                      placeholder="Player 4 Name"
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Free Fire UID <span className="text-gray-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={p4Uid}
                      onChange={(e) => setP4Uid(e.target.value)}
                      placeholder="e.g. 512893474"
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. OFFICIAL ENTRY FEE PAYMENT BOX */}
            <div className="mt-8 bg-zinc-900/90 border-2 border-red-600/70 rounded-xl p-5 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500 flex items-center justify-center text-red-500 font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                      3. Official Tournament Entry Fee Payment
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Pay via Google Pay / PhonePe / Paytm / BHIM UPI to confirm slot
                    </p>
                  </div>
                </div>
                <div className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded">
                  Fee: ₹{tournament?.squadPrice ?? 150} / Squad
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black border border-zinc-800 p-3.5 rounded-lg text-xs">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">
                    Payment Mobile Number:
                  </span>
                  <div className="text-base font-black text-white tracking-wider text-glow-red mt-0.5">
                    {tournament?.paymentNumber || "+919054358668"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block">
                    Payee Account Name:
                  </span>
                  <div className="text-sm font-black text-red-400 uppercase mt-0.5">
                    {tournament?.paymentName || "Juned Rafik Patel"}
                  </div>
                </div>
              </div>
              <div className="mt-3 bg-amber-950/70 border-2 border-amber-500/80 rounded-xl p-3 flex items-start gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 shrink-0 font-black text-xs">
                  UTR
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2 py-0.5 rounded font-mono inline-block mb-1">
                    IMPORTANT INSTRUCTION
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-amber-200 leading-snug">
                    ⚠️ Please copy your 12-digit UPI UTR / Ref Number when you complete payment in your UPI app (Google Pay, PhonePe, Paytm), and paste it in the payment confirmation popup to verify your squad slot!
                  </p>
                </div>
              </div>

              <div className="mt-3 bg-red-950/60 border border-red-800/60 rounded-lg p-2.5 flex items-center gap-2">
                <span className="text-[10px] bg-red-600 text-white font-black uppercase px-2 py-0.5 rounded shrink-0">
                  MANDATORY
                </span>
                <p className="text-[11px] font-bold text-red-200">
                  Tournament entry fee is 100% strictly NON-REFUNDABLE under any circumstance.
                </p>
              </div>

              <p className="text-[11px] text-gray-400 mt-2">
                * After submitting your squad registration below, the payment QR &amp; app links will open. Please copy and enter your UTR number or send the screenshot on WhatsApp to activate your slot.
              </p>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading || isFull}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-gray-500 text-white font-black text-base uppercase py-4 rounded-xl transition duration-200 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] cursor-pointer"
              >
                {loading ? (
                  <span className="animate-pulse">CONFIRMING SLOT...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    SUBMIT &amp; CONFIRM SQUAD SLOT
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-400 mt-3">
                By registering, you agree to official Free Fire tournament rules and fair play guidelines. Money is strictly non-refundable.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Payment Pop-up Modal with Dynamic & Official QR Code + Mobile UPI Intent Redirects */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        team={successTeam}
        tournament={tournament}
        onPaymentSubmitted={(updated) => {
          setSuccessTeam(updated);
        }}
        onCancelRegistration={handleCancelRegistration}
      />
    </section>
  );
}
