import { NextRequest, NextResponse } from "next/server";
import { getTeams, updateTeamPaymentStatus } from "@/lib/db";
import { broadcastTeamPaymentUpdated } from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, paymentStatus, paymentUtr, paymentAmount } = body;

    if (!teamId) {
      return NextResponse.json({ success: false, message: "teamId is required." }, { status: 400 });
    }

    if (!paymentStatus || !["paid", "unpaid", "pending"].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status. Must be 'paid', 'unpaid', or 'pending'." },
        { status: 400 }
      );
    }

    const updatedTeam = await updateTeamPaymentStatus(teamId, paymentStatus, paymentUtr, paymentAmount);

    if (!updatedTeam) {
      return NextResponse.json({ success: false, message: "Team not found." }, { status: 404 });
    }

    const allTeams = await getTeams();

    // Broadcast in real-time via Socket.IO
    try {
      broadcastTeamPaymentUpdated(updatedTeam, allTeams);
    } catch (socketErr) {
      console.warn("Socket broadcast error in payment route:", socketErr);
    }

    return NextResponse.json({
      success: true,
      message: `Payment status for ${updatedTeam.teamName} updated to ${paymentStatus.toUpperCase()}.`,
      team: updatedTeam,
      teams: allTeams,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to update payment." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
