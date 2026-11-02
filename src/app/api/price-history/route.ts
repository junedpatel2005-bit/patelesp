import { NextResponse } from "next/server";
import { getPriceHistory, clearPriceHistory } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const history = await getPriceHistory();
    return NextResponse.json(
      { success: true, history },
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
      { success: false, message: error?.message || "Failed to fetch price history" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearPriceHistory();
    return NextResponse.json({
      success: true,
      message: "Price change history cleared successfully.",
      history: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to clear price history" },
      { status: 500 }
    );
  }
}
