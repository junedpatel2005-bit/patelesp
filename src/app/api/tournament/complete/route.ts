import { NextResponse } from "next/server";
import { resetAllTeams, updateTournamentSettings, getTournament } from "@/lib/db";
import { broadcastTeamsReset, broadcastTournamentUpdated } from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    // 1. Reset all teams and slots from both Supabase and local DB
    await resetAllTeams();

    // 2. Clear room credentials and set room not live for next match
    const updateResult = await updateTournamentSettings({
      roomId: "",
      roomPassword: "",
      isRoomLive: false,
      note: "Tournament concluded & reset for next season",
    });

    const tournament = updateResult.tournament || (await getTournament());

    // 3. Broadcast real-time Socket.IO events to all connected clients
    try {
      broadcastTeamsReset();
      broadcastTournamentUpdated(tournament);
    } catch (socketErr) {
      console.warn("Socket broadcast error in tournament complete route:", socketErr);
    }

    return NextResponse.json({
      success: true,
      message:
        "Tournament concluded successfully! All 12 squad slots, players, payments, and room credentials have been reset.",
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
