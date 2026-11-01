import { NextRequest, NextResponse } from "next/server";
import { getTeamById, getTournament } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await getTeamById(id);

    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team registration not found" },
        { status: 404 }
      );
    }

    const tournament = await getTournament();

    // Check if room credentials should be visible
    const isRoomVisible = team.status === "approved" && tournament.roomAnnounced;

    return NextResponse.json({
      success: true,
      team,
      tournament: {
        title: tournament.title,
        matchDate: tournament.matchDate,
        matchTime: tournament.matchTime,
        map: tournament.map,
        mode: tournament.mode,
        firstPrize: tournament.firstPrize,
        secondPrize: tournament.secondPrize,
        entryFee: tournament.entryFee,
        roomAnnounced: tournament.roomAnnounced,
        roomId: isRoomVisible ? tournament.roomId : null,
        roomPassword: isRoomVisible ? tournament.roomPassword : null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch team ticket" },
      { status: 500 }
    );
  }
}
