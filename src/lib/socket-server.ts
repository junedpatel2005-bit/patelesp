import type { Server as SocketIOServer } from "socket.io";
import { TournamentData, TeamRegistration, PriceHistoryRecord } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var io: SocketIOServer | undefined;
}

/**
 * Returns the active Socket.IO server instance attached to Node global
 */
export function getIO(): SocketIOServer | null {
  if (typeof global !== "undefined" && global.io) {
    return global.io;
  }
  return null;
}

/**
 * Broadcast tournament settings or prize changes to all connected clients
 */
export function broadcastTournamentUpdated(
  tournament: TournamentData,
  historyRecord?: PriceHistoryRecord
) {
  const io = getIO();
  if (!io) {
    console.warn("[Socket.IO] No server instance found on global.io to broadcast tournament update.");
    return;
  }

  io.emit("tournament:updated", {
    tournament,
    historyRecord,
    timestamp: Date.now(),
  });

  // Also emit convenience alias for price changes
  io.emit("prices:updated", {
    tournament,
    historyRecord,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted tournament & price updates to clients`);
}

/**
 * Broadcast complete updated teams list to all connected clients
 */
export function broadcastTeamsUpdated(teams: TeamRegistration[]) {
  const io = getIO();
  if (!io) {
    console.warn("[Socket.IO] No server instance found on global.io to broadcast teams update.");
    return;
  }

  io.emit("teams:updated", {
    teams,
    count: teams.length,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted teams update (${teams.length} teams) to clients`);
}

/**
 * Broadcast when a new squad registers
 */
export function broadcastTeamRegistered(team: TeamRegistration, allTeams: TeamRegistration[]) {
  const io = getIO();
  if (!io) return;

  io.emit("team:registered", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  // Also send general teams:updated event
  io.emit("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted new registration: "${team.teamName}" in Slot #${team.slotNumber}`);
}

/**
 * Broadcast when a team is removed / slot released
 */
export function broadcastTeamDeleted(
  teamId: string,
  slotNumber: number | undefined,
  allTeams: TeamRegistration[]
) {
  const io = getIO();
  if (!io) return;

  io.emit("team:deleted", {
    teamId,
    slotNumber,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  io.emit("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted team deletion (Slot: ${slotNumber ?? "N/A"})`);
}

/**
 * Broadcast when a player is updated or removed from a team
 */
export function broadcastPlayerUpdated(team: TeamRegistration, allTeams: TeamRegistration[]) {
  const io = getIO();
  if (!io) return;

  io.emit("player:updated", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  io.emit("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted player change in team "${team.teamName}"`);
}

/**
 * Broadcast when a team's payment status or UTR changes
 */
export function broadcastTeamPaymentUpdated(team: TeamRegistration, allTeams: TeamRegistration[]) {
  const io = getIO();
  if (!io) return;

  io.emit("team:payment_status", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  io.emit("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted payment status "${team.paymentStatus}" for "${team.teamName}"`);
}

/**
 * Broadcast when all teams are reset from admin
 */
export function broadcastTeamsReset() {
  const io = getIO();
  if (!io) return;

  io.emit("teams:reset", {
    timestamp: Date.now(),
  });

  io.emit("teams:updated", {
    teams: [],
    count: 0,
    timestamp: Date.now(),
  });

  console.log(`[Socket.IO] Broadcasted all teams reset`);
}
