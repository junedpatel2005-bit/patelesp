"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Smartphone,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  X,
  Trash2,
  Download,
  Gamepad2,
  Users,
  AlertTriangle,
  HelpCircle,
  QrCode,
  Phone,
} from "lucide-react";
import { TeamRegistration, TournamentData } from "@/lib/types";
import { getSocket } from "@/lib/socket-client";
import Link from "next/link";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: TeamRegistration | null;
  tournament: TournamentData | null;
  onPaymentSubmitted?: (updatedTeam: TeamRegistration) => void;
  onCancelRegistration?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  team,
  tournament,
  onPaymentSubmitted,
  onCancelRegistration,
}: PaymentModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrMode, setQrMode] = useState<"official" | "dynamic">("official");
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [utr, setUtr] = useState("");
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrSuccess, setUtrSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live status from real-time socket or local update
  const [currentStatus, setCurrentStatus] = useState<"paid" | "unpaid" | "pending">("unpaid");

  // Tournament payment settings
  const squadPrice = Number(tournament?.squadPrice ?? 40);
  const paymentName = tournament?.paymentName || "Juned Rafik Patel";
  const rawNumber = tournament?.paymentNumber || "9054358668";
  // Clean phone number (strip leading +91 or +) for standard UPI VPAs
  const cleanPhone = rawNumber.replace(/\D/g, "").slice(-10);
  const upiId = tournament?.upiId || "junedpatel2005@okaxis";

  // Compute exact unchangeable UPI payment URI
  const slotNum = team?.slotNumber ?? 1;
  const teamNameClean = (team?.teamName || "Squad").replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20);
  const note = `PATELESP Slot ${slotNum} - ${teamNameClean}`;

  // Amount is strictly written to 2 decimal places and locked
  const lockedAmount = squadPrice.toFixed(2);

  // Standard UPI URI scheme accepted by Google Pay, PhonePe, Paytm, BHIM, etc.
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paymentName
  )}&am=${lockedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Mobile App Specific Deep Links
  const phonePeUri = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paymentName
  )}&am=${lockedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const gPayUri = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paymentName
  )}&am=${lockedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paymentName
  )}&am=${lockedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  const bhimUri = `bhim://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    paymentName
  )}&am=${lockedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Initialize or update status when team changes
  useEffect(() => {
    if (team) {
      setCurrentStatus(team.paymentStatus || "unpaid");
      if (team.paymentUtr) {
        setUtr(team.paymentUtr);
      }
    }
  }, [team]);

  // Generate dynamic QR Code when UPI URI changes
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(upiUri, {
      width: 320,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR generation error:", err));
  }, [upiUri, isOpen]);

  // Listen to real-time Socket.IO updates for this specific team's payment status!
  useEffect(() => {
    if (!isOpen || !team) return;

    const socket = getSocket();
    if (!socket) return;

    const handlePaymentStatus = (payload: any) => {
      const updatedTeam = payload?.team;
      if (updatedTeam && updatedTeam.id === team.id) {
        setCurrentStatus(updatedTeam.paymentStatus);
        if (updatedTeam.paymentStatus === "paid") {
          // Trigger victory confetti!
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {}
        }
      }
    };

    socket.on("team:payment_status", handlePaymentStatus);
    socket.on("teams:updated", (payload: any) => {
      const match = Array.isArray(payload?.teams)
        ? payload.teams.find((t: any) => t.id === team.id)
        : null;
      if (match && match.paymentStatus) {
        setCurrentStatus(match.paymentStatus);
      }
    });

    return () => {
      socket.off("team:payment_status", handlePaymentStatus);
      socket.off("teams:updated");
    };
  }, [isOpen, team]);

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Copy Phone Number to clipboard
  const handleCopyPhone = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  // Submit UTR / Reference number
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    const cleanedUtr = utr.trim();
    if (!cleanedUtr || cleanedUtr.length < 6) {
      setErrorMessage("Please enter a valid UPI Reference / UTR Number (minimum 6 digits).");
      return;
    }

    setSubmittingUtr(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/teams/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.id,
          paymentStatus: "pending",
          paymentUtr: cleanedUtr,
          paymentAmount: squadPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit transaction reference.");
      }

      setCurrentStatus("pending");
      setUtrSuccess(true);
      if (onPaymentSubmitted && data.team) {
        onPaymentSubmitted(data.team);
      }
      try {
        localStorage.setItem("patelesp_price_sync", String(Date.now()));
        window.dispatchEvent(new Event("teams:registered_event"));
      } catch (e) {}

      // Small confetti burst for submitting payment proof
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit payment details.");
    } finally {
      setSubmittingUtr(false);
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-600/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.35)] text-white overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-red-950 p-4 sm:p-5 border-b border-red-600/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-600/40">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                  ENTRY FEE PAYMENT
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                  Slot #{team.slotNumber}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Squad: <strong className="text-white">{team.teamName}</strong> (IGL: {team.igl.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Prominent Free Fire Custom Room Slot Badge */}
          <div className="bg-gradient-to-br from-red-950 via-zinc-950 to-black border-2 border-red-500 rounded-2xl p-4 sm:p-5 text-center shadow-[0_0_25px_rgba(239,68,68,0.4)] relative">
            <div className="inline-flex items-center gap-1.5 bg-red-600/30 border border-red-500/50 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-red-300 mb-2">
              <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
              Free Fire Custom Room Assigned Slot
            </div>

            <div className="my-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                ✓ SLOT IS BOOKED
              </span>
              <div className="inline-flex items-center gap-2 bg-black/80 border-2 border-red-600/70 px-5 py-2 rounded-2xl shadow-inner mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  SLOT <span className="text-red-500">#{team.slotNumber}</span>
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-gray-200 font-bold">
              Team: <span className="text-white uppercase">{team.teamName}</span> • Captain / IGL: <span className="text-red-400">{team.igl.name}</span>
            </p>

            {/* 4 Squad Players Roster */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-left bg-black/70 border border-zinc-800/80 p-2.5 rounded-xl text-[11px]">
              <div className="truncate">
                <span className="text-red-400 font-black mr-1">1.</span>
                <span className="text-white font-bold">{team.igl.name || "IGL"}</span>
                {team.igl.uid && <span className="text-gray-400 text-[10px] block font-mono">UID: {team.igl.uid}</span>}
              </div>
              <div className="truncate">
                <span className="text-gray-400 font-black mr-1">2.</span>
                <span className="text-gray-200">{team.player2.name || "Player 2"}</span>
                {team.player2.uid && <span className="text-gray-400 text-[10px] block font-mono">UID: {team.player2.uid}</span>}
              </div>
              <div className="truncate">
                <span className="text-gray-400 font-black mr-1">3.</span>
                <span className="text-gray-200">{team.player3.name || "Player 3"}</span>
                {team.player3.uid && <span className="text-gray-400 text-[10px] block font-mono">UID: {team.player3.uid}</span>}
              </div>
              <div className="truncate">
                <span className="text-gray-400 font-black mr-1">4.</span>
                <span className="text-gray-200">{team.player4.name || "Player 4"}</span>
                {team.player4.uid && <span className="text-gray-400 text-[10px] block font-mono">UID: {team.player4.uid}</span>}
              </div>
            </div>

            <div className="mt-3 bg-red-950/40 border border-red-600/30 rounded-xl py-2 px-3 text-[11px] text-yellow-300 font-semibold flex items-center justify-center gap-1.5 text-center">
              <span>⚠️</span>
              <span>
                In Free Fire Custom Room, all 4 players MUST sit in <strong>SLOT #{team.slotNumber}</strong>!
              </span>
            </div>
          </div>

          {/* Status Indicator Banner */}
          {currentStatus === "paid" ? (
            <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black uppercase tracking-tight text-emerald-400">
                PAYMENT APPROVED &amp; VERIFIED!
              </h4>
              <p className="text-xs text-emerald-200 mt-1">
                Your squad slot is officially confirmed. Entry fee of <strong>₹{squadPrice}</strong> is paid.
              </p>
              <div className="mt-4">
                <Link
                  href="/participate"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  View Slot #{team.slotNumber} in Roster
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : currentStatus === "pending" ? (
            <div className="bg-amber-950/70 border border-amber-500/50 rounded-2xl p-3.5 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              <div className="text-xs text-amber-200">
                <strong className="text-amber-300 uppercase block font-bold">
                  Payment Submitted (Pending Admin Approval)
                </strong>
                UTR reference submitted. Admin is verifying your payment. Your slot is locked.
              </div>
            </div>
          ) : (
            <div className="bg-red-950/50 border border-red-600/40 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                Please scan the QR code or click an installed UPI app to complete your{" "}
                <strong className="text-white">₹{squadPrice}</strong> squad registration fee.
              </span>
            </div>
          )}

          {/* Amount Card - Strictly locked and read-only */}
          <div className="bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Total Squad Entry Fee (Locked)
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-white">₹{squadPrice}</span>
                <span className="text-xs font-semibold text-gray-400">/ Squad (4 Players)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-yellow-400 border border-yellow-400/30 px-2.5 py-1 rounded-full">
                Fixed Amount
              </span>
              <p className="text-[11px] text-gray-400 mt-1 font-mono">{note}</p>
            </div>
          </div>

          {/* Dynamic & Official QR Code Section */}
          <div className="bg-white rounded-2xl p-5 text-center text-slate-900 shadow-xl border border-zinc-700">
            {/* QR Switcher Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-xs mx-auto mb-3">
              <button
                type="button"
                onClick={() => setQrMode("official")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold uppercase transition ${
                  qrMode === "official"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Official QR Image
              </button>
              <button
                type="button"
                onClick={() => setQrMode("dynamic")}
                className={`flex-1 py-1 px-2.5 rounded-lg text-[11px] font-bold uppercase transition ${
                  qrMode === "dynamic"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Auto-₹{squadPrice} QR
              </button>
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
              {qrMode === "official"
                ? "Scan Official PATELESP QR Code with any UPI App"
                : `Dynamic QR: Amount ₹${squadPrice} automatically locked`}
            </div>

            <div className="flex justify-center my-1">
              {qrMode === "official" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/qr.png"
                  alt="Official PATELESP Payment QR Code"
                  className="w-56 h-56 rounded-xl border border-slate-200 shadow-md p-1 bg-white object-contain"
                />
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`UPI QR Code for ${note}`}
                  className="w-56 h-56 rounded-xl border border-slate-200 shadow-md p-1 bg-white"
                />
              ) : (
                <div className="w-56 h-56 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs animate-pulse">
                  Generating Dynamic QR Code...
                </div>
              )}
            </div>

            {/* Download QR Button */}
            <div className="mt-2">
              <a
                href={qrMode === "official" ? "/qr.png" : qrDataUrl}
                download={
                  qrMode === "official"
                    ? "PATELESP_Official_QR.png"
                    : `PATELESP_Slot_${slotNum}_₹${squadPrice}_QR.png`
                }
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded-lg transition"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>Save QR to Device Gallery</span>
              </a>
            </div>

            <div className="mt-2 text-xs font-bold text-slate-800">
              Payee: <span className="text-red-600">{paymentName}</span>
            </div>

            {/* UPI ID copy pill */}
            <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-slate-700">
              <span>{upiId}</span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 font-sans font-bold"
                title="Copy UPI ID"
              >
                {copied ? (
                  <span className="text-emerald-600 flex items-center gap-0.5 text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Copied
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[11px]">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Direct Mobile App Deep Links */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
              <Smartphone className="w-3.5 h-3.5 text-red-500" />
              Pay Directly via Installed App (Mobile)
            </div>

            {/* Universal Pay via UPI App button */}
            <a
              href={upiUri}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition transform active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              Pay ₹{squadPrice} via Any UPI App (Direct Intent)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Grid of Specific UPI Apps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* PhonePe */}
              <a
                href={phonePeUri}
                className="bg-zinc-900 hover:bg-purple-950/60 border border-zinc-800 hover:border-purple-500 text-gray-200 hover:text-white p-2.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
              >
                <span className="text-purple-400 font-black text-sm">PhonePe</span>
                <span className="text-[10px] text-gray-400 font-normal">Direct App</span>
              </a>

              {/* Google Pay */}
              <a
                href={gPayUri}
                className="bg-zinc-900 hover:bg-blue-950/60 border border-zinc-800 hover:border-blue-500 text-gray-200 hover:text-white p-2.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
              >
                <span className="text-blue-400 font-black text-sm">Google Pay</span>
                <span className="text-[10px] text-gray-400 font-normal">Direct App</span>
              </a>

              {/* Paytm */}
              <a
                href={paytmUri}
                className="bg-zinc-900 hover:bg-sky-950/60 border border-zinc-800 hover:border-sky-500 text-gray-200 hover:text-white p-2.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
              >
                <span className="text-sky-400 font-black text-sm">Paytm</span>
                <span className="text-[10px] text-gray-400 font-normal">Direct App</span>
              </a>

              {/* BHIM */}
              <a
                href={bhimUri}
                className="bg-zinc-900 hover:bg-emerald-950/60 border border-zinc-800 hover:border-emerald-500 text-gray-200 hover:text-white p-2.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center gap-1"
              >
                <span className="text-emerald-400 font-black text-sm">BHIM UPI</span>
                <span className="text-[10px] text-gray-400 font-normal">Direct App</span>
              </a>
            </div>
          </div>

          {/* Paytm Protect & UPI Risk Policy Helper Box */}
          <div className="bg-gradient-to-br from-amber-950/50 via-zinc-900 to-black border-2 border-amber-500/60 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-amber-300">
                    Paytm / PhonePe &ldquo;UPI Risk Policy&rdquo; Alert?
                  </h4>
                  <span className="text-[10px] bg-amber-500 text-black font-black uppercase px-2 py-0.5 rounded-full">
                    Easy Solution
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                  If Paytm or PhonePe shows <span className="text-amber-300 font-semibold">&ldquo;Payment may fail as per UPI Risk Policy&rdquo;</span>, it is normal security protection for website links. Choose either option below to pay smoothly:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Option 1: Scan QR */}
              <div className="bg-black/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex flex-col justify-between transition">
                <div>
                  <div className="flex items-center gap-2 font-black text-white text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Tap &ldquo;Pay via Scanning QR&rdquo;</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Save this QR to your gallery, then select it inside Paytm / PhonePe to complete the ₹{squadPrice} payment.
                  </p>
                </div>
                <a
                  href={qrMode === "official" ? "/qr.png" : qrDataUrl}
                  download={
                    qrMode === "official"
                      ? "PATELESP_Official_QR.png"
                      : `PATELESP_Slot_${slotNum}_₹${squadPrice}_QR.png`
                  }
                  className="mt-2.5 inline-flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold py-2 px-3 rounded-lg border border-zinc-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-red-500" />
                  Save QR to Gallery
                </a>
              </div>

              {/* Option 2: Pay via Mobile */}
              <div className="bg-black/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex flex-col justify-between transition">
                <div>
                  <div className="flex items-center gap-2 font-black text-white text-xs mb-1">
                    <span className="w-5 h-5 rounded-full bg-red-600 text-[10px] text-white flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Tap &ldquo;Pay via Mobile Number&rdquo;</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    Tap &ldquo;Pay via Mobile Number&rdquo; in Paytm and enter: <strong className="text-white font-mono">{cleanPhone}</strong> ({paymentName})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="mt-2.5 inline-flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold py-2 px-3 rounded-lg border border-zinc-700 transition"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Mobile Number Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copy Mobile Number ({cleanPhone})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Manual UPI ID Fallback */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950/90 border border-zinc-800/80 rounded-xl px-3 py-2 text-[11px]">
              <span className="text-gray-300">
                Or open any UPI app manually and pay to: <strong className="text-white font-mono">{upiId}</strong>
              </span>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="text-red-400 hover:text-red-300 font-bold underline transition self-start sm:self-auto shrink-0"
              >
                {copied ? "✓ Copied UPI ID" : "Copy UPI ID"}
              </button>
            </div>
          </div>

          {/* Step 2: Submit UTR / Transaction ID */}
          <form
            onSubmit={handleSubmitUtr}
            className="bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-4 space-y-3"
          >
            {/* Notice to copy UTR after payment */}
            <div className="bg-amber-950/70 border border-amber-500/70 rounded-xl p-2.5 flex items-start gap-2">
              <span className="text-xs bg-amber-500 text-black font-black uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                NOTICE
              </span>
              <p className="text-xs font-bold text-amber-200">
                Please copy your 12-digit UPI UTR / Ref Number when you complete payment in your UPI app, and paste it below:
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="utrInput" className="text-xs font-black uppercase tracking-wider text-gray-200">
                Enter 12-Digit UPI Ref / UTR Number
              </label>
              <span className="text-[10px] font-bold text-amber-400">Mandatory</span>
            </div>

            <div className="flex gap-2">
              <input
                id="utrInput"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value.replace(/\s+/g, ""))}
                placeholder="e.g. 431089234812"
                maxLength={24}
                className="flex-1 bg-black border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 px-3.5 py-2.5 rounded-xl text-sm font-mono text-white placeholder-gray-500 uppercase tracking-wider"
              />
              <button
                type="submit"
                disabled={submittingUtr || !utr.trim()}
                className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                {submittingUtr ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm
              </button>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errorMessage}
              </p>
            )}

            {utrSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                UTR submitted successfully! Real-time status will update once admin verifies.
              </p>
            )}
          </form>

          {/* Footer note */}
          <div className="text-[11px] text-gray-400 text-center space-y-1">
            <p>
              Organizer WhatsApp Support:{" "}
              <a
                href={`https://wa.me/${cleanPhone}?text=Hi%20Juned,%20I%20registered%20team%20${team.teamName}%20in%20Slot%20${team.slotNumber}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline font-bold"
              >
                +{cleanPhone}
              </a>
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-zinc-900 px-4 sm:px-6 py-3 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-white transition uppercase font-semibold cursor-pointer"
            >
              Close &amp; Pay Later
            </button>
            {currentStatus !== "paid" && onCancelRegistration && (
              <button
                type="button"
                onClick={onCancelRegistration}
                className="text-xs text-red-400 hover:text-red-300 transition uppercase font-semibold flex items-center gap-1 cursor-pointer"
                title="Cancel your slot registration and release this slot"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                Cancel Registration
              </button>
            )}
          </div>

          <Link
            href="/participate"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition uppercase"
          >
            Check Slot Roster
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
