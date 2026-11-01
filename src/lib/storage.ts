import fs from "fs";
import path from "path";
import { TournamentConfig, TeamRegistration, AdminNotification } from "./types";
import { isSupabaseConfigured, getSupabaseAdmin } from "./supabase";

const DATA_FILE = path.join(process.cwd(), "data", "tournament-db.json");

interface DatabaseSchema {
  tournament: TournamentConfig;
  teams: TeamRegistration[];
  notifications: AdminNotification[];
}

export const defaultTournament: TournamentConfig = {
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

export const defaultSeedTeams: TeamRegistration[] = [
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

export const defaultSeedNotifications: AdminNotification[] = [
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

// In-memory cache for fast fallback responses
let memoryDb: DatabaseSchema = {
  tournament: defaultTournament,
  teams: defaultSeedTeams,
  notifications: defaultSeedNotifications,
};

// ==============================================================================
// FIELD MAPPERS (PostgreSQL snake_case <-> TypeScript camelCase)
// ==============================================================================

function mapTournamentFromRow(row: any): TournamentConfig {
  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    game: row.game,
    map: row.map,
    mode: row.mode,
    entryFee: Number(row.entry_fee ?? 50),
    firstPrize: Number(row.first_prize ?? 1000),
    secondPrize: Number(row.second_prize ?? 500),
    perKillPrize: Number(row.per_kill_prize ?? 0),
    totalPrizePool: Number(row.total_prize_pool ?? 1500),
    maxSlots: Number(row.max_slots ?? 48),
    matchDate: row.match_date,
    matchTime: row.match_time,
    upiId: row.upi_id,
    upiName: row.upi_name,
    roomId: row.room_id || "",
    roomPassword: row.room_password || "",
    roomAnnounced: Boolean(row.room_announced),
    rules: Array.isArray(row.rules) ? row.rules : defaultTournament.rules,
    contactNumber: row.contact_number,
  };
}

function mapTournamentToRow(data: Partial<TournamentConfig>): any {
  const row: any = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.title !== undefined) row.title = data.title;
  if (data.tagline !== undefined) row.tagline = data.tagline;
  if (data.game !== undefined) row.game = data.game;
  if (data.map !== undefined) row.map = data.map;
  if (data.mode !== undefined) row.mode = data.mode;
  if (data.entryFee !== undefined) row.entry_fee = data.entryFee;
  if (data.firstPrize !== undefined) row.first_prize = data.firstPrize;
  if (data.secondPrize !== undefined) row.second_prize = data.secondPrize;
  if (data.perKillPrize !== undefined) row.per_kill_prize = data.perKillPrize;
  if (data.totalPrizePool !== undefined) row.total_prize_pool = data.totalPrizePool;
  if (data.maxSlots !== undefined) row.max_slots = data.maxSlots;
  if (data.matchDate !== undefined) row.match_date = data.matchDate;
  if (data.matchTime !== undefined) row.match_time = data.matchTime;
  if (data.upiId !== undefined) row.upi_id = data.upiId;
  if (data.upiName !== undefined) row.upi_name = data.upiName;
  if (data.roomId !== undefined) row.room_id = data.roomId;
  if (data.roomPassword !== undefined) row.room_password = data.roomPassword;
  if (data.roomAnnounced !== undefined) row.room_announced = data.roomAnnounced;
  if (data.rules !== undefined) row.rules = data.rules;
  if (data.contactNumber !== undefined) row.contact_number = data.contactNumber;
  row.updated_at = new Date().toISOString();
  return row;
}

function mapTeamFromRow(row: any): TeamRegistration {
  return {
    id: row.id,
    teamName: row.team_name,
    captainPhone: row.captain_phone,
    captainEmail: row.captain_email || undefined,
    players: row.players,
    substitutePlayer: row.substitute_player || undefined,
    utrNumber: row.utr_number,
    entryFeePaid: Number(row.entry_fee_paid ?? 50),
    paymentStatus: row.payment_status || "pending",
    status: row.status || "pending",
    slotNumber: row.slot_number ?? undefined,
    createdAt: row.created_at,
    notes: row.notes || undefined,
  };
}

function mapTeamToRow(team: Partial<TeamRegistration>): any {
  const row: any = {};
  if (team.id !== undefined) row.id = team.id;
  if (team.teamName !== undefined) row.team_name = team.teamName;
  if (team.captainPhone !== undefined) row.captain_phone = team.captainPhone;
  if (team.captainEmail !== undefined) row.captain_email = team.captainEmail;
  if (team.players !== undefined) row.players = team.players;
  if (team.substitutePlayer !== undefined) row.substitute_player = team.substitutePlayer;
  if (team.utrNumber !== undefined) row.utr_number = team.utrNumber;
  if (team.entryFeePaid !== undefined) row.entry_fee_paid = team.entryFeePaid;
  if (team.paymentStatus !== undefined) row.payment_status = team.paymentStatus;
  if (team.status !== undefined) row.status = team.status;
  if (team.slotNumber !== undefined) row.slot_number = team.slotNumber;
  if (team.notes !== undefined) row.notes = team.notes;
  if (team.createdAt !== undefined) row.created_at = team.createdAt;
  return row;
}

function mapNotificationFromRow(row: any): AdminNotification {
  return {
    id: row.id,
    teamId: row.team_id,
    teamName: row.team_name,
    captainPhone: row.captain_phone,
    utrNumber: row.utr_number,
    amount: Number(row.amount ?? 50),
    createdAt: row.created_at,
    read: Boolean(row.read),
  };
}

function mapNotificationToRow(notif: Partial<AdminNotification>): any {
  const row: any = {};
  if (notif.id !== undefined) row.id = notif.id;
  if (notif.teamId !== undefined) row.team_id = notif.teamId;
  if (notif.teamName !== undefined) row.team_name = notif.teamName;
  if (notif.captainPhone !== undefined) row.captain_phone = notif.captainPhone;
  if (notif.utrNumber !== undefined) row.utr_number = notif.utrNumber;
  if (notif.amount !== undefined) row.amount = notif.amount;
  if (notif.read !== undefined) row.read = notif.read;
  if (notif.createdAt !== undefined) row.created_at = notif.createdAt;
  return row;
}

// ==============================================================================
// LOCAL JSON FILE ADAPTER (Fallback when Supabase keys are not set)
// ==============================================================================

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

function loadLocalData(): DatabaseSchema {
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
    console.error("Local storage load error, falling back to memory state:", error);
  }
  return memoryDb;
}

function saveLocalData(data: DatabaseSchema) {
  memoryDb = data;
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    // In restricted serverless env, memoryDb remains updated for the lifecycle
  }
}

// ==============================================================================
// PUBLIC STORAGE API (Seamlessly routes to Supabase or Local Fallback)
// ==============================================================================

export async function getTournament(): Promise<TournamentConfig> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const { data, error } = await client
          .from("tournaments")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return mapTournamentFromRow(data);
        }
        if (error) {
          console.error("Supabase getTournament query error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in getTournament:", err);
    }
  }

  const db = loadLocalData();
  return db.tournament;
}

export async function updateTournament(updates: Partial<TournamentConfig>): Promise<TournamentConfig> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        // Fetch current to calculate prize totals correctly
        const current = await getTournament();
        const firstPrize = updates.firstPrize ?? current.firstPrize;
        const secondPrize = updates.secondPrize ?? current.secondPrize;
        const totalPrizePool = firstPrize + secondPrize;

        const merged: TournamentConfig = {
          ...current,
          ...updates,
          firstPrize,
          secondPrize,
          totalPrizePool,
        };

        const row = mapTournamentToRow(merged);
        const { data, error } = await client
          .from("tournaments")
          .upsert(row)
          .select()
          .single();

        if (!error && data) {
          return mapTournamentFromRow(data);
        }
        if (error) {
          console.error("Supabase updateTournament error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in updateTournament:", err);
    }
  }

  const db = loadLocalData();
  db.tournament = {
    ...db.tournament,
    ...updates,
    totalPrizePool: (updates.firstPrize ?? db.tournament.firstPrize) + (updates.secondPrize ?? db.tournament.secondPrize),
  };
  saveLocalData(db);
  return db.tournament;
}

export async function getAllTeams(): Promise<TeamRegistration[]> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const { data, error } = await client
          .from("teams")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(mapTeamFromRow);
        }
        if (error) {
          console.error("Supabase getAllTeams error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in getAllTeams:", err);
    }
  }

  const db = loadLocalData();
  return db.teams;
}

export async function getTeamById(id: string): Promise<TeamRegistration | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const { data, error } = await client
          .from("teams")
          .select("*")
          .ilike("id", id)
          .maybeSingle();

        if (!error && data) {
          return mapTeamFromRow(data);
        }
        if (error) {
          console.error("Supabase getTeamById error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in getTeamById:", err);
    }
  }

  const db = loadLocalData();
  return db.teams.find((t) => t.id.toLowerCase() === id.toLowerCase());
}

export async function createTeam(
  teamData: Omit<TeamRegistration, "id" | "createdAt" | "status" | "paymentStatus" | "slotNumber">
): Promise<TeamRegistration> {
  // Generate human-friendly ID like PTL-4819
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `PTL-${randomSuffix}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        // Calculate next slot number
        const { count } = await client
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved");

        const slotNumber = (count ?? 0) + 1;

        const newTeam: TeamRegistration = {
          ...teamData,
          id,
          createdAt: now,
          status: "pending",
          paymentStatus: "pending",
          slotNumber,
        };

        const teamRow = mapTeamToRow(newTeam);
        const { error: insertErr } = await client.from("teams").insert(teamRow);
        if (insertErr) {
          console.error("Supabase createTeam insert error:", insertErr.message);
        }

        // Add Notification for Admin
        const notification: AdminNotification = {
          id: `notif-${Date.now()}`,
          teamId: newTeam.id,
          teamName: newTeam.teamName,
          captainPhone: newTeam.captainPhone,
          utrNumber: newTeam.utrNumber,
          amount: newTeam.entryFeePaid,
          createdAt: now,
          read: false,
        };

        const notifRow = mapNotificationToRow(notification);
        const { error: notifErr } = await client.from("admin_notifications").insert(notifRow);
        if (notifErr) {
          console.error("Supabase createNotification insert error:", notifErr.message);
        }

        return newTeam;
      }
    } catch (err) {
      console.error("Supabase connection error in createTeam, falling back to local:", err);
    }
  }

  const db = loadLocalData();
  const slotNumber = db.teams.filter((t) => t.status === "approved").length + 1;

  const newTeam: TeamRegistration = {
    ...teamData,
    id,
    createdAt: now,
    status: "pending",
    paymentStatus: "pending",
    slotNumber,
  };

  db.teams.unshift(newTeam);

  const notification: AdminNotification = {
    id: `notif-${Date.now()}`,
    teamId: newTeam.id,
    teamName: newTeam.teamName,
    captainPhone: newTeam.captainPhone,
    utrNumber: newTeam.utrNumber,
    amount: newTeam.entryFeePaid,
    createdAt: now,
    read: false,
  };

  db.notifications.unshift(notification);
  saveLocalData(db);

  return newTeam;
}

export async function updateTeamStatus(
  id: string,
  status: "approved" | "rejected" | "pending",
  notes?: string
): Promise<TeamRegistration | null> {
  const paymentStatus = status === "approved" ? "verified" : status === "rejected" ? "rejected" : "pending";

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const updatePayload: any = {
          status,
          payment_status: paymentStatus,
        };
        if (notes !== undefined) {
          updatePayload.notes = notes;
        }

        const { data, error } = await client
          .from("teams")
          .update(updatePayload)
          .ilike("id", id)
          .select()
          .maybeSingle();

        if (!error && data) {
          return mapTeamFromRow(data);
        }
        if (error) {
          console.error("Supabase updateTeamStatus error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in updateTeamStatus:", err);
    }
  }

  const db = loadLocalData();
  const teamIndex = db.teams.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());

  if (teamIndex === -1) return null;

  db.teams[teamIndex].status = status;
  db.teams[teamIndex].paymentStatus = paymentStatus;
  if (notes) {
    db.teams[teamIndex].notes = notes;
  }

  saveLocalData(db);
  return db.teams[teamIndex];
}

export async function getNotifications(): Promise<AdminNotification[]> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const { data, error } = await client
          .from("admin_notifications")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map(mapNotificationFromRow);
        }
        if (error) {
          console.error("Supabase getNotifications error, falling back to local:", error.message);
        }
      }
    } catch (err) {
      console.error("Supabase connection error in getNotifications:", err);
    }
  }

  const db = loadLocalData();
  return db.notifications;
}

export async function markNotificationsAsRead(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseAdmin();
      if (client) {
        const { error } = await client
          .from("admin_notifications")
          .update({ read: true })
          .eq("read", false);

        if (!error) return;
        console.error("Supabase markNotificationsAsRead error, falling back to local:", error.message);
      }
    } catch (err) {
      console.error("Supabase connection error in markNotificationsAsRead:", err);
    }
  }

  const db = loadLocalData();
  db.notifications = db.notifications.map((n) => ({ ...n, read: true }));
  saveLocalData(db);
}

/**
 * Diagnostic tool to check online database status.
 */
export async function getDatabaseStatus(): Promise<{
  provider: "supabase" | "local_file";
  connected: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      provider: "local_file",
      connected: true,
      message: "Running on local JSON database (Supabase environment variables not set)",
    };
  }

  try {
    const client = getSupabaseAdmin();
    if (!client) {
      return {
        provider: "supabase",
        connected: false,
        message: "Failed to initialize Supabase client",
      };
    }

    const { error } = await client.from("tournaments").select("id").limit(1);
    if (error) {
      return {
        provider: "supabase",
        connected: false,
        message: `Supabase query error: ${error.message}. Please verify table schema.`,
      };
    }

    return {
      provider: "supabase",
      connected: true,
      message: "Connected to live Supabase PostgreSQL database!",
    };
  } catch (err: any) {
    return {
      provider: "supabase",
      connected: false,
      message: `Connection error: ${err?.message || "Unknown error"}`,
    };
  }
}
