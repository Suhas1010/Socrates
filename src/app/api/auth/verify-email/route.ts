import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || typeof email !== "string" || !code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Please provide both your email address and 6-digit verification code" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+verificationCode +verificationCodeExpires"
    );

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please register first." },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      // Already verified, log them in directly
      const token = signToken({
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
      });

      const res = NextResponse.json({
        success: true,
        message: "Email is already verified.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          savedProjects: user.savedProjects,
          pythonMasteredModules: user.pythonMasteredModules,
        },
      });

      setAuthCookie(res, token);
      return res;
    }

    // Check code match
    if (!user.verificationCode || user.verificationCode !== cleanCode) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email and enter the 6-digit code." },
        { status: 400 }
      );
    }

    // Check expiry
    if (user.verificationCodeExpires && new Date() > user.verificationCodeExpires) {
      return NextResponse.json(
        { error: "This verification code has expired. Please click 'Resend Code' to receive a new one." },
        { status: 400 }
      );
    }

    // Mark as verified and clear code
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to Socrates.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        savedProjects: user.savedProjects,
        pythonMasteredModules: user.pythonMasteredModules,
      },
    });

    setAuthCookie(res, token);
    return res;
  } catch (error: any) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
