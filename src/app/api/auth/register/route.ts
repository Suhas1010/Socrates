import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Please provide a valid name" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("+verificationCode +verificationCodeExpires");

    // Generate random 6-digit numeric OTP code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    const hashedPassword = await hashPassword(password);

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return NextResponse.json(
          { error: "An account with this email address already exists. Please sign in." },
          { status: 409 }
        );
      }

      // If user started registration previously but hadn't verified email, update code & details
      existingUser.name = name.trim();
      existingUser.password = hashedPassword;
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpires = verificationExpires;
      await existingUser.save();
    } else {
      // Create new user awaiting verification
      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isEmailVerified: false,
        verificationCode,
        verificationCodeExpires: verificationExpires,
      });
    }

    // Send verification email directly to user's email
    const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode, name.trim());

    return NextResponse.json({
      success: true,
      needsVerification: true,
      email: normalizedEmail,
      message: emailResult.sent
        ? `Verification code sent to ${normalizedEmail}.`
        : "Verification code generated.",
      devCode: emailResult.devMode ? emailResult.code : undefined,
      previewUrl: emailResult.previewUrl,
      provider: emailResult.provider,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Friendly error message if database is not configured
    if (error.message?.includes("MONGODB_URI")) {
      return NextResponse.json(
        {
          error:
            "MongoDB connection is not configured. Please add MONGODB_URI to your environment variables.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
