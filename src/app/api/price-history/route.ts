import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const history = getPriceHistory();
    return NextResponse.json(
      { success: true, history },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
