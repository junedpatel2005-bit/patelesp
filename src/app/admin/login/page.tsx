"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Key, ArrowRight, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Invalid Admin Passcode");
        setLoading(false);
        return;
      }

      // Store in localStorage for admin API requests
      localStorage.setItem("patelesp_admin_key", data.token);
      router.push("/admin");
    } catch (err) {
      setErrorMsg("Network error. Could not authenticate.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Main Site
        </Link>

        <div className="gaming-card-cyber rounded-3xl p-8 border-cyber-500/30 shadow-glow-cyber/10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cyber-500/10 text-cyber-400 flex items-center justify-center mx-auto mb-4 border border-cyber-500/30 shadow-glow-cyber">
              <Shield className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-black tracking-widest text-cyber-400 uppercase bg-cyber-500/10 px-3 py-1 rounded-full border border-cyber-500/20">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-3">
              PATELESP ADMIN PORTAL
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Authorized tournament administrator sign-in only.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Admin Passkey / PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter administrator passkey"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-750 focus:border-cyber-500 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition-all tracking-wider font-mono"
                />
                <Key className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Default PIN: <code className="text-cyber-400 font-mono">patelesp2026</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-cyber-gradient text-dark-950 font-bold shadow-glow-cyber hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Passcode...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock Admin Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
