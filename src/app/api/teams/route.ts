import { NextRequest, NextResponse } from "next/server";
import {
  getTeams,
  registerTeam,
  deleteTeam,
  deletePlayerFromTeam,
  updatePlayerInTeam,
  resetAllTeams,
  updateTeamPaymentStatus,
  updateTeamSlot,
} from "@/lib/db";
import {
  broadcastTeamRegistered,
  broadcastTeamDeleted,
  broadcastPlayerUpdated,
  broadcastTeamsReset,
  broadcastTeamPaymentUpdated,
} from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const teams = await getTeams();
    return NextResponse.json(
      { success: true, teams, count: teams.length, maxTeams: 12 },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          "Pragma": "no-cache",
          "Expires": "0",
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
    const { teamName, igl, player2, player3, player4, slotNumber } = body;

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

    const newTeam = await registerTeam({
      teamName,
      igl,
      player2,
      player3,
      player4,
      slotNumber: slotNumber ? Number(slotNumber) : undefined,
    });

    // Real-time Socket.IO broadcast to all connected clients
    try {
      const allTeams = await getTeams();
      broadcastTeamRegistered(newTeam, allTeams);
    } catch (socketErr) {
      console.warn("Socket broadcast error in registerTeam:", socketErr);
    }

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
    const slot = searchParams.get("slot");
    const playerKey = searchParams.get("playerKey") as "igl" | "player2" | "player3" | "player4" | null;
    const reset = searchParams.get("reset");

    if (reset === "true") {
      await resetAllTeams();
      try {
        broadcastTeamsReset();
      } catch (socketErr) {
        console.warn("Socket broadcast error in resetAllTeams:", socketErr);
      }
      return NextResponse.json(
        { success: true, message: "All teams reset successfully." },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    if (!teamId) {
      return NextResponse.json({ success: false, message: "Missing teamId parameter." }, { status: 400 });
    }

    // Delete individual player if playerKey specified
    if (playerKey) {
      const updatedTeam = await deletePlayerFromTeam(teamId, playerKey);
      if (!updatedTeam) {
        return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
      }
      try {
        const allTeams = await getTeams();
        broadcastPlayerUpdated(updatedTeam, allTeams);
      } catch (socketErr) {
        console.warn("Socket broadcast error in deletePlayerFromTeam:", socketErr);
      }
      return NextResponse.json(
        {
          success: true,
          message: `Player removed from ${updatedTeam.teamName}.`,
          team: updatedTeam,
        },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    // Delete entire team (by teamId and optional slot)
    const slotNum = slot ? Number(slot) : undefined;
    const deleted = await deleteTeam(teamId, slotNum);
    try {
      const allTeams = await getTeams();
      broadcastTeamDeleted(teamId, slotNum, allTeams);
    } catch (socketErr) {
      console.warn("Socket broadcast error in deleteTeam:", socketErr);
    }

    return NextResponse.json(
      { success: true, message: "Full team removed and slot released." },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to remove team/player." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, playerKey, playerInfo, paymentStatus, paymentUtr, paymentAmount, newSlotNumber } = body;

    // Support moving team to a different Free Fire custom room slot
    if (teamId && newSlotNumber !== undefined) {
      const updated = await updateTeamSlot(teamId, Number(newSlotNumber));
      if (!updated) {
        return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
      }
      try {
        const allTeams = await getTeams();
        broadcastPlayerUpdated(updated, allTeams);
      } catch (socketErr) {
        console.warn("Socket broadcast error in updateTeamSlot:", socketErr);
      }
      return NextResponse.json({
        success: true,
        message: `Team "${updated.teamName}" successfully moved to Slot #${updated.slotNumber}!`,
        team: updated,
      });
    }

    // Support payment status update via PATCH /api/teams
    if (teamId && paymentStatus) {
      const updated = await updateTeamPaymentStatus(teamId, paymentStatus, paymentUtr, paymentAmount);
      if (!updated) {
        return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
      }
      try {
        const allTeams = await getTeams();
        broadcastTeamPaymentUpdated(updated, allTeams);
      } catch (socketErr) {
        console.warn("Socket broadcast error:", socketErr);
      }
      return NextResponse.json({
        success: true,
        message: `Payment status updated to ${paymentStatus.toUpperCase()}.`,
        team: updated,
      });
    }

    if (!teamId || !playerKey || !playerInfo || !playerInfo.name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (teamId, playerKey, playerInfo)." },
        { status: 400 }
      );
    }

    const updated = await updatePlayerInTeam(teamId, playerKey, playerInfo);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
    }

    // Real-time Socket.IO broadcast to all connected clients
    try {
      const allTeams = await getTeams();
      broadcastPlayerUpdated(updated, allTeams);
    } catch (socketErr) {
      console.warn("Socket broadcast error in updatePlayerInTeam:", socketErr);
    }

    return NextResponse.json({
      success: true,
      message: `Player updated in ${updated.teamName}.`,
      team: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update player." },
      { status: 500 }
    );
  }
}
