import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserByEmail, updateUserVote } from "@/lib/supabase-database";
import { isVotingAllowed, getVotingPeriod } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    // Check if voting is allowed on the current date
    if (!isVotingAllowed()) {
      const votingPeriod = getVotingPeriod();
      const message = votingPeriod
        ? `Voting is only allowed between ${votingPeriod.startDate} and ${votingPeriod.endDate}`
        : "Voting is not currently allowed";

      return NextResponse.json({ error: message }, { status: 403 });
    }

    const body = await req.json();
    const { token, contestant_id } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is missing" }, { status: 401 });
    }

    if (!contestant_id) {
      return NextResponse.json(
        { error: "Contestant ID is required" },
        { status: 400 }
      );
    }

    // Verify token and get email
    const { email, error: tokenError } = await verifyToken(token);

    if (tokenError || !email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get user to check if they have already voted
    const { data: user, error: userError } = await getUserByEmail(email);

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.contestant_voted !== null && user.contestant_voted !== undefined) {
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
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Vote recorded" }, { status: 200 });
  } catch (error) {
    console.error("Vote route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
