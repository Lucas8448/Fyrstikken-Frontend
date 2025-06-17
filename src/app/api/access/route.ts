import { NextRequest, NextResponse } from "next/server";
import {
  updateUserVerificationCode,
  createToken,
  createUserIfAllowed,
} from "@/lib/supabase-database";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

function logAccessError(context: {
  error: unknown;
  req: NextRequest;
  body?: any;
  userError?: any;
  user?: any;
  stage?: string;
}) {
  const { error, req, body, userError, user, stage } = context;
  const logObj = {
    stage,
    error,
    userError,
    user,
    body,
    ip: req.headers.get("x-forwarded-for") || req.ip || null,
    userAgent: req.headers.get("user-agent") || null,
    time: new Date().toISOString(),
  };
  // Avoid logging sensitive info
  if (logObj.body && logObj.body.code) logObj.body.code = "[REDACTED]";
  if (logObj.user && logObj.user.verification_code) logObj.user.verification_code = "[REDACTED]";
  console.error("[ACCESS API ERROR]", JSON.stringify(logObj, null, 2));
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    const { email, code } = body;

    if (!email) {
      logAccessError({ error: "Missing email", req, body, stage: "validate input" });
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user from database or create if allowed
    const { data: user, error: userError } = await createUserIfAllowed(email);

    if (userError || !user) {
      logAccessError({ error: "Email not allowed", req, body, userError, user, stage: "createUserIfAllowed" });
      return NextResponse.json({ error: "Email not allowed" }, { status: 403 });
    }

    if (code) {
      // Verify the code - matches Python logic exactly
      const currentTime = Math.floor(Date.now() / 1000);

      if (
        user.verification_code === code.toString() &&
        user.code_expiry &&
        currentTime < user.code_expiry
      ) {
        // Generate and return token
        const { token, error: tokenError } = await createToken(email);

        if (tokenError) {
          logAccessError({ error: tokenError, req, body, user, stage: "createToken" });
          return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
          );
        }

        return NextResponse.json({ token }, { status: 200 });
      } else {
        logAccessError({ error: "Invalid or expired code", req, body, user, stage: "verify code" });
        return NextResponse.json(
          { error: "Invalid or expired code" },
          { status: 401 }
        );
      }
    } else {
      // Generate new verification code - matches Python logic exactly
      const verificationCode = generateVerificationCode();
      const expiry = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now

      const { error: updateError } = await updateUserVerificationCode(
        email,
        verificationCode,
        expiry
      );

      if (updateError) {
        logAccessError({ error: updateError, req, body, user, stage: "updateUserVerificationCode" });
        return NextResponse.json(
          { error: "Failed to update verification code" },
          { status: 500 }
        );
      }

      const emailResult = await sendVerificationEmail(email, verificationCode);

      if (!emailResult.success) {
        logAccessError({ error: emailResult.error, req, body, user, stage: "sendVerificationEmail" });
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Verification code re-sent" },
        { status: 200 }
      );
    }
  } catch (error) {
    logAccessError({ error, req, body, stage: "catch" });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
