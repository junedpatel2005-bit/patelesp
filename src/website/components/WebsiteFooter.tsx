"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Shield, AlertCircle } from "lucide-react";

export default function WebsiteFooter() {
  const whatsappUrl = "https://wa.me/918849596369?text=hi";

  return (
    <footer className="bg-black border-t-2 border-red-600/40 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-zinc-900">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 bg-red-600 text-white font-black text-lg flex items-center justify-center rounded">
                P
              </span>
              <span className="text-2xl font-black tracking-wider text-white">
                PATEL<span className="text-red-500">ESP</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Premium Free Fire Esports Squad Tournament platform. Designed for authentic competitive gaming and immediate cash payouts.
            </p>
            {/* Created and Developed by Juned */}
            <div className="inline-block bg-zinc-950 border border-zinc-800 px-3.5 py-1.5 rounded-lg">
              <p className="text-xs font-bold text-gray-300">
                Created &amp; Developed by <span className="text-red-500 font-extrabold uppercase">Juned</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li>
                <Link href="/" className="hover:text-red-500 transition">
                  Tournament Overview
                </Link>
              </li>
              <li>
                <Link href="/#register" className="hover:text-red-500 transition">
                  Squad Registration (12 Slots)
                </Link>
              </li>
              <li>
                <Link href="/participate" className="hover:text-red-500 transition flex items-center gap-1.5 text-white font-bold">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  Participate (Slots 1-12)
                </Link>
              </li>
              <li>
                <Link href="/#rules" className="hover:text-red-500 transition">
                  Esports Rules &amp; Points System
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-blue-400 transition">
                  Admin Access (Code 2412)
                </Link>
              </li>
            </ul>
          </div>

          {/* WhatsApp Contact & Click to Chat */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-3">
              Official WhatsApp Support
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Need assistance or tournament room details? Click below to chat directly with Juned:
            </p>

            {/* Clickable WhatsApp Button with 'hi' message prefilled */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-zinc-950 hover:bg-zinc-900 border-2 border-red-600/70 hover:border-red-500 text-white font-bold px-4 py-3 rounded-xl transition duration-200 group shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  WhatsApp Chat
                </div>
                <div className="text-sm font-black text-white group-hover:text-red-400 transition">
                  +91 8849596369
                </div>
              </div>
            </a>

            {/* Required Note: Only msg, do not call */}
            <div className="mt-3 flex items-start gap-2 bg-red-950/40 border border-red-800/40 rounded-lg p-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-300">
                Note: Only message, do not call.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} PATELESP. All rights reserved. Not affiliated with Garena.
          </p>
          <p className="font-bold text-gray-400">
            Created &amp; Developed by <span className="text-red-500">Juned</span> (+91 8849596369)
          </p>
        </div>
      </div>
    </footer>
  );
}
