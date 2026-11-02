import { NextResponse } from "next/server";
import { resetAllTeams, getTournament } from "@/lib/db";
import { broadcastTeamsReset, broadcastTournamentUpdated } from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    // Reset all teams and slots from both Supabase and local DB
    await resetAllTeams();

    const tournament = await getTournament();

    // Broadcast real-time Socket.IO events to all clients
    try {
      broadcastTeamsReset();
      broadcastTournamentUpdated(tournament);
    } catch (socketErr) {
      console.warn("Socket broadcast error in tournament complete route:", socketErr);
    }

    return NextResponse.json({
      success: true,
      message: "Tournament marked as COMPLETED! All 12 squad slots and payments reset for the next tournament.",
      tournament,
      teams: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to complete tournament." },
      { status: 500 }
    );
  }
}
