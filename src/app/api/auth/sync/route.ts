import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { pythonMasteredModules, currentProject } = body;

    await connectToDatabase();
    const user = await User.findById(authUser.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (Array.isArray(pythonMasteredModules)) {
      user.pythonMasteredModules = Array.from(
        new Set([...user.pythonMasteredModules, ...pythonMasteredModules])
      );
    }

    if (currentProject && currentProject.id && currentProject.goal) {
      const existingIdx = user.savedProjects.findIndex(
        (p) => p.id === currentProject.id
      );

      const projectData = {
        id: currentProject.id,
        goal: currentProject.goal,
        templateId: currentProject.templateId || "custom",
        masteryScore: currentProject.masteryScore || 0,
        totalConcepts: currentProject.totalConcepts || 0,
        masteredConcepts: currentProject.masteredConcepts || 0,
        lastUpdated: new Date(),
      };

      if (existingIdx >= 0) {
        user.savedProjects[existingIdx] = projectData;
      } else {
        user.savedProjects.push(projectData);
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        savedProjects: user.savedProjects,
        pythonMasteredModules: user.pythonMasteredModules,
      },
    });
  } catch (error: any) {
    console.error("Progress sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync progress" },
      { status: 500 }
    );
  }
}
