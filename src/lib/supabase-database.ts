import { createClient } from "@supabase/supabase-js";
import { generateToken } from "./email";

// Lazy Supabase client initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Types
interface User {
  id?: number;
  email: string;
  verification_code?: string;
  code_expiry?: number;
  contestant_voted?: string;
  created_at?: string;
}

interface Token {
  token: string;
  email: string;
  created_at?: string;
}

interface VoteCounts {
  [projectId: string]: number;
}

// Helper function to check if email is allowed
function isEmailAllowed(email: string): boolean {
  const allowedEmails = process.env.ALLOWED_MAILS;
  if (!allowedEmails) {
    console.error("ALLOWED_MAILS environment variable not set");
    return false;
  }

  const emailList = allowedEmails.split(",").map((e) => e.trim().toLowerCase());
  return emailList.includes(email.toLowerCase());
}

// User management
export async function getUserByEmail(email: string) {
  try {
    const { data: existingUser, error: fetchError } = await getSupabaseClient()
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found
      return { data: null, error: { message: fetchError.message } };
    }

    if (!existingUser) {
      return { data: null, error: { message: "User not found" } };
    }

    return { data: existingUser, error: null };
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
    const { data, error } = await getSupabaseClient()
      .from("users")
      .update({
        verification_code: code.toString(),
        code_expiry: expiry,
      })
      .eq("email", email.toLowerCase())
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return { data, error: null };
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

    const { error } = await getSupabaseClient()
      .from("tokens")
      .insert([{ token, email: email.toLowerCase() }]);

    if (error) {
      return { error: error.message };
    }

    return { token };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export async function verifyToken(
  token: string
): Promise<{ email?: string; error?: string }> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("tokens")
      .select("email, created_at")
      .eq("token", token)
      .single();

    if (error) {
      return { error: "Invalid token" };
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = new Date(data.created_at);
    const now = new Date();
    const hoursDiff =
      (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      // Clean up expired token
      await getSupabaseClient().from("tokens").delete().eq("token", token);
      return { error: "Token expired" };
    }

    return { email: data.email };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// Voting
export async function updateUserVote(email: string, contestantId: string) {
  try {
    // First, get the current user to check previous vote
    const { error: fetchError } = await getSupabaseClient()
      .from("users")
      .select("contestant_voted")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError) {
      return { data: null, error: { message: fetchError.message } };
    }

    // Update user's vote
    const { data: updatedUser, error: updateError } = await getSupabaseClient()
      .from("users")
      .update({ contestant_voted: contestantId })
      .eq("email", email.toLowerCase())
      .select()
      .single();

    if (updateError) {
      return { data: null, error: { message: updateError.message } };
    }

    return { data: updatedUser, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

export async function getVoteResults() {
  try {
    const { data: users, error } = await getSupabaseClient()
      .from("users")
      .select("contestant_voted")
      .not("contestant_voted", "is", null);

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    // Count votes for each contestant
    const voteCounts: VoteCounts = {};
    users.forEach((user) => {
      if (user.contestant_voted) {
        voteCounts[user.contestant_voted] =
          (voteCounts[user.contestant_voted] || 0) + 1;
      }
    });

    return { data: voteCounts, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}

// Initialize function (creates tables if they don't exist)
export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to select from them
    await getSupabaseClient().from("users").select("id").limit(1);
    await getSupabaseClient().from("tokens").select("token").limit(1);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Clean up expired tokens (utility function)
export async function cleanupExpiredTokens() {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    await getSupabaseClient()
      .from("tokens")
      .delete()
      .lt("created_at", twentyFourHoursAgo.toISOString());

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Create user if email is allowed
export async function createUserIfAllowed(email: string) {
  try {
    // Check if email is allowed
    if (!isEmailAllowed(email)) {
      return { data: null, error: { message: "Email not allowed" } };
    }

    // Check if user already exists
    const { data: existingUser } = await getUserByEmail(email);
    if (existingUser) {
      return { data: existingUser, error: null };
    }

    // Create new user
    const { data: newUser, error: createError } = await getSupabaseClient()
      .from("users")
      .insert([{ email: email.toLowerCase() }])
      .select()
      .single();

    if (createError) {
      return { data: null, error: { message: createError.message } };
    }

    return { data: newUser, error: null };
  } catch (error) {
    return { data: null, error: { message: (error as Error).message } };
  }
}
