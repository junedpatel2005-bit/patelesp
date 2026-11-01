"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Shield, Trophy, FileText, Search, UserPlus } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-750 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-fire-gradient p-0.5 shadow-glow-fire flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-fire-500 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">PATEL<span className="text-fire-500">ESP</span></span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded bg-fire-500/20 text-fire-400 border border-fire-500/30 tracking-widest uppercase">FF ARENA</span>
            </div>
            <p className="hidden xs:block text-[10px] sm:text-[11px] font-medium text-gray-400 tracking-wider">OFFICIAL FREE FIRE SQUAD CUP</p>
          </div>
        </Link>

        {/* Navigation Links */}
        {!isAdmin ? (
          <nav className="hidden md:flex items-center gap-1 bg-dark-900/60 p-1.5 rounded-full border border-dark-800">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                pathname === "/"
                  ? "bg-fire-500 text-white shadow-glow-fire"
                  : "text-gray-300 hover:text-white hover:bg-dark-800"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Tournament
            </Link>

            <Link
              href="/register"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                pathname === "/register"
                  ? "bg-fire-500 text-white shadow-glow-fire"
                  : "text-gray-300 hover:text-white hover:bg-dark-800"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register Squad
            </Link>

            <Link
              href="/ticket/search"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                pathname.startsWith("/ticket")
                  ? "bg-fire-500 text-white shadow-glow-fire"
                  : "text-gray-300 hover:text-white hover:bg-dark-800"
              }`}
            >
              <Search className="w-4 h-4" />
              Find Ticket
            </Link>

            <Link
              href="/rules"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                pathname === "/rules"
                  ? "bg-fire-500 text-white shadow-glow-fire"
                  : "text-gray-300 hover:text-white hover:bg-dark-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              Rules
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-cyber-400 bg-cyber-500/10 px-3 py-1.5 rounded-lg border border-cyber-500/30">
            <Shield className="w-4 h-4 text-cyber-400" />
            ADMIN COMMAND CENTER
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!isAdmin ? (
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-fire-gradient text-white shadow-glow-fire hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              JOIN CUP
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-dark-800 border border-dark-700 hover:border-gray-500 transition-all whitespace-nowrap"
            >
              User Site
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bar for User Side */}
      {!isAdmin && (
        <div className="md:hidden flex items-center justify-around border-t border-dark-800/80 bg-dark-950/95 py-2 px-1">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === "/" ? "text-fire-400 bg-fire-500/10 font-bold" : "text-gray-400"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/register"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === "/register" ? "text-fire-400 bg-fire-500/10 font-bold" : "text-gray-400"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Register
          </Link>
          <Link
            href="/ticket/search"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname.startsWith("/ticket") ? "text-fire-400 bg-fire-500/10 font-bold" : "text-gray-400"
            }`}
          >
            <Search className="w-4 h-4" />
            Ticket
          </Link>
          <Link
            href="/rules"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              pathname === "/rules" ? "text-fire-400 bg-fire-500/10 font-bold" : "text-gray-400"
            }`}
          >
            <FileText className="w-4 h-4" />
            Rules
          </Link>
        </div>
      )}
    </header>
  );
}
