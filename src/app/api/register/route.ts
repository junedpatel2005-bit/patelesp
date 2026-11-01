import { NextRequest, NextResponse } from "next/server";
import { createTeam, getTournament } from "@/lib/storage";
import { Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { captainEmail, substitutePlayer } = body;
    let { teamName, captainPhone, players, utrNumber } = body;

    // Determine at least one player name or team name (only name required)
    const rawPlayers = Array.isArray(players) ? players : [];
    const p1Name = rawPlayers[0]?.name?.trim() || "";
    const rawTeamName = typeof teamName === "string" ? teamName.trim() : "";

    if (!p1Name && !rawTeamName) {
      return NextResponse.json(
        { success: false, message: "Please provide your Name to register" },
        { status: 400 }
      );
    }

    // Auto-generate team name if optional
    const finalTeamName = rawTeamName || (p1Name ? `${p1Name}'s Squad` : `Squad-${Math.floor(1000 + Math.random() * 9000)}`);

    // Captain Phone is optional (all placeholders optional)
    const finalCaptainPhone = (typeof captainPhone === "string" && captainPhone.trim()) 
      ? captainPhone.trim() 
      : "Not Provided";

    // Build 4 players where only name is required, all placeholders are optional
    const finalPlayers: [Player, Player, Player, Player] = [
      {
        name: p1Name || finalTeamName,
        freeFireUid: rawPlayers[0]?.freeFireUid?.trim() || "N/A",
        inGameName: rawPlayers[0]?.inGameName?.trim() || "",
        isCaptain: true,
      },
      {
        name: rawPlayers[1]?.name?.trim() || "Player 2",
        freeFireUid: rawPlayers[1]?.freeFireUid?.trim() || "N/A",
        inGameName: rawPlayers[1]?.inGameName?.trim() || "",
      },
      {
        name: rawPlayers[2]?.name?.trim() || "Player 3",
        freeFireUid: rawPlayers[2]?.freeFireUid?.trim() || "N/A",
        inGameName: rawPlayers[2]?.inGameName?.trim() || "",
      },
      {
        name: rawPlayers[3]?.name?.trim() || "Player 4",
        freeFireUid: rawPlayers[3]?.freeFireUid?.trim() || "N/A",
        inGameName: rawPlayers[3]?.inGameName?.trim() || "",
      },
    ];

    // UTR number is optional
    const finalUtr = (typeof utrNumber === "string" && utrNumber.trim()) 
      ? utrNumber.trim() 
      : `PENDING-${Math.floor(100000 + Math.random() * 900000)}`;

    const tournament = await getTournament();

    const newTeam = await createTeam({
      teamName: finalTeamName,
      captainPhone: finalCaptainPhone,
      captainEmail: captainEmail?.trim() || undefined,
      players: finalPlayers,
      substitutePlayer: substitutePlayer?.name ? substitutePlayer : undefined,
      utrNumber: finalUtr,
      entryFeePaid: tournament.entryFee,
    });

    return NextResponse.json({
      success: true,
      message: "Squad registered successfully for PATELESP Free Fire Tournament!",
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
