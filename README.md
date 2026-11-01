# 🔥 PATELESP - Free Fire Esports Tournament Platform

A high-performance, senior-grade esports tournament web application built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, designed specifically for effortless deployment on **Vercel**.

Branded as **patelesp** (Patel Esports), it provides a split architecture with a public **User Portal** for 4-player squad registrations and digital match passes, and a private, password-protected **Admin Command Center** with live audio chime notifications and custom room broadcasting.

---

## 🚀 Key Features

### 🎮 User Experience (`/`)
- **Prize Pool & Fees**: Highlights Entry Fee (₹50), 1st Prize Winner (₹1,000), 2nd Prize Winner (₹500), and dynamic slot availability (e.g. 18 / 48 filled).
- **Squad Registration (`/register`)**:
  - Team Name & Captain WhatsApp number.
  - Full 4-Player Roster: Full Name, Free Fire UID, and In-Game Name (IGN) for all 4 players (plus optional 5th substitute).
  - UPI QR Code generation + copy UPI ID (`patelesp@upi`) + 12-digit UTR Transaction ID submission.
- **Esports Digital Ticket (`/ticket/[id]`)**:
  - Unique Ticket ID (e.g. `PTL-8841`).
  - Live Status Tracker (`PAYMENT UNDER REVIEW` / `VERIFIED & APPROVED` / `REJECTED`).
  - Free Fire Custom Room ID & Password revealed automatically to approved teams 15 minutes before the match.
  - Direct WhatsApp Squad Share button.
- **Find Ticket (`/ticket/search`)**: Look up tickets anytime using Team ID or Captain Phone number.
- **Tournament Rules (`/rules`)**: Clear fair-play guidelines, mobile-only policy, anti-hack, and scoring rules.

### 🛡️ Admin Experience (`/admin`)
- **Passcode Protected**: Secure admin authentication screen (`/admin/login`).
  - **Default PIN**: `patelesp2026`
- **Real-time Sound Chimes & Notifications**:
  - Web Audio API synthesizer generates an esports ping alert whenever a new team registers.
  - Real-time notification drawer with unread counter.
  - "Test Ping" button to verify sound playback.
- **Squad Management Table**:
  - View, approve, or reject teams with 1-click.
  - Full modal inspection of all 4 players, in-game UIDs, and payment UTR.
  - 1-click "Copy All 4 UIDs" for fast Free Fire custom room invitations.
  - 1-click WhatsApp message to team captain.
  - "Export to CSV" for match referees.
- **Custom Room Broadcaster**:
  - Input Room ID & Password and toggle "Broadcast to Verified Teams".
- **Tournament Settings Editor (`/admin/settings`)**:
  - Edit Entry Fee, 1st Prize, 2nd Prize, Map, Date & Time, Max Slots, and Host UPI ID.

---

## 🛠️ Tech Stack & Vercel Readiness

- **Framework**: Next.js 15 (React 19, TypeScript)
- **Styling**: Tailwind CSS with custom Free Fire Ember/Cyber dark mode
- **Icons**: Lucide React
- **Audio Alert**: Web Audio API (zero external assets or broken links)
- **Deployment**: 100% native compatibility with **Vercel** serverless architecture.

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
   - User portal: `http://localhost:3000`
   - Admin portal: `http://localhost:3000/admin` (PIN: `patelesp2026`)

---

## 🌐 Deploying to Vercel (1-Click)

1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. (Optional) Set Environment Variables in Vercel settings:
   - `ADMIN_SECRET_KEY`: `patelesp2026` (or your custom password)
   - `NEXT_PUBLIC_UPI_ID`: `patelesp@upi`
5. Click **Deploy**!
