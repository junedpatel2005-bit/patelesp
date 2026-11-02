"use client";

import React from "react";
import Link from "next/link";
import { Shield, DollarSign, Users, ExternalLink, LogOut, CreditCard, Trophy } from "lucide-react";

interface AdminNavbarProps {
  activeTab: "overview" | "prices" | "teams" | "payments";
  setActiveTab: (tab: "overview" | "prices" | "teams" | "payments") => void;
  onLogout: () => void;
  onCompleteTournament?: () => void;
}

export default function AdminNavbar({
  activeTab,
  setActiveTab,
  onLogout,
  onCompleteTournament,
}: AdminNavbarProps) {
  return (
    <header className="bg-white border-b border-blue-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo - Blue & White */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  PATEL<span className="text-blue-600">ESP</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Created &amp; Developed by <strong className="text-blue-600">Juned</strong>
              </p>
            </div>
          </div>

          {/* 3 Pages/Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <Shield className="w-4 h-4" />
              1. Website Info
            </button>

            <button
              onClick={() => setActiveTab("prices")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 ${
                activeTab === "prices"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              2. Prices &amp; Schedule
            </button>

            <button
              onClick={() => setActiveTab("teams")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 ${
                activeTab === "teams"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              3. Registered Teams (48 Players)
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 ${
                activeTab === "payments"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              4. Payments (UPI)
            </button>
          </nav>

          {/* Action buttons: Visit Website & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Tournament Completed Button */}
            {onCompleteTournament && (
              <button
                type="button"
                onClick={onCompleteTournament}
                className="inline-flex items-center gap-1.5 text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500 px-3 py-2 rounded-xl transition shadow-sm uppercase cursor-pointer"
                title="Mark this tournament as completed and reset all 12 slots for the next match"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-900" />
                <span className="hidden sm:inline">Tournament Completed</span>
                <span className="sm:hidden">Completed</span>
              </button>
            )}

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition"
            >
              <span className="hidden sm:inline">View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2 rounded-lg transition"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Tabs Bar - Optimized for mobile touch & scrolling */}
        <div className="md:hidden flex items-center justify-start sm:justify-between py-2 border-t border-slate-200 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 text-center rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            1. Info
          </button>
          <button
            onClick={() => setActiveTab("prices")}
            className={`px-3 py-2 text-center rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition ${
              activeTab === "prices"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            2. Prices
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-3 py-2 text-center rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition ${
              activeTab === "teams"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            3. Teams (48)
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-3 py-2 text-center rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition ${
              activeTab === "payments"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            4. Payments
          </button>
        </div>
      </div>
    </header>
  );
}
