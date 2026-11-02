"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter the admin password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("patelesp_admin_auth", "2412");
        onSuccess();
      } else {
        setError(data.message || "Invalid admin password. Please try again.");
      }
    } catch (err: any) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Return to website */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 hover:text-blue-900 transition uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PATELESP Website
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-6 sm:px-10 shadow-xl rounded-2xl border border-blue-200">
          {/* Blue Shield Icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              PATELESP <span className="text-blue-600">ADMIN</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Enter Admin Password to manage prizes, slots, and tournament teams
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* User specified: "also admin need login so admin side passwwrd 2412 only password enter option" */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="adminPassword"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  required
                  autoFocus
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-600 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black text-sm uppercase py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              {loading ? (
                <span className="animate-pulse">VERIFYING...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  AUTHENTICATE ADMIN
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              PATELESP Esports Administration Console
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
