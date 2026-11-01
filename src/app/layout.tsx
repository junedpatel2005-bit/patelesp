import type { Metadata, Viewport } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "PATELESP | Free Fire Esports Squad Tournament",
  description: "Join the official PATELESP Free Fire Squad Tournament. Win 1st & 2nd cash prizes, 48 slots battle royale with instant UPI payouts.",
  keywords: ["Free Fire Tournament", "PATELESP", "Patel Esports", "Free Fire Cup", "Free Fire Squad Registration", "Esports India"],
  authors: [{ name: "Patel Esports" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950 text-gray-100 flex flex-col antialiased selection:bg-fire-500 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
