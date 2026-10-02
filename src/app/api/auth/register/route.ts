import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

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
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

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
