import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectSlug = searchParams.get("subject");
    const topicSlug = searchParams.get("topic");
    const focus = searchParams.get("focus");
    const difficulty = searchParams.get("difficulty");
    const source = searchParams.get("source");

    const whereClause: Record<string, unknown> = {};

    if (subjectSlug) {
      whereClause.subject = { slug: subjectSlug };
    }

    if (topicSlug) {
      whereClause.topic = { slug: topicSlug };
    }

    if (difficulty) {
      whereClause.difficulty = difficulty.toUpperCase();
    }

    if (source) {
      whereClause.questionSource = source.toUpperCase();
    }

    if (focus && focus.trim().length > 0) {
      const search = focus.trim();
      whereClause.OR = [
        { title: { contains: search } },
        { factsIssue: { contains: search } },
      ];
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, slug: true } },
        topic: { select: { name: true, slug: true } },
        legalReferences: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error retrieving questions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve questions" },
      { status: 500 }
    );
  }
}
