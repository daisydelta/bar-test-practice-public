
import { prisma } from "@/lib/db";
import {
  IEvaluationService,
  EvaluationRequest,
  EvaluationResult,
  VerifiedReferenceDisplay,
} from "./types";

function clamp(value: unknown, max: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(max, num));
}

function parseJsonResponse(content: string): Record<string, any> {
  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }

    throw new Error("The AI returned invalid JSON.");
  }
}

export class AIEvaluationService implements IEvaluationService {
  async evaluate(
    request: EvaluationRequest
  ): Promise<EvaluationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const baseUrl = "https://openrouter.ai/api/v1";
    const model =
      process.env.OPENROUTER_MODEL ||
      "google/gemini-2.5-flash";

    const question = await prisma.question.findUnique({
      where: { id: request.questionId },
      include: {
        subject: true,
        topic: true,
        legalReferences: true,
      },
    });

    if (!question) {
      throw new Error("Question not found.");
    }

    const verifiedReferences: VerifiedReferenceDisplay[] =
      question.legalReferences
        .filter(
          (ref) =>
            ref.verificationStatus.toUpperCase() === "VERIFIED"
        )
        .map((ref) => ({
          citation: ref.citation,
          officialTitle: ref.officialTitle,
          authorityType: ref.authorityType,
          doctrineSummary: ref.doctrineSummary,
          keyProvisionsText: ref.keyProvisionsText,
          verificationStatus: ref.verificationStatus,
        }));

    const referenceText = verifiedReferences.length
      ? verifiedReferences
          .map(
            (ref) =>
              `Citation: ${ref.citation}\n` +
              `Title: ${ref.officialTitle}\n` +
              `Authority type: ${ref.authorityType}\n` +
              `Doctrine: ${ref.doctrineSummary}\n` +
              `Key provisions: ${ref.keyProvisionsText || "Not supplied"}`
          )
          .join("\n\n")
      : "No legal references marked VERIFIED are attached to this question.";

    const bestAnswer = {
      answerA: question.bestAnswerA || "",
      legalBasisL: question.bestAnswerL || "",
      applicationA: question.bestAnswerA2 || "",
      conclusionC: question.bestAnswerC || "",
    };

    const systemPrompt = `
You are a rigorous Philippine Bar Examination practice evaluator.

Evaluate the student's answer using the following educational ALAC rubric:
- Answer: maximum 20 points
- Legal Basis: maximum 35 points
- Application: maximum 35 points
- Conclusion: maximum 10 points

LEGAL ACCURACY REQUIREMENTS:
1. Apply Philippine law to the question.
2. Prioritize the supplied legal references marked VERIFIED.
3. Do not invent laws, case names, citations, quotations, or legal provisions.
4. Do not label an authority verified unless it appears in the supplied verified references.
5. If no verified authority is supplied, clearly identify any legal point that requires independent verification.
6. Assess whether the student's legal rule supports the answer and whether the facts are properly applied to that rule.
7. Award partial credit where justified.
8. Do not award full legal-basis credit merely for naming a law or case without stating the relevant rule.
9. Keep feedback specific and useful for Bar review.
10. Return valid JSON only. No Markdown fences or text outside the JSON.

Return exactly this JSON structure:
{
  "scores": {
    "answerScore": 0,
    "legalBasisScore": 0,
    "applicationScore": 0,
    "conclusionScore": 0
  },
  "whatWentWell": [],
  "whatWasMissed": [],
  "legalErrors": [],
  "legalReasoningNotes": "",
  "howToImprove": [],
  "bestAnswer": {
    "answerA": "",
    "legalBasisL": "",
    "applicationA": "",
    "conclusionC": ""
  },
  "howToAnswerGuidance": ""
}

Score limits:
- answerScore: 0 to 20
- legalBasisScore: 0 to 35
- applicationScore: 0 to 35
- conclusionScore: 0 to 10

The bestAnswer must provide a model ALAC answer grounded in the question and available legal materials. Do not invent citations.
`;

    const userPrompt = `
QUESTION TITLE:
${question.title}

QUESTION FACTS AND ISSUE:
${question.factsIssue}

SUBJECT:
${question.subject.name}

TOPIC:
${question.topic.name}

QUESTION'S LEGAL PROVISION:
${question.legalProvision || "Not supplied"}

RELATED JURISPRUDENCE:
${question.relatedJurisprudence || "Not supplied"}

VERIFIED LEGAL REFERENCES:
${referenceText}

EXISTING MODEL ALAC ANSWER:
A — Answer: ${bestAnswer.answerA || "Not supplied"}
L — Legal Basis: ${bestAnswer.legalBasisL || "Not supplied"}
A — Application: ${bestAnswer.applicationA || "Not supplied"}
C — Conclusion: ${bestAnswer.conclusionC || "Not supplied"}

EXISTING ANSWER GUIDANCE:
${question.howToAnswer || "Not supplied"}

STUDENT'S ALAC ANSWER:
A — Answer:
${request.studentAnswer.answerA || ""}

L — Legal Basis:
${request.studentAnswer.legalBasisL || ""}

A — Application:
${request.studentAnswer.applicationA || ""}

C — Conclusion:
${request.studentAnswer.conclusionC || ""}

Evaluate each component independently. Use only the specified score limits.
Return only the required JSON object.
`;

    const response = await fetch(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ||
            "https://bar-test-practice-public.vercel.app",
          "X-Title": "Bar Test Practice",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1800,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          `OpenRouter request failed (${response.status}).`
      );
    }

    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string" || !content.trim()) {
      throw new Error("OpenRouter returned an empty evaluation.");
    }

    const result = parseJsonResponse(content);
    const rawScores = result.scores || {};

    const answerScore = clamp(rawScores.answerScore, 20);
    const legalBasisScore = clamp(rawScores.legalBasisScore, 35);
    const applicationScore = clamp(rawScores.applicationScore, 35);
    const conclusionScore = clamp(rawScores.conclusionScore, 10);

    const returnedBestAnswer = result.bestAnswer || {};

    return {
      overallScore:
        answerScore +
        legalBasisScore +
        applicationScore +
        conclusionScore,

      scores: {
        answerScore,
        legalBasisScore,
        applicationScore,
        conclusionScore,
      },

      whatWentWell: Array.isArray(result.whatWentWell)
        ? result.whatWentWell.filter(
            (item: unknown): item is string =>
              typeof item === "string"
          )
        : [],

      whatWasMissed: Array.isArray(result.whatWasMissed)
        ? result.whatWasMissed.filter(
            (item: unknown): item is string =>
              typeof item === "string"
          )
        : [],

      legalErrors: Array.isArray(result.legalErrors)
        ? result.legalErrors.filter(
            (item: unknown): item is string =>
              typeof item === "string"
          )
        : [],

      legalReasoningNotes:
        typeof result.legalReasoningNotes === "string"
          ? result.legalReasoningNotes
          : "",

      howToImprove: Array.isArray(result.howToImprove)
        ? result.howToImprove.filter(
            (item: unknown): item is string =>
              typeof item === "string"
          )
        : [],

      bestAnswer: {
        answerA:
          typeof returnedBestAnswer.answerA === "string"
            ? returnedBestAnswer.answerA
            : bestAnswer.answerA,
        legalBasisL:
          typeof returnedBestAnswer.legalBasisL === "string"
            ? returnedBestAnswer.legalBasisL
            : bestAnswer.legalBasisL,
        applicationA:
          typeof returnedBestAnswer.applicationA === "string"
            ? returnedBestAnswer.applicationA
            : bestAnswer.applicationA,
        conclusionC:
          typeof returnedBestAnswer.conclusionC === "string"
            ? returnedBestAnswer.conclusionC
            : bestAnswer.conclusionC,
      },

      howToAnswerGuidance:
        typeof result.howToAnswerGuidance === "string"
          ? result.howToAnswerGuidance
          : question.howToAnswer || "",

      verifiedLegalReferences: verifiedReferences,
      evaluatorMode: "AI_GROUNDED",
    };
  }
}