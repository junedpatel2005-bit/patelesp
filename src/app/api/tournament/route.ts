import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateTournamentPrizes } from "@/lib/db";

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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
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
    const { squadPrice, winnerPrize, runnerUpPrize, thirdPrize, note } = body;

    if (
      squadPrice === undefined ||
      winnerPrize === undefined ||
      runnerUpPrize === undefined ||
      thirdPrize === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required prize fields" },
        { status: 400 }
      );
    }

    const result = await updateTournamentPrizes(
      Number(squadPrice),
      Number(winnerPrize),
      Number(runnerUpPrize),
      Number(thirdPrize),
      note
    );

    return NextResponse.json(
      {
        success: true,
        message: "Prizes updated successfully!",
        tournament: result.tournament,
        historyRecord: result.history,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update prizes" },
      { status: 500 }
    );
  }
}
