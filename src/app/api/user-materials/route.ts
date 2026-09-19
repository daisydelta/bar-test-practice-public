import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const materials = await prisma.userMaterial.findMany({
      include: {
        questions: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ materials });
  } catch (error) {
    console.error("Error retrieving user materials:", error);
    return NextResponse.json(
      { error: "Failed to load user materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, materialType, subjectSlug, content } = body;

    if (!title || !materialType || !subjectSlug || !content) {
      return NextResponse.json(
        { error: "Title, materialType, subjectSlug, and content are required." },
        { status: 400 }
      );
    }

    const material = await prisma.userMaterial.create({
      data: {
        title,
        materialType,
        subjectSlug,
        content,
      },
    });

    return NextResponse.json({ material }, { status: 201 });
  } catch (error) {
    console.error("Error saving user material:", error);
    return NextResponse.json(
      { error: "Failed to save user material" },
      { status: 500 }
    );
  }
}
