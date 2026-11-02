"use client";

import React from "react";
import { QrCode, Shield, Flame, Smartphone } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-14 bg-zinc-950 border-t border-b border-zinc-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* About PATELESP Card */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  ABOUT <span className="text-red-600">PATELESP</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Competitive Free Fire Esports Arena
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">PATELESP</strong> is an elite competitive tournament platform founded and developed by <strong className="text-red-500">Juned</strong>. Created to offer honest, verified, high-octane Free Fire squad competitions with transparent prize distributions, zero tolerance for cheats, and lightning-fast UPI payouts.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-zinc-850">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs text-gray-300 font-semibold">100% Fair Play</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs text-gray-300 font-semibold">Mobile Only (No PC)</span>
              </div>
            </div>
          </div>

          {/* QR Code Next Plan Notice Card */}
          <div className="bg-black border border-red-900/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-600/50 flex items-center justify-center text-red-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  ENTRY FEE &amp; QR CODE
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-red-600 text-white px-2 py-0.5 rounded">
                  Next Update Planned
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Official entry fee payments are accepted via GPay / PhonePe / Paytm / UPI to <strong className="text-white">+91 90543 58668</strong> (<strong className="text-red-400">Juned Rafik Patel</strong>). Confirmations and custom room access are verified directly by Admin Juned via WhatsApp.
            </p>

            <div className="mt-5 bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-gray-400">Payment: <strong className="text-white">+91 90543 58668</strong> (Juned Rafik Patel)</span>
              <span className="text-red-500 font-bold">WhatsApp: +91 8849596369</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
