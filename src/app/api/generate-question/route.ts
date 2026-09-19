import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Generate question request:", body);

    const subjectSlug = String(
      body.subject ||
        body.subjectSlug ||
        body.selectedSubject ||
        ""
    ).trim();

    const focus = String(body.focus || "").trim();

    const topicSlug = body.topic
      ? String(body.topic).trim()
      : "";

    const difficulty = String(
      body.difficulty || "MEDIUM"
    ).trim();

    if (!subjectSlug) {
      return NextResponse.json(
        {
          error: "Please select a Bar subject.",
          received: body,
        },
        { status: 400 }
      );
    }

    if (!focus) {
      return NextResponse.json(
        {
          error: "Please enter a topic or focus.",
        },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findUnique({
      where: {
        slug: subjectSlug,
      },
      include: {
        topics: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        {
          error: "Selected subject was not found.",
          subjectReceived: subjectSlug,
        },
        { status: 404 }
      );
    }

    let topic = null;

    if (topicSlug) {
      topic = subject.topics.find(
        (item) => item.slug === topicSlug
      );
    }

    if (!topic && subject.topics.length > 0) {
      topic = subject.topics[0];
    }

    if (!topic) {
      return NextResponse.json(
        {
          error:
            "No topic is available for the selected subject.",
        },
        { status: 400 }
      );
    }

    // Use only a small number of verified references
    // to keep the AI request fast and reliable.
    const verifiedReferences =
      await prisma.legalReference.findMany({
        where: {
          verificationStatus: "VERIFIED",
          topicId: topic.id,
        },
        take: 5,
      });

    let referenceText =
      "No verified legal references are available.";

    if (verifiedReferences.length > 0) {
      referenceText = verifiedReferences
        .map((ref) => {
          return `- ${ref.citation} — ${ref.officialTitle}`;
        })
        .join("\n");
    }

    // Keep the prompt intentionally short for Qwen7B.
    const prompt = `
Create one Philippine Bar Examination essay question.

Subject: ${subject.name}
Topic: ${topic.name}
Focus: ${focus}
Difficulty: ${difficulty}

Verified legal authorities:
${referenceText}

Rules:
- Use Philippine law only.
- Use only the verified authorities listed above.
- Do not invent cases, citations, statutes, constitutional provisions, or doctrines.
- Create realistic facts and one clear legal issue.
- Make it answerable using ALAC.
- Return JSON only.

Return exactly:
{
  "title": "Short title",
  "factsIssue": "Facts followed by the legal question",
  "difficulty": "${difficulty}",
  "recommendedAnswer": {
    "answerA": "Direct answer",
    "legalBasisL": "Legal basis",
    "applicationA": "Application to the facts",
    "conclusionC": "Short conclusion"
  },
  "howToAnswer": "Brief Bar exam answering approach"
}
`;

    const omniRouteBaseUrl =
      process.env.OMNIROUTE_BASE_URL ||
      "http://localhost:20128/v1";

    const omniRouteApiKey =
      process.env.OMNIROUTE_API_KEY;

    if (!omniRouteApiKey) {
      return NextResponse.json(
        {
          error:
            "OMNIROUTE_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const omniResponse = await fetch(
      `${omniRouteBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${omniRouteApiKey}`,
        },
        body: JSON.stringify({
          model: "free-ai/qwen7b",
          messages: [
            {
              role: "system",
              content:
                "You are a Philippine Bar Examination question writer. Return valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 700,
        }),
      }
    );

    if (!omniResponse.ok) {
      const errorText =
        await omniResponse.text();

      console.error(
        "OmniRoute error:",
        errorText
      );

      return NextResponse.json(
        {
          error: "OmniRoute request failed.",
          details: errorText,
        },
        { status: 502 }
      );
    }

    const omniData =
      await omniResponse.json();

    const content =
      omniData?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error:
            "The AI model returned an empty response.",
        },
        { status: 502 }
      );
    }

    let generated;

    try {
      generated =
        typeof content === "string"
          ? JSON.parse(content)
          : content;
    } catch {
      console.error(
        "Invalid JSON from model:",
        content
      );

      return NextResponse.json(
        {
          error:
            "The AI model returned invalid JSON.",
          raw: content,
        },
        { status: 502 }
      );
    }

    if (
      !generated.title ||
      !generated.factsIssue ||
      !generated.recommendedAnswer
    ) {
      return NextResponse.json(
        {
          error:
            "The generated question is missing required fields.",
          generated,
        },
        { status: 502 }
      );
    }

    const question =
      await prisma.question.create({
        data: {
          subjectId: subject.id,
          topicId: topic.id,
          title: String(generated.title),
          factsIssue: String(
            generated.factsIssue
          ),
          difficulty: difficulty,
          questionSource: "AI_GENERATED",
          verificationStatus: "NEEDS_REVIEW",

          bestAnswerA: String(
            generated.recommendedAnswer
              .answerA || ""
          ),

          bestAnswerL: String(
            generated.recommendedAnswer
              .legalBasisL || ""
          ),

          bestAnswerA2: String(
            generated.recommendedAnswer
              .applicationA || ""
          ),

          bestAnswerC: String(
            generated.recommendedAnswer
              .conclusionC || ""
          ),

          howToAnswer: String(
            generated.howToAnswer || ""
          ),

          legalReferences: {
            create: verifiedReferences.map(
              (ref) => ({
                legalReferenceId: ref.id,
              })
            ),
          },
        },
      });

    return NextResponse.json({
      success: true,
      question,
      verificationStatus:
        "NEEDS_REVIEW",
      message:
        "Question generated successfully.",
    });
  } catch (error) {
    console.error(
      "Generate question error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while generating the question.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}