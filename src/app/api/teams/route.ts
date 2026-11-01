import { NextRequest, NextResponse } from "next/server";
import { getAllTeams, updateTeamStatus } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json(
      { success: true, teams },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY || "2412";

    if (adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id, status, notes } = body;
    if (!id || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid team ID or status" },
        { status: 400 }
      );
    }

    const updated = await updateTeamStatus(id, status, notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, team: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update team" },
      { status: 500 }
    );
  }
}
