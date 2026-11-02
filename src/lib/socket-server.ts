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
 * Robust broadcast helper:
 * Uses memory `global.io` when available, or dispatches to internal broadcast HTTP endpoint
 * when running inside Next.js App Router worker threads.
 */
async function emitBroadcast(event: string, payload: any) {
  const io = getIO();
  if (io) {
    try {
      io.emit(event, payload);
    } catch (e) {}
    return;
  }

  try {
    const port = process.env.PORT || "3000";
    await fetch(`http://127.0.0.1:${port}/api/socket-internal-broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
      signal: AbortSignal.timeout(800),
    }).catch(() => {});
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Broadcast tournament settings or prize changes to all connected clients
 */
export function broadcastTournamentUpdated(
  tournament: TournamentData,
  historyRecord?: PriceHistoryRecord
) {
  const payload = {
    tournament,
    historyRecord,
    timestamp: Date.now(),
  };

  emitBroadcast("tournament:updated", payload);
  emitBroadcast("prices:updated", payload);
}

/**
 * Broadcast complete updated teams list to all connected clients
 */
export function broadcastTeamsUpdated(teams: TeamRegistration[]) {
  emitBroadcast("teams:updated", {
    teams,
    count: teams.length,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast when a new squad registers
 */
export function broadcastTeamRegistered(team: TeamRegistration, allTeams: TeamRegistration[]) {
  emitBroadcast("team:registered", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  emitBroadcast("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast when a team is removed / slot released
 */
export function broadcastTeamDeleted(
  teamId: string,
  slotNumber: number | undefined,
  allTeams: TeamRegistration[]
) {
  emitBroadcast("team:deleted", {
    teamId,
    slotNumber,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  emitBroadcast("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast when a player is updated or removed from a team
 */
export function broadcastPlayerUpdated(team: TeamRegistration, allTeams: TeamRegistration[]) {
  emitBroadcast("player:updated", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  emitBroadcast("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast when a team's payment status or UTR changes
 */
export function broadcastTeamPaymentUpdated(team: TeamRegistration, allTeams: TeamRegistration[]) {
  emitBroadcast("team:payment_status", {
    team,
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });

  emitBroadcast("teams:updated", {
    teams: allTeams,
    count: allTeams.length,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast when all teams are reset from admin
 */
export function broadcastTeamsReset() {
  emitBroadcast("teams:reset", {
    timestamp: Date.now(),
  });

  emitBroadcast("teams:updated", {
    teams: [],
    count: 0,
    timestamp: Date.now(),
  });
}
