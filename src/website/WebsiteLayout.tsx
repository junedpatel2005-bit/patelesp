"use client";

import React from "react";
import WebsiteNavbar from "./components/WebsiteNavbar";
import WebsiteFooter from "./components/WebsiteFooter";

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-red-600 selection:text-white">
      <WebsiteNavbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <WebsiteFooter />
    </div>
  );
}
