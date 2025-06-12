import { NextRequest, NextResponse } from "next/server";
import { getVoteResults } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    const { data: voteCounts, error } = await getVoteResults();

    if (error) {
      return NextResponse.json(
        { error: "Failed to get vote results" },
        { status: 500 }
      );
    }

    return NextResponse.json(voteCounts || {}, { status: 200 });
  } catch (error) {
    console.error("Results route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
