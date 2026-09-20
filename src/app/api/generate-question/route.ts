import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseJsonResponse(text: string): any {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

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

    const verifiedReferences =
      await prisma.legalReference.findMany({
        where: {
          verificationStatus: "VERIFIED",
          topicId: topic.id,
        },
        take: 3,
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

    const prompt = `
Create ONE Philippine Bar Examination essay question.

Subject: ${subject.name}
Topic: ${topic.name}
Focus: ${focus}
Difficulty: ${difficulty}

Verified legal authorities:
${referenceText}

PRIMARY OBJECTIVE:

The question must test the selected Subject, Topic, and Focus.

The examinee must be able to determine the answer by applying the
specific legal doctrine identified by the Topic and Focus to the facts.

Do NOT create a question where an unrelated legal issue becomes necessary
to determine the answer.

QUESTION COHERENCE RULES:

1. The selected Topic and Focus must be the principal legal issue.

2. Every important fact must be relevant to resolving that issue.

3. Do not introduce a secondary legal issue that could independently
change the answer unless the question expressly asks the examinee
to resolve that issue.

4. Do not make the examinee guess which doctrine the examiner wants.

5. Do not create a fact pattern where two different legal doctrines can
reasonably produce different answers unless the question expressly
requires the examinee to analyze both.

6. If a fact introduces an exception, defense, constitutional issue,
statutory limitation, or another competing legal rule that could
materially affect the result, either:
- make that issue part of the express question and provide the
necessary verified authority; OR
- remove or revise that fact.

7. The question must have one principal, legally defensible answer.

8. The recommended answer must answer the question actually asked.
Do not answer a different legal question.

9. Do not create a question merely because the facts sound realistic.
Legal coherence is more important than dramatic facts.

10. Avoid unnecessary emergency, medical, moral, constitutional,
criminal, contractual, or procedural facts when they are unrelated
to the selected Topic and Focus.

LEGAL ACCURACY RULES:

- Use Philippine law only.
- Use only the verified legal authorities listed above.
- Do not invent cases, statutes, constitutional provisions, rules,
doctrines, citations, or legal exceptions.
- Do not invent a real-looking Republic Act number or case citation.
- Do not attribute a hypothetical rule to an actual Philippine law.
- If a hypothetical statutory provision is necessary, clearly identify
it as hypothetical.
- Do not rely on an authority that is not included in the verified
references.
- Do not invent an exception simply to create a more interesting answer.
- Do not ignore an applicable exception that is actually established
by the supplied authorities.

STATUTORY CONSTRUCTION RULES:

If the selected Topic or Focus concerns statutory construction:

- Identify the specific rule of statutory construction being tested.
- Construct facts that allow that rule to be applied directly.
- If the statute is clear and unambiguous and the question concerns
verba legis, the facts should allow the examinee to apply the plain
meaning of the text without requiring an unrelated legal defense.
- Do not assume that every clear statute automatically settles every
question of criminal liability, constitutionality, or legal validity.
- If constitutionality is intended to be tested, expressly make
constitutionality part of the question.
- If criminal liability or a criminal-law defense is intended to be
tested, expressly make that issue part of the question.
- Do not combine verba legis with an unrelated defense merely to make
the question difficult.

SPECIAL QUESTION-DESIGN RULE:

When the Focus identifies a specific doctrine, build the question
around a direct conflict involving that doctrine.

For example, if the Focus is VERBA LEGIS:

- Use a clear statutory provision.
- Give the examinee a party's proposed interpretation of that provision.
- Ask whether that interpretation is correct under verba legis.
- Do NOT introduce an emergency, necessity defense, criminal liability,
constitutional challenge, or other independent issue unless that issue
is expressly part of the question.
- The answer must turn primarily on the meaning of the statutory text.

If the Focus is another statutory-construction doctrine, structure the
facts so that doctrine is directly necessary to resolve the question.

Do not use dramatic facts merely to make the question realistic.

LEGAL DEFENSIBILITY CHECK:

Before producing the final question, internally check:

A. What exact doctrine is being tested?
B. What is the single principal legal issue?
C. What facts are legally relevant to that issue?
D. Does any fact introduce another legal rule that could change the answer?
E. If yes, is that secondary rule intentionally being tested?
F. Can the recommended answer be supported by the verified authorities?
G. Does the recommended answer directly resolve the question asked?
H. Is there only one principal legally defensible answer?

If the answer to D is YES and E is NO, revise the facts before returning
the question.

RECOMMENDED ANSWER:

The recommended answer must contain:

- Answer: the direct answer to the principal legal issue.
- Legal Basis: the controlling rule, doctrine, statute, constitutional
provision, or jurisprudence supported by the verified authorities.
- Application: application of that rule to the facts given.
- Conclusion: the resulting legal consequence.

Do not choose an answer merely because it follows the literal wording
of a statute.

Do not choose an answer merely because it produces a sympathetic result.

Choose the answer that follows from the controlling legal rule and the
facts presented.

BAR EXAM STYLE:

- Realistic Philippine Bar Examination style.
- Concise but sufficiently detailed facts.
- ONE principal legal issue.
- Clear question.
- No unnecessary facts.
- Difficulty: ${difficulty}.
- The question should test legal reasoning, not keyword matching.

OUTPUT RULES:

- Return JSON only.
- No markdown.
- No commentary outside the JSON.
- Ensure valid JSON.
- Use double quotes for JSON strings.
- Escape quotation marks inside JSON strings.
- Do not include trailing text after the JSON.

Return exactly:

{
  "title": "Short descriptive title",
  "factsIssue": "Concise factual scenario followed by the specific legal question",
  "difficulty": "${difficulty}",
  "recommendedAnswer": {
    "answerA": "Direct answer to the principal legal issue",
    "legalBasisL": "Controlling legal basis",
    "applicationA": "Application of the controlling rule to the facts",
    "conclusionC": "Short final conclusion"
  },
  "howToAnswer": "One short Bar exam answering approach"
}
`;

    const isVercel = process.env.VERCEL === "1";

    const apiKey = isVercel
      ? process.env.GEMINI_API_KEY
      : process.env.OMNIROUTE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: isVercel
            ? "GEMINI_API_KEY is not configured."
            : "OMNIROUTE_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const baseUrl = isVercel
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
      : process.env.OMNIROUTE_BASE_URL ||
        "http://localhost:20128/v1";

    const model = isVercel
      ? "gemini-2.5-flash"
      : "free-ai/qwen7b";

    let generated: any = null;
    let lastErrorText = "";

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(
          `AI generation attempt ${attempt}/2`,
          {
            provider: isVercel
              ? "OpenRouter"
              : "OmniRoute",
            model,
          }
        );

        const aiResponse = await fetch(
          baseUrl,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(isVercel
                ? { "x-goog-api-key": apiKey }
                : { Authorization: `Bearer ${apiKey}` }),
            },
            body: JSON.stringify(
              isVercel
                ? {
                    systemInstruction: {
                      parts: [
                        {
                          text:
                            "You are a Philippine Bar Examination question writer. Return valid JSON only. Keep the question legally coherent and concise.",
                        },
                      ],
                    },
                    contents: [
                      {
                        role: "user",
                        parts: [{ text: prompt }],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.2,
                      maxOutputTokens: 1000,
                      responseMimeType: "application/json",
                    },
                  }
                : {
                    model,
                    messages: [
                      {
                        role: "system",
                        content:
                          "You are a Philippine Bar Examination question writer. Return valid JSON only. Keep the question legally coherent and concise.",
                      },
                      {
                        role: "user",
                        content: prompt,
                      },
                    ],
                    temperature: 0.2,
                    max_tokens: 500,
                  }
            ),
          }
        );

        if (!aiResponse.ok) {
          lastErrorText =
            await aiResponse.text();

          console.error(
            `AI generation attempt ${attempt} failed:`,
            lastErrorText
          );

          if (attempt < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000)
            );
          }

          continue;
        }

        const aiData =
          await aiResponse.json();

        const content = isVercel
          ? aiData?.candidates?.[0]?.content?.parts
              ?.map((part: any) => part?.text || "")
              .join("")
          : aiData?.choices?.[0]?.message?.content;

        if (!content) {
          lastErrorText =
            "The AI model returned an empty response.";

          if (attempt < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000)
            );
          }

          continue;
        }

        try {
          generated =
            parseJsonResponse(
              String(content)
            );
        } catch (error) {
          lastErrorText =
            "The AI model returned incomplete or invalid JSON.";

          console.error(
            "Invalid JSON from model:",
            content
          );

          if (attempt < 2) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000)
            );
          }

          continue;
        }

        if (
          generated?.title &&
          generated?.factsIssue &&
          generated?.recommendedAnswer
        ) {
          break;
        }

        generated = null;

        lastErrorText =
          "The generated question is missing required fields.";

        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      } catch (error) {
        lastErrorText =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          `AI generation attempt ${attempt} error:`,
          lastErrorText
        );

        if (attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000)
          );
        }
      }
    }

    if (!generated) {
      return NextResponse.json(
        {
          error:
            "The AI model could not generate a valid question after retry.",
          details: lastErrorText,
          diagnostic: isVercel
            ? "Gemini production generation failed. The details field contains the API response."
            : undefined,
        },
        { status: 502 }
      );
    }

    const question =
      await prisma.question.create({
        data: {
          subjectId: subject.id,
          topicId: topic.id,

          title: String(
            generated.title
          ),

          factsIssue: String(
            generated.factsIssue
          ),

          difficulty,

          questionSource: "AI_GENERATED",

          verificationStatus:
            "NEEDS_REVIEW",

          bestAnswerA: String(
            generated.recommendedAnswer
              ?.answerA || ""
          ),

          bestAnswerL: String(
            generated.recommendedAnswer
              ?.legalBasisL || ""
          ),

          bestAnswerA2: String(
            generated.recommendedAnswer
              ?.applicationA || ""
          ),

          bestAnswerC: String(
            generated.recommendedAnswer
              ?.conclusionC || ""
          ),

          howToAnswer: String(
            generated.howToAnswer || ""
          ),

          legalReferences: {
            connect: verifiedReferences.map((ref) => ({
              id: ref.id,
            })),
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