import nodemailer from "nodemailer";

export interface SendEmailResult {
  success: boolean;
  sent: boolean;
  devMode?: boolean;
  code?: string;
  error?: string;
}

export async function sendVerificationEmail(
  toEmail: string,
  code: string,
  userName: string
): Promise<SendEmailResult> {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpFrom = process.env.SMTP_FROM || `"Socrates AI Tutor" <${smtpUser || "noreply@socrates.ai"}>`;

  // Dev mode fallback when SMTP credentials are not yet configured in .env.local
  if (!smtpUser || !smtpPass) {
    console.log(`\n======================================================`);
    console.log(`📧 [Socrates Email Verification] (Dev Mode - No SMTP Configured)`);
    console.log(`To: ${toEmail} (${userName})`);
    console.log(`Verification Code: ${code}`);
    console.log(`Expires in: 15 minutes`);
    console.log(`To send real emails to inboxes, add SMTP_USER & SMTP_PASS to .env.local`);
    console.log(`======================================================\n`);

    return {
      success: true,
      sent: false,
      devMode: true,
      code,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Socrates AI account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070A10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E4E4E7;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070A10; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #0D121F; border: 1px solid #27272A; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; text-align: center; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 14px; color: #F59E0B; font-size: 24px; font-weight: bold;">
                ✦
              </div>
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 14px 0 4px 0; letter-spacing: -0.5px;">Socrates</h1>
              <p style="color: #A1A1AA; font-size: 13px; font-weight: 500; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Project-First AI Tutor</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="color: #D4D4D8; font-size: 15px; line-height: 24px; padding-bottom: 24px;">
              <p style="margin: 0 0 12px 0;">Hi <strong>${userName}</strong>,</p>
              <p style="margin: 0;">Welcome to Socrates! Please verify your email address to activate your account and start building AI projects directly in your browser.</p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding: 10px 0 28px 0;">
              <div style="background-color: #070A10; border: 1px solid #3F3F46; border-radius: 16px; padding: 20px 24px; display: inline-block;">
                <div style="color: #A1A1AA; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 8px;">Your 6-Digit Verification Code</div>
                <div style="font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #F59E0B;">
                  ${code}
                </div>
              </div>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="color: #71717A; font-size: 13px; line-height: 20px; text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272A;">
              This code will expire in <strong>15 minutes</strong>.<br>If you did not request this verification, you can safely ignore this email.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 20px; text-align: center; color: #52525B; font-size: 12px;">
              Socrates AI Tutor · Learn AI by building real projects
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: `${code} is your Socrates verification code`,
      text: `Hi ${userName},\n\nYour Socrates verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nHappy Learning,\nSocrates AI Tutor`,
      html: htmlContent,
    });

    console.log(`📧 [Socrates Email Verification] Real email successfully delivered to ${toEmail}`);
    return { success: true, sent: true };
  } catch (error: any) {
    console.error("Failed to send verification email via SMTP:", error);
    return {
      success: false,
      sent: false,
      error: error.message || "Failed to deliver email via SMTP",
    };
  }
}
