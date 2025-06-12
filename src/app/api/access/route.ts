import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  updateUserVerificationCode,
  createToken,
} from "@/lib/database";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

async function handleCodeVerification(email: string, code: string, user: any) {
  const currentTime = Math.floor(Date.now() / 1000);

  if (
    user.verification_code !== code.toString() ||
    !user.code_expiry ||
    currentTime >= user.code_expiry
  ) {
    return NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 401 }
    );
  }

  const { token, error: tokenError } = await createToken(email);

  if (tokenError) {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }

  return NextResponse.json({ token }, { status: 200 });
}

async function handleCodeGeneration(email: string) {
  const verificationCode = generateVerificationCode();
  const expiry = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now

  const { error: updateError } = await updateUserVerificationCode(
    email,
    verificationCode,
    expiry
  );

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update verification code" },
      { status: 500 }
    );
  }

  const emailResult = await sendVerificationEmail(email, verificationCode);

  if (!emailResult.success) {
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Verification code sent" },
    { status: 200 }
  );
}

async function ensureUserExists(email: string) {
  const { data: user, error: userError } = await getUserByEmail(email);

  if (!userError && user) {
    return { user, error: null };
  }

  // Try to add user if they're in allowed emails
  const allowedEmails = process.env.ALLOWED_MAILS?.split(",") || [];
  const isAllowed = allowedEmails.some(
    (allowedEmail) => allowedEmail.trim().toLowerCase() === email.toLowerCase()
  );

  if (!isAllowed) {
    return {
      user: null,
      error: `Email not in allowed list. Allowed: ${allowedEmails.join(", ")}`,
    };
  }

  // Add user to database
  const { supabase } = await import("@/lib/supabase");
  const { error: insertError } = await supabase
    .from("users")
    .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });

  if (insertError) {
    return { user: null, error: `Failed to add user: ${insertError.message}` };
  }

  // Retrieve the user again
  const { data: newUser, error: newUserError } = await getUserByEmail(email);
  return { user: newUser, error: newUserError?.message || null };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { user, error: userError } = await ensureUserExists(email);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Email not allowed",
          debug: userError,
        },
        { status: 403 }
      );
    }

    if (code) {
      return await handleCodeVerification(email, code, user);
    } else {
      return await handleCodeGeneration(email);
    }
  } catch (error) {
    console.error("Access route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
