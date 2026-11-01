import { NextResponse } from "next/server";
import { getDatabaseStatus } from "@/lib/storage";

export async function GET() {
  try {
    const status = await getDatabaseStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, connected: false, message: error?.message || "Failed to check database status" },
      { status: 500 }
    );
  }
}
