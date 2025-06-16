import { NextRequest, NextResponse } from "next/server";
import {
  getUserByEmail,
  updateUserVerificationCode,
  createToken,
} from "@/lib/supabase-database";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user from database - matches Python logic exactly
    const { data: user, error: userError } = await getUserByEmail(email);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Email not allowed" },
        { status: 403 }
      );
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
          return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
          );
        }

        return NextResponse.json({ token }, { status: 200 });
      } else {
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
        { message: "Verification code re-sent" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Access route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
