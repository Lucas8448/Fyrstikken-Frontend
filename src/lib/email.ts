import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function generateVerificationCode(): number {
  // Matches Python: random.randint(100000, 999999)
  return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}

export function generateToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export async function sendVerificationEmail(
  email: string,
  code: number
): Promise<{ success: boolean; error?: string }> {
  const sender = process.env.EMAIL_SENDER;
  const password = process.env.EMAIL_PASSWORD;

  console.log("Email configuration check:", {
    hasSender: !!sender,
    hasPassword: !!password,
    sender: sender ? sender.substring(0, 3) + "***" : "undefined",
  });

  if (!sender || !password) {
    return {
      success: false,
      error:
        "Email credentials not configured - check EMAIL_SENDER and EMAIL_PASSWORD",
    };
  }

  try {
    // Read email template - matches Python logic exactly
    const templatePath = path.join(
      process.cwd(),
      "assets",
      "email_template.html"
    );
    let htmlContent: string;

    console.log("Reading email template from:", templatePath);

    try {
      htmlContent = fs.readFileSync(templatePath, "utf-8");
      htmlContent = htmlContent.replace("{code}", code.toString());
      console.log("Email template loaded successfully");
    } catch (fileError) {
      console.error("Error reading email template:", fileError);
      return {
        success: false,
        error: `Error reading email template: ${fileError}`,
      };
    }

    const mailOptions = {
      from: sender,
      to: email,
      subject: "Your Verification Code",
      html: htmlContent,
    };

    console.log("Attempting to send email to:", email);
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to send email: ${errorMessage}`,
    };
  }
}
