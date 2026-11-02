import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateTournamentSettings } from "@/lib/db";
import { broadcastTournamentUpdated } from "@/lib/socket-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const tournament = await getTournament();
    return NextResponse.json(
      { success: true, tournament },
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
      { success: false, message: error?.message || "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await updateTournamentSettings(body);

    // Real-time Socket.IO broadcast to all connected clients
    try {
      broadcastTournamentUpdated(result.tournament, result.history);
    } catch (socketErr) {
      console.warn("Socket broadcast error in tournament route:", socketErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tournament settings updated successfully!",
        tournament: result.tournament,
        historyRecord: result.history,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
