import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  getUserByEmail,
  updateUserVote,
} from "@/lib/supabase-database";
import { isVotingAllowed, getVotingPeriod } from "@/lib/utils";

function logVoteError(context: {
  error: unknown;
  req: NextRequest;
  body?: any;
  userError?: any;
  user?: any;
  email?: string;
  token?: string;
  stage?: string;
}) {
  const { error, req, body, userError, user, email, token, stage } = context;
  const logObj = {
    stage,
    error,
    userError,
    user,
    email,
    token: token ? token.substring(0, 8) + "..." : undefined,
    body,
    ip: req.headers.get("x-forwarded-for") ?? (req as any).ip ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
    time: new Date().toISOString(),
  };
  if (logObj.body?.token) logObj.body.token = "[REDACTED]";
  if (logObj.user?.verification_code) logObj.user.verification_code = "[REDACTED]";
  console.error("[VOTE API ERROR]", JSON.stringify(logObj, null, 2));
}

export async function POST(req: NextRequest) {
  let body;
  try {
    // Check if voting is allowed on the current date
    if (!isVotingAllowed()) {
      const votingPeriod = getVotingPeriod();
      const message = votingPeriod
        ? `Voting is only allowed between ${votingPeriod.startDate} and ${votingPeriod.endDate}`
        : "Voting is not currently allowed";
      logVoteError({ error: message, req, stage: "voting period check" });
      return NextResponse.json({ error: message }, { status: 403 });
    }

    body = await req.json();
    const { token, contestant_id } = body;

    if (!token) {
      logVoteError({ error: "Token is missing", req, body, stage: "validate input" });
      return NextResponse.json({ error: "Token is missing" }, { status: 401 });
    }

    if (!contestant_id) {
      logVoteError({ error: "Contestant ID is required", req, body, stage: "validate input" });
      return NextResponse.json(
        { error: "Contestant ID is required" },
        { status: 400 }
      );
    }

    // Verify token and get email
    const { email, error: tokenError } = await verifyToken(token);

    if (tokenError || !email) {
      logVoteError({ error: tokenError || "Invalid token", req, body, token, stage: "verifyToken" });
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user to check if they have already voted
    const { data: user, error: userError } = await getUserByEmail(email);

    if (userError || !user) {
      logVoteError({ error: userError || "User not found", req, body, userError, email, token, stage: "getUserByEmail" });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.contestant_voted !== null && user.contestant_voted !== undefined) {
      logVoteError({ error: "User has already voted", req, body, user, email, token, stage: "already voted" });
      return NextResponse.json(
        { error: "User has already voted" },
        { status: 400 }
      );
    }

    // Record the vote
    const { error: voteError } = await updateUserVote(
      email,
      contestant_id.toString()
    );

    if (voteError) {
      logVoteError({ error: voteError, req, body, user, email, token, stage: "updateUserVote" });
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Vote recorded" }, { status: 200 });
  } catch (error) {
    logVoteError({ error, req, body, stage: "catch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
