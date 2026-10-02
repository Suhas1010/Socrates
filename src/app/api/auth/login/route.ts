import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide both email and password" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.isEmailVerified === false) {
      return NextResponse.json(
        {
          error: "Your email address is not verified yet. Please enter the verification code sent to your email.",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    const res = NextResponse.json({
      success: true,
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
    console.error("Login error:", error);

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
      { error: error.message || "Failed to sign in. Please try again." },
      { status: 500 }
    );
  }
}
