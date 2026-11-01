import Link from "next/link";
import { Flame, ShieldCheck, Zap, PhoneCall } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-dark-800 bg-dark-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-fire-gradient p-0.5 flex items-center justify-center shadow-glow-fire">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">PATEL<span className="text-fire-500">ESP</span></span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              PATELESP is India&apos;s premier competitive Free Fire esports platform. Join high-stakes tournaments, compete against top squads, and win verified cash prizes.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Prize Pool
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-cyber-400 bg-cyber-500/10 px-2.5 py-1 rounded-md border border-cyber-500/20 font-medium">
                <Zap className="w-3.5 h-3.5" /> Instant UPI Payouts
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-fire-400 transition-colors">Tournament Overview</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-fire-400 transition-colors">Squad Registration (4 Players)</Link>
              </li>
              <li>
                <Link href="/ticket/search" className="hover:text-fire-400 transition-colors">Check Ticket Status</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-fire-400 transition-colors">Free Fire Tournament Rules</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-300 tracking-wider uppercase mb-4">Host Support</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-fire-400" />
                <span>WhatsApp Helpline Available</span>
              </li>
              <li className="text-xs text-gray-400">
                Contact host for tournament slots & queries
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-850 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} PATELESP Arena. All rights reserved.</p>
          <p className="text-gray-400 text-center sm:text-right">
            Free Fire is a registered trademark of Garena International. PATELESP is not affiliated with or endorsed by Garena.
          </p>
        </div>
      </div>
    </footer>
  );
}
