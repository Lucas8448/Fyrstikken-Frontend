import { initializeDatabase } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await initializeDatabase();
    return NextResponse.json(
      { message: "Database initialized successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
