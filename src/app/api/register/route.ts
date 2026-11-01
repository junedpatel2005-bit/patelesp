import { NextRequest, NextResponse } from "next/server";
import { createTeam, getTournament } from "@/lib/storage";
import { Player } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, captainPhone, captainEmail, players, utrNumber, substitutePlayer } = body;

    // Validation
    if (!teamName || typeof teamName !== "string" || teamName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Valid Team Name is required (minimum 2 characters)" },
        { status: 400 }
      );
    }

    if (!captainPhone || typeof captainPhone !== "string" || captainPhone.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Valid 10-digit Captain Phone / WhatsApp number is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(players) || players.length !== 4) {
      return NextResponse.json(
        { success: false, message: "Exactly 4 players are required for Squad registration" },
        { status: 400 }
      );
    }

    // Validate each player has a name and Free Fire UID
    for (let i = 0; i < players.length; i++) {
      const p = players[i] as Player;
      if (!p.name || p.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: `Player ${i + 1} name is required` },
          { status: 400 }
        );
      }
      if (!p.freeFireUid || p.freeFireUid.trim().length < 6) {
        return NextResponse.json(
          { success: false, message: `Player ${i + 1} (${p.name}) Free Fire UID must be at least 6 digits` },
          { status: 400 }
        );
      }
    }

    if (!utrNumber || typeof utrNumber !== "string" || utrNumber.trim().length < 6) {
      return NextResponse.json(
        { success: false, message: "Valid UPI Transaction ID / UTR reference number is required" },
        { status: 400 }
      );
    }

    const tournament = await getTournament();

    const newTeam = await createTeam({
      teamName: teamName.trim(),
      captainPhone: captainPhone.trim(),
      captainEmail: captainEmail?.trim() || undefined,
      players: players as [Player, Player, Player, Player],
      substitutePlayer: substitutePlayer?.name ? substitutePlayer : undefined,
      utrNumber: utrNumber.trim(),
      entryFeePaid: tournament.entryFee,
    });

    return NextResponse.json({
      success: true,
      message: "Team successfully registered for PATELESP Free Fire Tournament!",
      team: newTeam,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error processing registration" },
      { status: 500 }
    );
  }
}
