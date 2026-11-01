import fs from "fs";
import path from "path";
import { TournamentConfig, TeamRegistration, AdminNotification } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "tournament-db.json");

interface DatabaseSchema {
  tournament: TournamentConfig;
  teams: TeamRegistration[];
  notifications: AdminNotification[];
}

const defaultTournament: TournamentConfig = {
  id: "patel-ff-season-1",
  title: "PATELESP FREE FIRE SQUAD SHOWDOWN",
  tagline: "India's Ultimate Free Fire Battle Royale Arena",
  game: "Free Fire Max / Free Fire",
  map: "Bermuda",
  mode: "Squad Battle Royale (4 Players)",
  entryFee: 50,
  firstPrize: 1000,
  secondPrize: 500,
  perKillPrize: 0,
  totalPrizePool: 1500,
  maxSlots: 48,
  matchDate: "2026-11-08",
  matchTime: "08:30 PM IST",
  upiId: "patelesp@upi",
  upiName: "Patel Esports Arena",
  roomId: "",
  roomPassword: "",
  roomAnnounced: false,
  contactNumber: "+91 98765 43210",
  rules: [
    "Squad must strictly consist of the 4 registered players. No sudden substitutes without admin notice.",
    "Mobile players only. PC / Emulators are strictly prohibited and will be kicked from the custom room.",
    "Custom Room ID and Password will appear exclusively on your Team Ticket page 15 minutes prior to match time.",
    "Teaming up with enemy squads, third-party gfx tools, or hacking will result in an immediate ban with zero refund.",
    "Prize money (1st: ₹1,000, 2nd: ₹500) will be transferred instantly via UPI after final score verification.",
    "The winning captain must take a clear screenshot of the final Booyah scoreboard."
  ],
};

const defaultSeedTeams: TeamRegistration[] = [
  {
    id: "PTL-8841",
    teamName: "Team SoulFire",
    captainPhone: "9876543210",
    captainEmail: "soulfire@patelesp.gg",
    players: [
      { name: "Aman Patel", freeFireUid: "1234567890", inGameName: "SOUL・RAVAN", isCaptain: true },
      { name: "Rohit Sharma", freeFireUid: "2345678901", inGameName: "SOUL・VIPER" },
      { name: "Vikram Singh", freeFireUid: "3456789012", inGameName: "SOUL・GHOST" },
      { name: "Karan Verma", freeFireUid: "4567890123", inGameName: "SOUL・TITAN" },
    ],
    utrNumber: "431298451234",
    entryFeePaid: 50,
    paymentStatus: "verified",
    status: "approved",
    slotNumber: 1,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: "Verified payment via Google Pay",
  },
  {
    id: "PTL-5529",
    teamName: "Dark Phoenix",
    captainPhone: "9123456780",
    players: [
      { name: "Sahil Khan", freeFireUid: "5678901234", inGameName: "PHX・BLAZE", isCaptain: true },
      { name: "Rahul Das", freeFireUid: "6789012345", inGameName: "PHX・SHADOW" },
      { name: "Ankit Maurya", freeFireUid: "7890123456", inGameName: "PHX・VIPER" },
      { name: "Deepak Yadav", freeFireUid: "8901234567", inGameName: "PHX・DEADLY" },
    ],
    utrNumber: "431287654321",
    entryFeePaid: 50,
    paymentStatus: "pending",
    status: "pending",
    slotNumber: 2,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const defaultSeedNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    teamId: "PTL-5529",
    teamName: "Dark Phoenix",
    captainPhone: "9123456780",
    utrNumber: "431287654321",
    amount: 50,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    read: false,
  },
];

// In-memory cache for fast serverless responses
let memoryDb: DatabaseSchema = {
  tournament: defaultTournament,
  teams: defaultSeedTeams,
  notifications: defaultSeedNotifications,
};

function ensureDataDir() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    // Read-only filesystem fallback in some serverless environments
  }
}

function loadData(): DatabaseSchema {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      memoryDb = {
        tournament: { ...defaultTournament, ...parsed.tournament },
        teams: Array.isArray(parsed.teams) ? parsed.teams : defaultSeedTeams,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : defaultSeedNotifications,
      };
      return memoryDb;
    }
  } catch (error) {
    console.error("Storage load error, falling back to memory state:", error);
  }
  return memoryDb;
}

function saveData(data: DatabaseSchema) {
  memoryDb = data;
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    // In restricted serverless env, memoryDb remains updated for the lifecycle
  }
}

export function getTournament(): TournamentConfig {
  const db = loadData();
  return db.tournament;
}

export function updateTournament(updates: Partial<TournamentConfig>): TournamentConfig {
  const db = loadData();
  db.tournament = {
    ...db.tournament,
    ...updates,
    totalPrizePool: (updates.firstPrize ?? db.tournament.firstPrize) + (updates.secondPrize ?? db.tournament.secondPrize),
  };
  saveData(db);
  return db.tournament;
}

export function getAllTeams(): TeamRegistration[] {
  const db = loadData();
  return db.teams;
}

export function getTeamById(id: string): TeamRegistration | undefined {
  const db = loadData();
  return db.teams.find((t) => t.id.toLowerCase() === id.toLowerCase());
}

export function createTeam(teamData: Omit<TeamRegistration, "id" | "createdAt" | "status" | "paymentStatus" | "slotNumber">): TeamRegistration {
  const db = loadData();
  
  // Generate human-friendly ID like PTL-4819
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `PTL-${randomSuffix}`;
  const slotNumber = db.teams.filter(t => t.status === "approved").length + 1;

  const newTeam: TeamRegistration = {
    ...teamData,
    id,
    createdAt: new Date().toISOString(),
    status: "pending",
    paymentStatus: "pending",
    slotNumber,
  };

  db.teams.unshift(newTeam);

  // Add Notification for Admin
  const notification: AdminNotification = {
    id: `notif-${Date.now()}`,
    teamId: newTeam.id,
    teamName: newTeam.teamName,
    captainPhone: newTeam.captainPhone,
    utrNumber: newTeam.utrNumber,
    amount: newTeam.entryFeePaid,
    createdAt: newTeam.createdAt,
    read: false,
  };

  db.notifications.unshift(notification);
  saveData(db);

  return newTeam;
}

export function updateTeamStatus(id: string, status: "approved" | "rejected" | "pending", notes?: string): TeamRegistration | null {
  const db = loadData();
  const teamIndex = db.teams.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
  
  if (teamIndex === -1) return null;

  db.teams[teamIndex].status = status;
  db.teams[teamIndex].paymentStatus = status === "approved" ? "verified" : status === "rejected" ? "rejected" : "pending";
  if (notes) {
    db.teams[teamIndex].notes = notes;
  }

  saveData(db);
  return db.teams[teamIndex];
}

export function getNotifications(): AdminNotification[] {
  const db = loadData();
  return db.notifications;
}

export function markNotificationsAsRead(): void {
  const db = loadData();
  db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
  saveData(db);
}
