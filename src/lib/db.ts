import fs from "fs";
import path from "path";
import { DatabaseSchema, TournamentData, TeamRegistration, PriceHistoryRecord } from "./types";
import { supabase, isSupabaseReady } from "./supabase";

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "tournament_db.json");

const defaultTournament: TournamentData = {
  name: "PATELESP",
  developer: "Juned",
  whatsappNumber: "+918849596369",
  whatsappGroupLink: "https://chat.whatsapp.com/invite",
  paymentNumber: "+919054358668",
  paymentName: "Juned Rafik Patel",
  upiId: "9054358668@ybl",
  tournamentDate: "07 November 2026",
  tournamentDay: "Saturday",
  tournamentTime: "09:00 PM IST",
  entryTime: "08:45 PM IST",
  hidePointsTable: true,
  squadPrice: 40,
  winnerPrize: 180,
  runnerUpPrize: 100,
  thirdPrize: 60,
  maxTeams: 12,
  maxPlayers: 48,
  isRegistrationOpen: true,
  roomId: "",
  roomPassword: "",
  isRoomLive: false,
  updatedAt: new Date().toISOString(),
};

const initialPriceHistory: PriceHistoryRecord[] = [
  {
    id: "init-1",
    timestamp: new Date().toISOString(),
    squadPrice: 40,
    winnerPrize: 180,
    runnerUpPrize: 100,
    thirdPrize: 60,
    totalPrizePool: 340,
    updatedBy: "Admin",
    note: "Initial Tournament Launch Prices",
  },
];

let memoryDb: DatabaseSchema = {
  tournament: defaultTournament,
  priceHistory: initialPriceHistory,
  teams: [],
};

function ensureLocalFile(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        tournament: defaultTournament,
        priceHistory: initialPriceHistory,
        teams: [],
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
    return memoryDb;
  }
}

function persistLocalFile(data: DatabaseSchema): boolean {
  memoryDb = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    return false;
  }
}

// ==============================================================================
// PUBLIC STORAGE API WITH CLOUD DATABASE (SUPABASE) + LOCAL FAILOVER
// ==============================================================================

export async function getTournament(): Promise<TournamentData> {
  const local = ensureLocalFile();

  if (isSupabaseReady() && supabase) {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", "patel-ff-season-1")
        .maybeSingle();

      if (!error && data) {
        const rulesObj =
          typeof data.rules === "object" && data.rules !== null && !Array.isArray(data.rules)
            ? data.rules
            : {};

        const cloudTournament: TournamentData = {
          name: data.title || local.tournament.name || "PATELESP",
          developer: "Juned",
          whatsappNumber: data.contact_number || local.tournament.whatsappNumber || "+918849596369",
          whatsappGroupLink: rulesObj.whatsappGroupLink || local.tournament.whatsappGroupLink || "https://chat.whatsapp.com/invite",
          paymentNumber: data.upi_id || local.tournament.paymentNumber || "+919054358668",
          paymentName: data.upi_name || local.tournament.paymentName || "Juned Rafik Patel",
          tournamentDate: data.match_date || local.tournament.tournamentDate || "08 November 2026",
          tournamentDay: data.tagline || local.tournament.tournamentDay || "Sunday",
          tournamentTime: data.match_time || local.tournament.tournamentTime || "09:00 PM IST",
          entryTime: rulesObj.entryTime || local.tournament.entryTime || "08:45 PM IST",
          hidePointsTable:
            rulesObj.hidePointsTable !== undefined
              ? rulesObj.hidePointsTable
              : local.tournament.hidePointsTable !== undefined
              ? local.tournament.hidePointsTable
              : true,
          squadPrice: Number(data.entry_fee ?? local.tournament.squadPrice),
          winnerPrize: Number(data.first_prize ?? local.tournament.winnerPrize),
          runnerUpPrize: Number(data.second_prize ?? local.tournament.runnerUpPrize),
          thirdPrize: Number(data.per_kill_prize ?? local.tournament.thirdPrize),
          maxTeams: 12,
          maxPlayers: 48,
          isRegistrationOpen: true,
          roomId: rulesObj.roomId || local.tournament.roomId || "",
          roomPassword: rulesObj.roomPassword || local.tournament.roomPassword || "",
          isRoomLive: rulesObj.isRoomLive !== undefined ? rulesObj.isRoomLive : local.tournament.isRoomLive || false,
          updatedAt: data.updated_at || new Date().toISOString(),
        };

        local.tournament = cloudTournament;
        persistLocalFile(local);
        return cloudTournament;
      }
    } catch (e) {
      console.error("Supabase getTournament fallback to local:", e);
    }
  }

  return local.tournament;
}

export async function updateTournamentSettings(
  updates: Partial<TournamentData> & { note?: string }
): Promise<{ tournament: TournamentData; history?: PriceHistoryRecord }> {
  const local = ensureLocalFile();
  const now = new Date().toISOString();

  let newHistoryRecord: PriceHistoryRecord | undefined;

  const isPriceChange =
    updates.squadPrice !== undefined ||
    updates.winnerPrize !== undefined ||
    updates.runnerUpPrize !== undefined ||
    updates.thirdPrize !== undefined;

  const squadPrice =
    updates.squadPrice !== undefined ? Number(updates.squadPrice) : local.tournament.squadPrice;
  const winnerPrize =
    updates.winnerPrize !== undefined ? Number(updates.winnerPrize) : local.tournament.winnerPrize;
  const runnerUpPrize =
    updates.runnerUpPrize !== undefined ? Number(updates.runnerUpPrize) : local.tournament.runnerUpPrize;
  const thirdPrize =
    updates.thirdPrize !== undefined ? Number(updates.thirdPrize) : local.tournament.thirdPrize;
  const totalPrizePool = Number(winnerPrize) + Number(runnerUpPrize) + Number(thirdPrize);

  if (isPriceChange) {
    newHistoryRecord = {
      id: `ph-${Date.now()}`,
      timestamp: now,
      squadPrice,
      winnerPrize,
      runnerUpPrize,
      thirdPrize,
      totalPrizePool,
      updatedBy: "Admin",
      note: updates.note || "Tournament settings & prizes updated",
    };
  }

  const updatedTournament: TournamentData = {
    ...local.tournament,
    ...updates,
    squadPrice,
    winnerPrize,
    runnerUpPrize,
    thirdPrize,
    updatedAt: now,
  };

  // 1. Sync to Supabase Cloud Database (Primary source on Vercel)
  if (isSupabaseReady() && supabase) {
    try {
      const sbUpdate: any = {
        updated_at: now,
      };
      if (updates.squadPrice !== undefined) sbUpdate.entry_fee = Number(updates.squadPrice);
      if (updates.winnerPrize !== undefined) sbUpdate.first_prize = Number(updates.winnerPrize);
      if (updates.runnerUpPrize !== undefined) sbUpdate.second_prize = Number(updates.runnerUpPrize);
      if (updates.thirdPrize !== undefined) sbUpdate.per_kill_prize = Number(updates.thirdPrize);
      if (isPriceChange) sbUpdate.total_prize_pool = totalPrizePool;
      if (updates.tournamentDate) sbUpdate.match_date = updates.tournamentDate;
      if (updates.tournamentDay) sbUpdate.tagline = updates.tournamentDay;
      if (updates.tournamentTime) sbUpdate.match_time = updates.tournamentTime;
      if (updates.paymentNumber) sbUpdate.upi_id = updates.paymentNumber;
      if (updates.paymentName) sbUpdate.upi_name = updates.paymentName;
      if (updates.whatsappNumber) sbUpdate.contact_number = updates.whatsappNumber;

      sbUpdate.rules = {
        entryTime: updates.entryTime || local.tournament.entryTime || "08:45 PM IST",
        hidePointsTable:
          updates.hidePointsTable !== undefined
            ? updates.hidePointsTable
            : local.tournament.hidePointsTable !== undefined
            ? local.tournament.hidePointsTable
            : true,
        whatsappGroupLink: updates.whatsappGroupLink ?? local.tournament.whatsappGroupLink,
        roomId: updates.roomId ?? local.tournament.roomId,
        roomPassword: updates.roomPassword ?? local.tournament.roomPassword,
        isRoomLive: updates.isRoomLive !== undefined ? updates.isRoomLive : local.tournament.isRoomLive,
      };

      const { data: updatedRows, error } = await supabase
        .from("tournaments")
        .update(sbUpdate)
        .eq("id", "patel-ff-season-1")
        .select();

      if (error) {
        console.warn("Supabase update warning (fallback to local):", error.message);
      } else if (!updatedRows || updatedRows.length === 0) {
        // If the row doesn't exist yet, insert it automatically
        const { error: insertErr } = await supabase.from("tournaments").insert({
          id: "patel-ff-season-1",
          title: "PATELESP FREE FIRE SQUAD SHOWDOWN",
          tagline: updates.tournamentDay || "Saturday",
          game: "Free Fire Max / Free Fire",
          map: "Bermuda",
          mode: "Squad Battle Royale (4 Players)",
          contact_number: updates.whatsappNumber || "+918849596369",
          upi_id: updates.paymentNumber || "+919054358668",
          upi_name: updates.paymentName || "Juned Rafik Patel",
          ...sbUpdate,
        });
        if (insertErr) {
          console.warn("Supabase insert warning:", insertErr.message);
        }
      }
    } catch (e: any) {
      console.warn("Supabase update non-fatal exception:", e?.message || e);
    }
  }

  // 2. Sync to local database
  local.tournament = updatedTournament;
  if (newHistoryRecord) {
    local.priceHistory.unshift(newHistoryRecord);
    if (local.priceHistory.length > 50) {
      local.priceHistory = local.priceHistory.slice(0, 50);
    }
  }
  persistLocalFile(local);

  return { tournament: updatedTournament, history: newHistoryRecord };
}

export async function updateTournamentPrizes(
  squadPrice: number,
  winnerPrize: number,
  runnerUpPrize: number,
  thirdPrize: number,
  note?: string
): Promise<{ tournament: TournamentData; history: PriceHistoryRecord }> {
  const res = await updateTournamentSettings({
    squadPrice,
    winnerPrize,
    runnerUpPrize,
    thirdPrize,
    note,
  });
  return { tournament: res.tournament, history: res.history! };
}

export async function getPriceHistory(): Promise<PriceHistoryRecord[]> {
  const local = ensureLocalFile();
  return Array.isArray(local.priceHistory) ? local.priceHistory : [];
}

export async function clearPriceHistory(): Promise<boolean> {
  const local = ensureLocalFile();
  local.priceHistory = [];
  persistLocalFile(local);
  return true;
}

export async function getTeams(): Promise<TeamRegistration[]> {
  const local = ensureLocalFile();

  if (isSupabaseReady() && supabase) {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .order("slot_number", { ascending: true });

      if (!error && Array.isArray(data)) {
        const cloudTeams: TeamRegistration[] = data.map((row: any) => {
          const players = Array.isArray(row.players) ? row.players : [];
          const rawStatus = (row.payment_status || "").toLowerCase();
          const pStatus: "paid" | "unpaid" | "pending" =
            rawStatus === "verified" || rawStatus === "paid" || rawStatus === "approved"
              ? "paid"
              : rawStatus === "pending"
              ? "pending"
              : "unpaid";

          return {
            id: row.id || `TEAM-${row.slot_number}`,
            slotNumber: row.slot_number,
            teamName: row.team_name,
            igl: {
              name: players[0]?.name || "",
              uid: players[0]?.uid || "",
              phone: row.captain_phone || "",
            },
            player2: {
              name: players[1]?.name || "",
              uid: players[1]?.uid || "",
            },
            player3: {
              name: players[2]?.name || "",
              uid: players[2]?.uid || "",
            },
            player4: {
              name: players[3]?.name || "",
              uid: players[3]?.uid || "",
            },
            registeredAt: row.created_at || new Date().toISOString(),
            paymentStatus: pStatus,
            paymentAmount: Number(row.entry_fee_paid || local.tournament.squadPrice || 40),
            paymentUtr: row.utr_number && !row.utr_number.startsWith("DIRECT-") ? row.utr_number : "",
            paymentTime: row.created_at,
            paymentMethod: "UPI",
          };
        });

        local.teams = cloudTeams;
        persistLocalFile(local);
        return cloudTeams;
      }
    } catch (e) {
      console.warn("Supabase getTeams error, fallback to local:", e);
    }
  }

  return local.teams.map((t) => ({
    ...t,
    paymentStatus: t.paymentStatus || "unpaid",
    paymentAmount: t.paymentAmount ?? local.tournament.squadPrice ?? 40,
    paymentUtr: t.paymentUtr || "",
  }));
}

export async function registerTeam(data: {
  teamName: string;
  igl: { name: string; uid?: string; phone: string };
  player2: { name: string; uid?: string };
  player3: { name: string; uid?: string };
  player4: { name: string; uid?: string };
  paymentStatus?: "paid" | "unpaid" | "pending";
  paymentUtr?: string;
}): Promise<TeamRegistration> {
  const currentTeams = await getTeams();

  if (currentTeams.length >= 12) {
    throw new Error("All 12 Slots are full! Maximum 48 players allowed.");
  }

  // Find next available slot number 1-12
  const occupiedSlots = new Set(currentTeams.map((t) => t.slotNumber));
  let assignedSlot = 1;
  for (let i = 1; i <= 12; i++) {
    if (!occupiedSlots.has(i)) {
      assignedSlot = i;
      break;
    }
  }

  const teamId = `PTL-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();
  const local = ensureLocalFile();
  const tournament = await getTournament();
  const entryFee = Number(tournament.squadPrice || local.tournament.squadPrice || 40);
  const initialPaymentStatus = data.paymentStatus || "unpaid";

  const newTeam: TeamRegistration = {
    id: teamId,
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
    registeredAt: now,
    paymentStatus: initialPaymentStatus,
    paymentAmount: entryFee,
    paymentUtr: data.paymentUtr?.trim() || "",
    paymentTime: initialPaymentStatus === "paid" ? now : undefined,
    paymentMethod: "UPI",
  };

  // Sync to Supabase
  if (isSupabaseReady() && supabase) {
    try {
      await supabase.from("teams").insert({
        id: teamId,
        team_name: newTeam.teamName,
        captain_phone: newTeam.igl.phone,
        slot_number: assignedSlot,
        utr_number: newTeam.paymentUtr || `DIRECT-${Date.now()}`,
        entry_fee_paid: entryFee,
        payment_status: initialPaymentStatus === "paid" ? "verified" : initialPaymentStatus,
        status: initialPaymentStatus === "paid" ? "approved" : "pending",
        players: [
          { name: newTeam.igl.name, uid: newTeam.igl.uid, isCaptain: true },
          { name: newTeam.player2.name, uid: newTeam.player2.uid },
          { name: newTeam.player3.name, uid: newTeam.player3.uid },
          { name: newTeam.player4.name, uid: newTeam.player4.uid },
        ],
        created_at: now,
      });
    } catch (e) {
      console.error("Supabase registerTeam error:", e);
    }
  }

  // Sync to local
  local.teams.push(newTeam);
  local.teams.sort((a, b) => a.slotNumber - b.slotNumber);
  persistLocalFile(local);

  return newTeam;
}

export async function deleteTeam(teamId: string, slotNumber?: number): Promise<boolean> {
  let supabaseSuccess = false;

  if (isSupabaseReady() && supabase) {
    try {
      // 1. Delete by primary ID
      if (teamId) {
        const { error: idErr } = await supabase.from("teams").delete().eq("id", teamId);
        if (!idErr) supabaseSuccess = true;
      }
      // 2. Also delete by slot_number if given or if teamId contains slot
      const numericSlot = slotNumber || Number(teamId.replace(/\D/g, ""));
      if (!isNaN(numericSlot) && numericSlot > 0 && numericSlot <= 12) {
        await supabase.from("teams").delete().eq("slot_number", numericSlot);
      }
    } catch (e: any) {
      console.warn("Supabase deleteTeam exception:", e?.message || e);
    }
  }

  const local = ensureLocalFile();
  const initialCount = local.teams.length;
  local.teams = local.teams.filter(
    (t) => t.id !== teamId && (!slotNumber || t.slotNumber !== slotNumber)
  );
  persistLocalFile(local);

  return true;
}

export async function deletePlayerFromTeam(
  teamId: string,
  playerKey: "igl" | "player2" | "player3" | "player4"
): Promise<TeamRegistration | null> {
  const currentTeams = await getTeams();
  const team = currentTeams.find((t) => t.id === teamId || String(t.slotNumber) === teamId);
  if (!team) return null;

  if (playerKey === "igl") {
    team.igl = { name: "", uid: "", phone: "" };
  } else if (playerKey === "player2") {
    team.player2 = { name: "", uid: "" };
  } else if (playerKey === "player3") {
    team.player3 = { name: "", uid: "" };
  } else if (playerKey === "player4") {
    team.player4 = { name: "", uid: "" };
  }

  // Sync to Supabase
  if (isSupabaseReady() && supabase) {
    try {
      await supabase
        .from("teams")
        .update({
          captain_phone: team.igl.phone,
          players: [
            { name: team.igl.name, uid: team.igl.uid, isCaptain: true },
            { name: team.player2.name, uid: team.player2.uid },
            { name: team.player3.name, uid: team.player3.uid },
            { name: team.player4.name, uid: team.player4.uid },
          ],
        })
        .eq("id", teamId);
    } catch (e) {
      console.error("Supabase deletePlayerFromTeam error:", e);
    }
  }

  const local = ensureLocalFile();
  const localTeam = local.teams.find((t) => t.id === teamId);
  if (localTeam) {
    Object.assign(localTeam, team);
    persistLocalFile(local);
  }

  return team;
}

export async function updatePlayerInTeam(
  teamId: string,
  playerKey: "igl" | "player2" | "player3" | "player4",
  playerInfo: { name: string; uid?: string; phone?: string }
): Promise<TeamRegistration | null> {
  const currentTeams = await getTeams();
  const team = currentTeams.find((t) => t.id === teamId);
  if (!team) return null;

  if (playerKey === "igl") {
    team.igl = {
      name: playerInfo.name.trim(),
      uid: playerInfo.uid?.trim() || "",
      phone: playerInfo.phone?.trim() || team.igl.phone,
    };
  } else if (playerKey === "player2") {
    team.player2 = {
      name: playerInfo.name.trim(),
      uid: playerInfo.uid?.trim() || "",
    };
  } else if (playerKey === "player3") {
    team.player3 = {
      name: playerInfo.name.trim(),
      uid: playerInfo.uid?.trim() || "",
    };
  } else if (playerKey === "player4") {
    team.player4 = {
      name: playerInfo.name.trim(),
      uid: playerInfo.uid?.trim() || "",
    };
  }

  // Sync to Supabase
  if (isSupabaseReady() && supabase) {
    try {
      await supabase
        .from("teams")
        .update({
          captain_phone: team.igl.phone,
          players: [
            { name: team.igl.name, uid: team.igl.uid, isCaptain: true },
            { name: team.player2.name, uid: team.player2.uid },
            { name: team.player3.name, uid: team.player3.uid },
            { name: team.player4.name, uid: team.player4.uid },
          ],
        })
        .eq("id", teamId);
    } catch (e) {
      console.error("Supabase updatePlayerInTeam error:", e);
    }
  }

  const local = ensureLocalFile();
  const localTeam = local.teams.find((t) => t.id === teamId);
  if (localTeam) {
    Object.assign(localTeam, team);
    persistLocalFile(local);
  }

  return team;
}

export async function resetAllTeams(): Promise<boolean> {
  if (isSupabaseReady() && supabase) {
    try {
      await supabase.from("teams").delete().neq("id", "none");
    } catch (e) {
      console.error("Supabase resetAllTeams error:", e);
    }
  }

  const local = ensureLocalFile();
  local.teams = [];
  persistLocalFile(local);
  return true;
}

export async function updateTeamPaymentStatus(
  teamId: string,
  paymentStatus: "paid" | "unpaid" | "pending",
  paymentUtr?: string,
  paymentAmount?: number
): Promise<TeamRegistration | null> {
  const local = ensureLocalFile();
  const index = local.teams.findIndex((t) => t.id === teamId);
  if (index === -1) {
    return null;
  }

  const team = local.teams[index];
  team.paymentStatus = paymentStatus;
  if (paymentUtr !== undefined) {
    team.paymentUtr = paymentUtr.trim();
  }
  if (paymentAmount !== undefined) {
    team.paymentAmount = Number(paymentAmount);
  } else if (!team.paymentAmount) {
    team.paymentAmount = Number(local.tournament.squadPrice || 100);
  }
  team.paymentTime = new Date().toISOString();
  local.teams[index] = team;
  persistLocalFile(local);

  // Sync to Supabase Cloud Database
  if (isSupabaseReady() && supabase) {
    try {
      const dbStatus = paymentStatus === "paid" ? "verified" : paymentStatus;
      await supabase
        .from("teams")
        .update({
          payment_status: dbStatus,
          status: paymentStatus === "paid" ? "approved" : "pending",
          utr_number: team.paymentUtr || `DIRECT-${Date.now()}`,
          entry_fee_paid: team.paymentAmount || local.tournament.squadPrice,
        })
        .eq("id", teamId);
    } catch (e) {
      console.error("Supabase updateTeamPaymentStatus error:", e);
    }
  }

  return team;
}
