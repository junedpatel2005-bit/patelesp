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

## 🗄️ Online Cloud Database Setup (Supabase PostgreSQL)

The platform supports **Supabase (PostgreSQL)** for permanent, serverless cloud storage and live realtime notifications. If no Supabase keys are configured, it automatically falls back to the local JSON database (`data/tournament-db.json`).

### 1. Create a Supabase Project
1. Sign up / log in to [Supabase](https://supabase.com/).
2. Click **New Project** and name it `patelesp`.

### 2. Run the SQL Migration
1. Go to the **SQL Editor** tab in your Supabase Dashboard.
2. Click **New Query**.
3. Copy and paste the entire script from [`supabase/schema.sql`](file:///D:/Touarnamnet/supabase/schema.sql).
4. Click **Run**. This will create the `tournaments`, `teams`, and `admin_notifications` tables with indexes, RLS policies, realtime broadcasting, and default seed data.

### 3. Add Environment Variables
From your Supabase Project **Settings > API**, copy your credentials into `.env.local` (or Vercel Environment Variables):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can verify connection status anytime at `/api/db-status` or in `/admin/settings`!

---

## 🌐 Deploying to Vercel (1-Click)

1. Push this project to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. (Optional) Set Environment Variables in Vercel settings:
   - `ADMIN_SECRET_KEY`: `patelesp2026` (or your custom password)
   - `NEXT_PUBLIC_UPI_ID`: `patelesp@upi`
5. Click **Deploy**!
