
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

function isValidGeneratedQuestion(value: any): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (
    typeof value.title !== "string" ||
    !value.title.trim()
  ) {
    return false;
  }

  if (
    typeof value.factsIssue !== "string" ||
    !value.factsIssue.trim()
  ) {
    return false;
  }

  if (
    !value.recommendedAnswer ||
    typeof value.recommendedAnswer !== "object"
  ) {
    return false;
  }

  if (
    typeof value.recommendedAnswer.answerA !== "string" ||
    !value.recommendedAnswer.answerA.trim()
  ) {
    return false;
  }

  if (
    typeof value.recommendedAnswer.legalBasisL !== "string" ||
    !value.recommendedAnswer.legalBasisL.trim()
  ) {
    return false;
  }

  if (
    typeof value.recommendedAnswer.applicationA !== "string" ||
    !value.recommendedAnswer.applicationA.trim()
  ) {
    return false;
  }

  if (
    typeof value.recommendedAnswer.conclusionC !== "string" ||
    !value.recommendedAnswer.conclusionC.trim()
  ) {
    return false;
  }

  return true;
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
- Do not invent an exception simply to create an interesting answer.
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

    const apiKey = process.env.OMNIROUTE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OMNIROUTE_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.OMNIROUTE_BASE_URL ||
      "http://localhost:20128/v1";

    /*
     * Primary model comes from Vercel environment variables.
     *
     * If the primary model returns a provider error such as 503,
     * automatically try the fallback models instead of retrying
     * the same unavailable model.
     */
    const primaryModel =
      process.env.OMNIROUTE_MODEL ||
      "gemini-3-flash-preview";

    const fallbackModels = [
      primaryModel,
      "gemini/gemini-3-flash-preview",
      "gemini/gemini-2.5-flash",
    ].filter(
      (value, index, array) =>
        value &&
        array.indexOf(value) === index
    );

    let generated: any = null;
    let lastErrorText = "";
    let lastModel = primaryModel;

    for (const model of fallbackModels) {
      if (generated) {
        break;
      }

      console.log(
        "Trying AI model:",
        model
      );

      try {
        const aiResponse = await fetch(
          `${baseUrl}/chat/completions`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },

            body: JSON.stringify({
              model,

              messages: [
                {
                  role: "system",
                  content:
                    "You are a Philippine Bar Examination question writer. Return valid JSON only. Keep the question legally coherent, accurate, and concise.",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],

              temperature: 0.2,
              max_tokens: 4000,
            }),
          }
        );

        if (!aiResponse.ok) {
          const errorText =
            await aiResponse.text();

          lastModel = model;
          lastErrorText = errorText;

          console.error(
            "AI model failed:",
            {
              model,
              status: aiResponse.status,
              statusText:
                aiResponse.statusText,
              response: errorText,
            }
          );

          /*
           * Try the next model rather than retrying
           * the same unavailable model.
           */
          continue;
        }

        const aiData =
          await aiResponse.json();

        console.log(
          "AI response received:",
          {
            model,
            status: aiResponse.status,
            finishReason:
              aiData?.choices?.[0]
                ?.finish_reason,
          }
        );

        const content =
          aiData?.choices?.[0]?.message
            ?.content;

        if (!content) {
          lastModel = model;
          lastErrorText =
            "The AI model returned an empty response.";

          console.error(
            "Empty AI response:",
            {
              model,
              response: aiData,
            }
          );

          continue;
        }

        try {
          const parsed =
            parseJsonResponse(
              String(content)
            );

          if (
            isValidGeneratedQuestion(
              parsed
            )
          ) {
            generated = parsed;

            console.log(
              "Valid question generated:",
              {
                model,
              }
            );

            break;
          }

          lastModel = model;
          lastErrorText =
            "The generated question is missing required fields.";

          console.error(
            "Generated question failed validation:",
            {
              model,
              generated: parsed,
            }
          );
        } catch (error) {
          lastModel = model;
          lastErrorText =
            "The AI model returned incomplete or invalid JSON.";

          console.error(
            "Invalid JSON from model:",
            {
              model,
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
              content,
            }
          );
        }
      } catch (error) {
        lastModel = model;
        lastErrorText =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          "AI request error:",
          {
            model,
            error: lastErrorText,
          }
        );

        /*
         * Continue to the next available model.
         */
        continue;
      }
    }

    if (!generated) {
      return NextResponse.json(
        {
          error:
            "The AI models could not generate a valid question.",

          details: lastErrorText,

          model: lastModel,

          attemptedModels:
            fallbackModels,

          hint:
            "Check the OmniRoute logs for the attempted models.",
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
            connect:
              verifiedReferences.map(
                (ref) => ({
                  id: ref.id,
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
