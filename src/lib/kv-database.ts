import Redis from "ioredis";
import { generateToken } from "./email";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!);

// Types
interface User {
  email: string;
  verificationCode?: string;
  codeExpiry?: number;
  contestantVoted?: string;
  createdAt: number;
}

interface VoteCounts {
  [projectId: string]: number;
}

// Helper function to check if email is allowed
function isEmailAllowed(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_MAILS?.split(",") || [];
  return allowedEmails.some(
    (allowedEmail) => allowedEmail.trim().toLowerCase() === email.toLowerCase()
  );
}

// User management
export async function getUserByEmail(email: string) {
  try {
    if (!isEmailAllowed(email)) {
      return { data: null, error: { message: "Email not allowed" } };
    }

    const userJson = await redis.get(`user:${email.toLowerCase()}`);

    if (!userJson) {
      // Create user if they're in allowed list
      const newUser: User = {
        email: email.toLowerCase(),
        createdAt: Date.now(),
      };
      await redis.set(`user:${email.toLowerCase()}`, JSON.stringify(newUser));
      return { data: newUser, error: null };
    }

    const user = JSON.parse(userJson) as User;
    return { data: user, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

export async function updateUserVerificationCode(
  email: string,
  code: number,
  expiry: number
) {
  try {
    const userKey = `user:${email.toLowerCase()}`;
    const userJson = await redis.get(userKey);

    if (!userJson) {
      return { data: null, error: { message: "User not found" } };
    }

    const user = JSON.parse(userJson) as User;
    const updatedUser = {
      ...user,
      verificationCode: code.toString(),
      codeExpiry: expiry,
    };

    await redis.set(userKey, JSON.stringify(updatedUser));
    return { data: updatedUser, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

// Token management
export async function createToken(
  email: string
): Promise<{ token?: string; error?: string }> {
  try {
    const token = generateToken();
    const tokenData = { email: email.toLowerCase(), createdAt: Date.now() };
    await redis.set(`token:${token}`, JSON.stringify(tokenData));

    // Set expiry for token (24 hours)
    await redis.expire(`token:${token}`, 24 * 60 * 60);

    return { token };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function verifyToken(
  token: string
): Promise<{ email?: string; error?: string }> {
  try {
    const tokenJson = await redis.get(`token:${token}`);

    if (!tokenJson) {
      return { error: "Invalid or expired token" };
    }

    const tokenData = JSON.parse(tokenJson) as { email: string };
    return { email: tokenData.email };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// Voting
export async function updateUserVote(email: string, contestantId: string) {
  try {
    const userKey = `user:${email.toLowerCase()}`;
    const userJson = await redis.get(userKey);

    if (!userJson) {
      return { data: null, error: { message: "User not found" } };
    }

    const user = JSON.parse(userJson) as User;

    // Check if user already voted
    if (user.contestantVoted) {
      // Remove previous vote
      await redis.hincrby("vote_counts", user.contestantVoted, -1);
    }

    // Update user's vote
    const updatedUser = {
      ...user,
      contestantVoted: contestantId,
    };
    await redis.set(userKey, JSON.stringify(updatedUser));

    // Increment vote count for new contestant
    await redis.hincrby("vote_counts", contestantId, 1);

    return { data: updatedUser, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

export async function getVoteResults() {
  try {
    const voteCountsRaw = await redis.hgetall("vote_counts");
    // Convert string values to numbers
    const voteCounts: VoteCounts = {};
    for (const [key, value] of Object.entries(voteCountsRaw)) {
      voteCounts[key] = parseInt(value);
    }
    return { data: voteCounts, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

// Initialize function (for compatibility)
export async function initializeDatabase() {
  // With KV, no initialization needed
  // Allowed emails are checked dynamically
  return { success: true };
}
