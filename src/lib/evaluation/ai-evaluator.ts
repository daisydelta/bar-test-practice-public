import { prisma } from "@/lib/db";
import {
  EvaluationRequest,
  EvaluationResult,
  IEvaluationService,
  VerifiedReferenceDisplay,
} from "./types";

function clamp(value: unknown, min: number, max: number): number {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return min;
  }

  return Math.max(min, Math.min(max, n));
}

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

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export class AIEvaluationService implements IEvaluationService {
  async evaluate(
    request: EvaluationRequest
  ): Promise<EvaluationResult> {
    const { questionId, studentAnswer } = request;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        subject: true,
        topic: true,
        legalReferences: true,
      },
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const apiKey = process.env.OMNIROUTE_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OMNIROUTE_API_KEY is not configured."
      );
    }

    const baseUrl =
      process.env.OMNIROUTE_BASE_URL ||
      "http://localhost:20128/v1";

    const model =
      process.env.OMNIROUTE_MODEL ||
      "no-think/zenmux/anthropic/claude-sonnet-4.6";

    const verifiedReferences = question.legalReferences
      .filter((ref) => ref.verificationStatus === "VERIFIED")
      .map((ref) => ({
        citation: ref.citation,
        officialTitle: ref.officialTitle,
        authorityType: ref.authorityType,
        keyProvisionsText: ref.keyProvisionsText,
        doctrineSummary: ref.doctrineSummary,
      }));

    const referenceAnswer = {
      answerA: question.bestAnswerA || "",
      legalBasisL: question.bestAnswerL || "",
      applicationA: question.bestAnswerA2 || "",
      conclusionC: question.bestAnswerC || "",
    };

    const prompt = `
You are evaluating a Philippine Bar Examination ALAC answer.

Use Philippine law only.

Score the student's answer based on:
- Answer: 20 points
- Legal Basis: 35 points
- Application: 35 points
- Conclusion: 10 points

Evaluate legal correctness, not writing length.

Do not invent cases, statutes, constitutional provisions, doctrines, or citations.

QUESTION:
${question.factsIssue}

VERIFIED LEGAL REFERENCES:
${JSON.stringify(verifiedReferences)}

MODEL ANSWER:
${JSON.stringify(referenceAnswer)}

STUDENT ANSWER:

ANSWER:
${studentAnswer.answerA || "(blank)"}

LEGAL BASIS:
${studentAnswer.legalBasisL || "(blank)"}

APPLICATION:
${studentAnswer.applicationA || "(blank)"}

CONCLUSION:
${studentAnswer.conclusionC || "(blank)"}

Return ONLY this JSON object:

{
  "answerScore": 0,
  "legalBasisScore": 0,
  "applicationScore": 0,
  "conclusionScore": 0,
  "feedback": "",
  "legalErrors": []
}

Rules:
- answerScore must be 0-20.
- legalBasisScore must be 0-35.
- applicationScore must be 0-35.
- conclusionScore must be 0-10.
- feedback must be brief.
- legalErrors must contain only substantive legal errors.
- Do not invent citations.
- Do not use markdown.
`;

    const response = await fetch(
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
                "Return only valid JSON. You are a Philippine Bar Examination evaluator.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 350,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
          "OmniRoute request failed."
      );
    }

    const text =
      data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error(
        "AI provider returned an empty evaluation."
      );
    }

    const parsed = parseJsonResponse(text);

    const scoreA = clamp(
      parsed?.answerScore,
      0,
      20
    );

    const scoreL = clamp(
      parsed?.legalBasisScore,
      0,
      35
    );

    const scoreA2 = clamp(
      parsed?.applicationScore,
      0,
      35
    );

    const scoreC = clamp(
      parsed?.conclusionScore,
      0,
      10
    );

    const overallScore = Math.round(
      scoreA +
        scoreL +
        scoreA2 +
        scoreC
    );

    const verifiedLegalReferences: VerifiedReferenceDisplay[] =
      question.legalReferences.map((ref) => ({
        citation: ref.citation,
        officialTitle: ref.officialTitle,
        authorityType: ref.authorityType,
        doctrineSummary: ref.doctrineSummary,
        keyProvisionsText: ref.keyProvisionsText,
        verificationStatus: ref.verificationStatus,
      }));

    const generatedReferenceAnswer = {
      answerA: question.bestAnswerA || "",
      legalBasisL: question.bestAnswerL || "",
      applicationA: question.bestAnswerA2 || "",
      conclusionC: question.bestAnswerC || "",
    };

    return {
      overallScore,

      scores: {
        answerScore: scoreA,
        legalBasisScore: scoreL,
        applicationScore: scoreA2,
        conclusionScore: scoreC,
      },

      whatWentWell: [],

      whatWasMissed: [],

      legalErrors: stringArray(
        parsed?.legalErrors
      ),

      legalReasoningNotes:
        String(parsed?.feedback || "").trim() ||
        "The answer was evaluated against the supplied legal authorities and factual issues.",

      howToImprove: [],

      bestAnswer: generatedReferenceAnswer,

      howToAnswerGuidance:
        question.howToAnswer || "",

      verifiedLegalReferences,

      evaluatorMode: "AI_GROUNDED",
    };
  }
}