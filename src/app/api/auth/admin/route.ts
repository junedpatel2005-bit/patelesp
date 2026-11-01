import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiting for admin passcode protection
const failedAttempts = new Map<string, { count: number; blockedUntil: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-client";
    const now = Date.now();

    const record = failedAttempts.get(ip);
    if (record && record.blockedUntil > now) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          message: `Too many failed attempts. Access temporarily locked for ${remainingSeconds}s.` 
        },
        { status: 429 }
      );
    }

    const { passcode } = await req.json();
    const expectedPasscode = process.env.ADMIN_SECRET_KEY || "patelesp2026";

    if (!passcode || passcode.trim() !== expectedPasscode.trim()) {
      const current = failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
      current.count += 1;

      // Lock out for 15 minutes if 5 failed attempts
      if (current.count >= 5) {
        current.blockedUntil = now + 15 * 60 * 1000;
        failedAttempts.set(ip, current);
        return NextResponse.json(
          { 
            success: false, 
            message: "Too many failed attempts. Access locked for 15 minutes." 
          },
          { status: 429 }
        );
      }

      failedAttempts.set(ip, current);
      return NextResponse.json(
        { 
          success: false, 
          message: `Incorrect Passcode. (${5 - current.count} attempts remaining)` 
        },
        { status: 401 }
      );
    }

    // Reset on successful login
    failedAttempts.delete(ip);

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
