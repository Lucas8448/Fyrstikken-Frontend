import { supabase } from "./supabase";
import { generateToken } from "./email";

export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc(
      "create_users_table_if_not_exists"
    );
    if (usersError && !usersError.message.includes("already exists")) {
      console.error("Error creating users table:", usersError);
    }

    // Create tokens table if it doesn't exist
    const { error: tokensError } = await supabase.rpc(
      "create_tokens_table_if_not_exists"
    );
    if (tokensError && !tokensError.message.includes("already exists")) {
      console.error("Error creating tokens table:", tokensError);
    }

    // Initialize allowed emails from environment variable
    const allowedEmails = process.env.ALLOWED_MAILS?.split(",") || [];
    for (const email of allowedEmails) {
      if (email.trim()) {
        await supabase
          .from("users")
          .upsert({ email: email.trim() }, { onConflict: "email" });
      }
    }
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  return { data, error };
}

export async function updateUserVerificationCode(
  email: string,
  code: number,
  expiry: number
) {
  const { data, error } = await supabase
    .from("users")
    .update({
      verification_code: code.toString(),
      code_expiry: expiry,
    })
    .eq("email", email)
    .select();

  return { data, error };
}

export async function createToken(
  email: string
): Promise<{ token?: string; error?: string }> {
  try {
    const token = generateToken();
    const { error } = await supabase.from("tokens").insert({ token, email });

    if (error) {
      return { error: error.message };
    }

    return { token };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function verifyToken(
  token: string
): Promise<{ email?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("tokens")
      .select("email")
      .eq("token", token)
      .single();

    if (error || !data) {
      return { error: "Invalid token" };
    }

    return { email: data.email };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateUserVote(email: string, contestantId: number) {
  const { data, error } = await supabase
    .from("users")
    .update({ contestant_voted: contestantId })
    .eq("email", email)
    .select();

  return { data, error };
}

export async function getVoteResults() {
  const { data, error } = await supabase
    .from("users")
    .select("contestant_voted")
    .not("contestant_voted", "is", null);

  if (error) {
    return { data: null, error };
  }

  // Count votes
  const voteCounts: { [key: string]: number } = {};
  data.forEach((user) => {
    if (user.contestant_voted !== null) {
      const contestantId = user.contestant_voted.toString();
      voteCounts[contestantId] = (voteCounts[contestantId] || 0) + 1;
    }
  });

  return { data: voteCounts, error: null };
}
