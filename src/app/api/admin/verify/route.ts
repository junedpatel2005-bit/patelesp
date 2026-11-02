import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const correctPassword = process.env.ADMIN_SECRET_KEY || "2412";

    if (password === correctPassword) {
      return NextResponse.json({
        success: true,
        message: "Admin authentication successful",
        token: "admin_patelesp_auth_token",
      });
    }

    return NextResponse.json(
      { success: false, message: "Incorrect password. Access denied." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Authentication error" },
      { status: 500 }
    );
  }
}
