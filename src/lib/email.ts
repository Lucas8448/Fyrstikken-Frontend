import nodemailer from "nodemailer";
import crypto from "crypto";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function generateVerificationCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export function generateToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export async function sendVerificationEmail(
  email: string,
  code: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create HTML email template (inline since we don't have the assets folder)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h1 style="color: #333333; text-align: center;">Verification Code</h1>
          <p style="color: #666666; font-size: 16px; line-height: 1.5;">
            Your verification code is:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;">${code}</span>
          </div>
          <p style="color: #666666; font-size: 14px; line-height: 1.5;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Your Verification Code",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
