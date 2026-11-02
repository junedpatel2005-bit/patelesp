"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Users, BookOpen, Menu, X } from "lucide-react";

export default function WebsiteNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-red-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Juned Tag */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-sm font-black text-white text-2xl tracking-tighter border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.6)] group-hover:bg-red-700 transition">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider text-white">
                  PATEL<span className="text-red-500">ESP</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-red-950 text-red-400 border border-red-600/40 px-2 py-0.5 rounded">
                  Free Fire Squad
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide">
                Created &amp; Developed by <span className="text-white font-semibold">Juned</span>
              </p>
            </div>
          </Link>

          {/* Desktop Nav - Admin removed, access only via URL /admin */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-semibold tracking-wider text-gray-200 hover:text-red-500 transition uppercase"
            >
              Tournament
            </Link>
            <Link
              href="/#register"
              className="text-sm font-semibold tracking-wider text-gray-200 hover:text-red-500 transition uppercase flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-red-500" />
              Register Squad
            </Link>
            <Link
              href="/participate"
              className="text-sm font-semibold tracking-wider text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold uppercase transition flex items-center gap-2 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              <Shield className="w-4 h-4" />
              Participate (Slots 1-12)
            </Link>
            <Link
              href="/#rules"
              className="text-sm font-semibold tracking-wider text-gray-200 hover:text-red-500 transition uppercase flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-red-500" />
              Rules
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown - Admin removed */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800 flex flex-col gap-3 pb-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-200 hover:text-red-500 py-1"
            >
              Tournament Home
            </Link>
            <Link
              href="/#register"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-200 hover:text-red-500 py-1 flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-red-500" />
              Register Squad
            </Link>
            <Link
              href="/participate"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-white bg-red-600 px-4 py-2 rounded flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Participate (Slots 1-12)
            </Link>
            <Link
              href="/#rules"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-200 hover:text-red-500 py-1 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-red-500" />
              Esports Rules
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
