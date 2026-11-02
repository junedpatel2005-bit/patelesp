import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "PATELESP | Free Fire Esports Tournament",
  description: "Official PATELESP Free Fire Squad Tournament. Created and Developed by Juned.",
  keywords: ["PATELESP", "Free Fire", "Esports", "Juned", "Free Fire Squad Tournament"],
  authors: [{ name: "Juned" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}
