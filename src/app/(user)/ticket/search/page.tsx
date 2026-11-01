"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Flame, ArrowLeft, AlertCircle, Shield } from "lucide-react";

export default function TicketSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const clean = query.trim();
    if (!clean) {
      setErrorMsg("Please enter your Team ID (e.g. PTL-8841) or Captain Phone Number");
      return;
    }

    setSearching(true);

    try {
      // If it looks like a Team ID directly
      if (clean.toUpperCase().startsWith("PTL-")) {
        router.push(`/ticket/${clean.toUpperCase()}`);
        return;
      }

      // Check all teams to match phone number or ID
      const res = await fetch("/api/teams");
      const data = await res.json();

      if (data.success && Array.isArray(data.teams)) {
        const match = data.teams.find(
          (t: { id: string; captainPhone: string; teamName: string }) =>
            t.id.toLowerCase() === clean.toLowerCase() ||
            t.captainPhone.includes(clean) ||
            t.teamName.toLowerCase().includes(clean.toLowerCase())
        );

        if (match) {
          router.push(`/ticket/${match.id}`);
          return;
        }
      }

      setErrorMsg("No squad registration found matching your search. Please check your Team ID or Phone Number.");
      setSearching(false);
    } catch (err) {
      setErrorMsg("Error searching for ticket. Please try again.");
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="gaming-card rounded-3xl p-8 border-fire-500/20 shadow-glow-fire/10">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-fire-500/10 text-fire-400 flex items-center justify-center mx-auto mb-3 border border-fire-500/30">
              <Search className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">FIND SQUAD TICKET</h1>
            <p className="text-xs text-gray-400 mt-1">
              Enter your Ticket ID (e.g. <span className="font-mono text-fire-400">PTL-8841</span>) or Captain Phone Number to view your match pass and room ID.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Team ID or Captain Phone
              </label>
              <input
                type="text"
                required
                placeholder="PTL-8841 or 9876543210"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 focus:border-fire-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider bg-fire-gradient text-white shadow-glow-fire hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Access Ticket & Room ID
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-800 text-center">
            <p className="text-xs text-gray-400">
              Haven&apos;t registered your squad yet?{" "}
              <Link href="/register" className="text-fire-400 font-bold hover:underline">
                Register Now (₹50)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
