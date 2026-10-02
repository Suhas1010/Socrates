import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email is already verified. You can sign in directly.",
      });
    }

    // Generate new 6-digit code with fresh 15-minute expiry
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const emailResult = await sendVerificationEmail(normalizedEmail, newCode, user.name);

    return NextResponse.json({
      success: true,
      message: emailResult.sent
        ? `A new verification code was sent to ${normalizedEmail}.`
        : "A new verification code was generated.",
      devCode: emailResult.devMode ? emailResult.code : undefined,
      previewUrl: emailResult.previewUrl,
      provider: emailResult.provider,
    });
  } catch (error: any) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend code. Please try again." },
      { status: 500 }
    );
  }
}
