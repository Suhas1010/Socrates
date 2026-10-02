import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);

    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
      await connectToDatabase();
      const user = await User.findById(authUser.userId);

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          savedProjects: user.savedProjects,
          pythonMasteredModules: user.pythonMasteredModules,
        },
      });
    } catch (dbError) {
      // If DB is temporarily unavailable, fall back to token payload
      return NextResponse.json({
        user: {
          id: authUser.userId,
          name: authUser.name,
          email: authUser.email,
          avatarColor: "#F59E0B",
          savedProjects: [],
          pythonMasteredModules: [],
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
