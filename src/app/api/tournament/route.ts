import { NextRequest, NextResponse } from "next/server";
import { getTournament, updateTournament } from "@/lib/storage";

export async function GET() {
  try {
    const tournament = await getTournament();
    return NextResponse.json({ success: true, tournament });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch tournament details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const updated = await updateTournament(body);
    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update tournament details" },
      { status: 500 }
    );
  }
}
