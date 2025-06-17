import { NextRequest, NextResponse } from "next/server";
import { getVoteResults } from "@/lib/supabase-database";

function logResultsError(context: {
  error: unknown;
  req: NextRequest;
  stage?: string;
}) {
  const { error, req, stage } = context;
  const logObj = {
    stage,
    error,
    ip: req.headers.get("x-forwarded-for") ?? (req as any).ip ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
    time: new Date().toISOString(),
  };
  console.error("[RESULTS API ERROR]", JSON.stringify(logObj, null, 2));
}

export async function GET(req: NextRequest) {
  try {
    const { data: voteCounts, error } = await getVoteResults();

    if (error) {
      logResultsError({ error, req, stage: "getVoteResults" });
      return NextResponse.json(
        { error: "Failed to get vote results" },
        { status: 500 }
      );
    }

    return NextResponse.json(voteCounts ?? {}, { status: 200 });
  } catch (error) {
    logResultsError({ error, req, stage: "catch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
