import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
    const expectedPasscode = process.env.ADMIN_SECRET_KEY || "patelesp2026";

    if (!passcode || passcode.trim() !== expectedPasscode.trim()) {
      return NextResponse.json(
        { success: false, message: "Incorrect Admin Passcode" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      token: expectedPasscode,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
