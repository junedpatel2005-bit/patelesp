import { NextRequest, NextResponse } from "next/server";
import { getTeams, registerTeam, deleteTeam, resetAllTeams } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const teams = getTeams();
    return NextResponse.json(
      { success: true, teams, count: teams.length, maxTeams: 12 },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, igl, player2, player3, player4 } = body;

    if (!teamName || !teamName.trim()) {
      return NextResponse.json({ success: false, message: "Team Name is required." }, { status: 400 });
    }
    if (!igl || !igl.name || !igl.name.trim()) {
      return NextResponse.json({ success: false, message: "IGL Player Name is required." }, { status: 400 });
    }
    if (!igl.phone || !igl.phone.trim()) {
      return NextResponse.json({ success: false, message: "IGL Phone / WhatsApp Number is required." }, { status: 400 });
    }
    if (!player2 || !player2.name || !player2.name.trim()) {
      return NextResponse.json({ success: false, message: "Player 2 Name is required." }, { status: 400 });
    }
    if (!player3 || !player3.name || !player3.name.trim()) {
      return NextResponse.json({ success: false, message: "Player 3 Name is required." }, { status: 400 });
    }
    if (!player4 || !player4.name || !player4.name.trim()) {
      return NextResponse.json({ success: false, message: "Player 4 Name is required." }, { status: 400 });
    }

    const newTeam = registerTeam({
      teamName,
      igl,
      player2,
      player3,
      player4,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Team ${teamName} registered successfully in Slot #${newTeam.slotNumber}!`,
        team: newTeam,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Registration failed." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const reset = searchParams.get("reset");

    if (reset === "true") {
      resetAllTeams();
      return NextResponse.json({ success: true, message: "All teams reset successfully." });
    }

    if (!teamId) {
      return NextResponse.json({ success: false, message: "Missing teamId parameter." }, { status: 400 });
    }

    const deleted = deleteTeam(teamId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Team removed and slot released." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to remove team." },
      { status: 500 }
    );
  }
}
