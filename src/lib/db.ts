import fs from "fs";
import path from "path";
import { DatabaseSchema, TournamentData, TeamRegistration, PriceHistoryRecord } from "./types";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "tournament_db.json");

const defaultTournament: TournamentData = {
  name: "PATELESP",
  developer: "Juned",
  whatsappNumber: "+918849596369",
  squadPrice: 100,
  winnerPrize: 1000,
  runnerUpPrize: 500,
  thirdPrize: 250,
  maxTeams: 12,
  maxPlayers: 48,
  isRegistrationOpen: true,
  updatedAt: new Date().toISOString(),
};

const initialPriceHistory: PriceHistoryRecord[] = [
  {
    id: "init-1",
    timestamp: new Date().toISOString(),
    squadPrice: 100,
    winnerPrize: 1000,
    runnerUpPrize: 500,
    thirdPrize: 250,
    totalPrizePool: 1750,
    updatedBy: "Admin",
    note: "Initial Tournament Launch Prices",
  },
];

// Seed sample teams if database is freshly initialized
const seedTeams: TeamRegistration[] = [
  {
    id: "TEAM-1",
    slotNumber: 1,
    teamName: "SOUL STRIKERS",
    igl: {
      name: "Juned Patel",
      uid: "512893471",
      phone: "8849596369",
    },
    player2: { name: "Aman Khan", uid: "512893472" },
    player3: { name: "Rohit Sharma", uid: "512893473" },
    player4: { name: "Kabir Singh", uid: "512893474" },
    registeredAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "TEAM-2",
    slotNumber: 2,
    teamName: "RED DRAGONS",
    igl: {
      name: "Vikram Rathore",
      uid: "619284751",
      phone: "9876543210",
    },
    player2: { name: "Sameer Verma", uid: "619284752" },
    player3: { name: "Ankit Tiwari", uid: "" },
    player4: { name: "Dev Patel", uid: "619284754" },
    registeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

let memoryDb: DatabaseSchema = {
  tournament: defaultTournament,
  priceHistory: initialPriceHistory,
  teams: seedTeams,
};

function ensureDbFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        tournament: defaultTournament,
        priceHistory: initialPriceHistory,
        teams: seedTeams,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      memoryDb = initialData;
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    memoryDb = {
      tournament: { ...defaultTournament, ...(parsed.tournament || {}) },
      priceHistory: Array.isArray(parsed.priceHistory) ? parsed.priceHistory : initialPriceHistory,
      teams: Array.isArray(parsed.teams) ? parsed.teams : [],
    };
    return memoryDb;
  } catch (err) {
    console.error("Failed to read tournament_db.json, using in-memory store:", err);
    return memoryDb;
  }
}

function persistDb(data: DatabaseSchema): boolean {
  memoryDb = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write to tournament_db.json:", err);
    return false;
  }
}

// Public API
export function getTournament(): TournamentData {
  const db = ensureDbFile();
  return db.tournament;
}

export function updateTournamentPrizes(
  squadPrice: number,
  winnerPrize: number,
  runnerUpPrize: number,
  thirdPrize: number,
  note?: string
): { tournament: TournamentData; history: PriceHistoryRecord } {
  const db = ensureDbFile();

  const totalPrizePool = Number(winnerPrize) + Number(runnerUpPrize) + Number(thirdPrize);

  const newHistoryRecord: PriceHistoryRecord = {
    id: `ph-${Date.now()}`,
    timestamp: new Date().toISOString(),
    squadPrice: Number(squadPrice),
    winnerPrize: Number(winnerPrize),
    runnerUpPrize: Number(runnerUpPrize),
    thirdPrize: Number(thirdPrize),
    totalPrizePool,
    updatedBy: "Admin",
    note: note || "Prize pool revision",
  };

  db.tournament = {
    ...db.tournament,
    squadPrice: Number(squadPrice),
    winnerPrize: Number(winnerPrize),
    runnerUpPrize: Number(runnerUpPrize),
    thirdPrize: Number(thirdPrize),
    updatedAt: new Date().toISOString(),
  };

  db.priceHistory.unshift(newHistoryRecord);

  // Keep last 50 history entries
  if (db.priceHistory.length > 50) {
    db.priceHistory = db.priceHistory.slice(0, 50);
  }

  persistDb(db);
  return { tournament: db.tournament, history: newHistoryRecord };
}

export function getPriceHistory(): PriceHistoryRecord[] {
  const db = ensureDbFile();
  return db.priceHistory;
}

export function getTeams(): TeamRegistration[] {
  const db = ensureDbFile();
  return db.teams;
}

export function registerTeam(data: {
  teamName: string;
  igl: { name: string; uid?: string; phone: string };
  player2: { name: string; uid?: string };
  player3: { name: string; uid?: string };
  player4: { name: string; uid?: string };
}): TeamRegistration {
  const db = ensureDbFile();

  if (db.teams.length >= 12) {
    throw new Error("All 12 Slots are full! Maximum 48 players allowed.");
  }

  // Find next available slot number from 1 to 12
  const occupiedSlots = new Set(db.teams.map((t) => t.slotNumber));
  let assignedSlot = 1;
  for (let i = 1; i <= 12; i++) {
    if (!occupiedSlots.has(i)) {
      assignedSlot = i;
      break;
    }
  }

  const newTeam: TeamRegistration = {
    id: `TEAM-${Date.now().toString().slice(-5)}`,
    slotNumber: assignedSlot,
    teamName: data.teamName.trim(),
    igl: {
      name: data.igl.name.trim(),
      uid: data.igl.uid?.trim() || "",
      phone: data.igl.phone.trim(),
    },
    player2: {
      name: data.player2.name.trim(),
      uid: data.player2.uid?.trim() || "",
    },
    player3: {
      name: data.player3.name.trim(),
      uid: data.player3.uid?.trim() || "",
    },
    player4: {
      name: data.player4.name.trim(),
      uid: data.player4.uid?.trim() || "",
    },
    registeredAt: new Date().toISOString(),
  };

  db.teams.push(newTeam);
  // Sort teams by slotNumber
  db.teams.sort((a, b) => a.slotNumber - b.slotNumber);

  persistDb(db);
  return newTeam;
}

export function deleteTeam(teamId: string): boolean {
  const db = ensureDbFile();
  const initialCount = db.teams.length;
  db.teams = db.teams.filter((t) => t.id !== teamId);
  if (db.teams.length !== initialCount) {
    persistDb(db);
    return true;
  }
  return false;
}

export function resetAllTeams(): boolean {
  const db = ensureDbFile();
  db.teams = [];
  persistDb(db);
  return true;
}
