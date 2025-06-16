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

  if (!sender || !password) {
    return {
      success: false,
      error: "Email credentials not configured",
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

    try {
      htmlContent = fs.readFileSync(templatePath, "utf-8");
      htmlContent = htmlContent.replace("{code}", code.toString());
    } catch (fileError) {
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

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
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
