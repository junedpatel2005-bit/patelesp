import { NextRequest, NextResponse } from "next/server";
import { getNotifications, markNotificationsAsRead } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY || "2412";

    if (adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await getNotifications();
    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = process.env.ADMIN_SECRET_KEY || "2412";

    if (adminKey !== expectedKey) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await markNotificationsAsRead();
    return NextResponse.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to mark notifications read" },
      { status: 500 }
    );
  }
}
