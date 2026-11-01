"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  Trophy, Flame, ShieldCheck, Clock, AlertTriangle, 
  Copy, Check, Share2, ArrowLeft, Key, Lock, Users, PhoneCall 
} from "lucide-react";
import { TeamRegistration } from "@/lib/types";

interface TicketData {
  team: TeamRegistration;
  tournament: {
    title: string;
    matchDate: string;
    matchTime: string;
    map: string;
    mode: string;
    firstPrize: number;
    secondPrize: number;
    entryFee: number;
    roomAnnounced: boolean;
    roomId: string | null;
    roomPassword: string | null;
  };
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;

  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        const result = await res.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.message || "Ticket not found");
        }
      } catch (err) {
        setError("Failed to fetch ticket information");
      } finally {
        setLoading(false);
      }
    }

    fetchTicket();
  }, [teamId]);

  const copyRoomId = () => {
    if (data?.tournament.roomId) {
      navigator.clipboard.writeText(data.tournament.roomId);
      setCopiedRoom(true);
      setTimeout(() => setCopiedRoom(false), 2000);
    }
  };

  const copyPassword = () => {
    if (data?.tournament.roomPassword) {
      navigator.clipboard.writeText(data.tournament.roomPassword);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    if (!data) return;
    const shareText = `🔥 *PATELESP FREE FIRE SQUAD PASS* 🔥\n\n` +
      `🏆 *Squad:* ${data.team.teamName}\n` +
      `🎫 *Ticket ID:* ${data.team.id}\n` +
      `📊 *Status:* ${data.team.status.toUpperCase()}\n` +
      `📅 *Date:* ${data.tournament.matchDate} at ${data.tournament.matchTime}\n` +
      `📍 *Map:* ${data.tournament.map}\n\n` +
      `Check live Room ID & Password here:\n${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const copyTicketLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-3 border-fire-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm font-medium">Fetching PATELESP Ticket Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="gaming-card rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Ticket Not Found</h2>
          <p className="text-sm text-gray-400">{error || "No squad registration matches this ID."}</p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-fire-gradient text-white text-sm font-bold shadow-glow-fire"
            >
              Register New Squad
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { team, tournament } = data;
  const isApproved = team.status === "approved";
  const isPending = team.status === "pending";
  const isRejected = team.status === "rejected";

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tournament
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={shareToWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 border border-green-500/30 text-xs font-bold hover:bg-green-600/30 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Squad
            </button>
            <button
              onClick={copyTicketLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-900 text-gray-300 border border-dark-750 text-xs font-bold hover:text-white transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* ESPORTS DIGITAL TICKET CARD */}
        <div className="relative gaming-card rounded-3xl overflow-hidden border-2 border-fire-500/30 shadow-glow-fire/20">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-fire-600 via-fire-500 to-amber-500 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-white" />
                  <span className="text-xs font-black tracking-widest uppercase text-white/90">PATELESP OFFICIAL PASS</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{team.teamName}</h1>
                <p className="text-xs text-white/80 mt-1 font-mono">Captain WhatsApp: +91 {team.captainPhone}</p>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                {isApproved && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-950/80 backdrop-blur-md border border-green-400 text-green-400 text-xs font-black tracking-wider uppercase shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    VERIFIED & APPROVED
                  </div>
                )}
                {isPending && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-950/80 backdrop-blur-md border border-amber-400 text-amber-400 text-xs font-black tracking-wider uppercase shadow-lg">
                    <Clock className="w-4 h-4 text-amber-400" />
                    PAYMENT UNDER REVIEW
                  </div>
                )}
                {isRejected && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-950/80 backdrop-blur-md border border-red-400 text-red-400 text-xs font-black tracking-wider uppercase shadow-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    REJECTED
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-8 bg-dark-950">
            {/* Ticket Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-dark-800">
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Ticket ID</p>
                <p className="text-base font-black text-white font-mono">{team.id}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Entry Status</p>
                <p className="text-base font-black text-fire-400">₹{team.entryFeePaid} Paid</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Map & Mode</p>
                <p className="text-base font-black text-white">{tournament.map} (Squad)</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Match Schedule</p>
                <p className="text-base font-black text-white">{tournament.matchTime}</p>
              </div>
            </div>

            {/* CUSTOM ROOM ID & PASSWORD REVEAL BOX */}
            <div className="rounded-2xl p-6 bg-dark-900 border border-dark-750 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-fire-400" />
                  <h3 className="text-base font-bold text-white">Free Fire Custom Room Credentials</h3>
                </div>
                {isApproved && tournament.roomAnnounced ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                    LIVE NOW
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-dark-800 text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              {isApproved && tournament.roomAnnounced && tournament.roomId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-dark-950 border border-fire-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Custom Room ID</p>
                      <p className="text-xl font-black text-white font-mono tracking-wider">{tournament.roomId}</p>
                    </div>
                    <button
                      onClick={copyRoomId}
                      className="p-2 rounded-lg bg-dark-800 text-gray-300 hover:text-white"
                    >
                      {copiedRoom ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-950 border border-fire-500/30 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Room Password</p>
                      <p className="text-xl font-black text-white font-mono tracking-wider">{tournament.roomPassword || "No Pass"}</p>
                    </div>
                    <button
                      onClick={copyPassword}
                      className="p-2 rounded-lg bg-dark-800 text-gray-300 hover:text-white"
                    >
                      {copiedPass ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 text-xs text-gray-400 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {isPending ? (
                      <p>
                        Your payment reference (<strong className="text-white font-mono">{team.utrNumber}</strong>) is currently being reviewed by Admin. Once approved, you will be cleared for the tournament.
                      </p>
                    ) : isRejected ? (
                      <p className="text-red-400">
                        This registration was rejected by the admin. Please contact WhatsApp helpline for assistance.
                      </p>
                    ) : (
                      <p>
                        Room ID and Password will be unlocked and displayed here exactly <strong className="text-white">15 minutes before match time</strong> ({tournament.matchTime}). Keep this page bookmarked!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4-PLAYER ROSTER DISPLAY */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-fire-400" />
                <h3 className="text-base font-bold text-white">Registered 4-Player Squad Roster</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {team.players.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-fire-400">P{idx + 1}.</span>
                        <h5 className="text-sm font-bold text-white">{player.name}</h5>
                        {idx === 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-fire-500/20 text-fire-400 uppercase">
                            Captain
                          </span>
                        )}
                      </div>
                      {player.inGameName && (
                        <p className="text-[11px] text-gray-400">IGN: {player.inGameName}</p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Free Fire UID</p>
                      <p className="text-xs font-mono font-bold text-cyber-400">{player.freeFireUid}</p>
                    </div>
                  </div>
                ))}

                {team.substitutePlayer?.name && (
                  <div className="p-3.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-between sm:col-span-2">
                    <div>
                      <span className="text-xs font-black text-amber-400">SUB.</span>
                      <h5 className="text-sm font-bold text-white inline ml-1.5">{team.substitutePlayer.name}</h5>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase ml-2">
                        Substitute
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Free Fire UID</p>
                      <p className="text-xs font-mono font-bold text-cyber-400">{team.substitutePlayer.freeFireUid}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Helpline Footer */}
            <div className="pt-4 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-fire-400" />
                Need help with your ticket? Contact PATELESP WhatsApp support.
              </span>
              <span className="font-mono text-[11px] text-gray-400">Payment Ref: {team.utrNumber}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
