import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getEvaluationService } from "@/lib/evaluation/evaluation-factory";
import { EvaluationRequest } from "@/lib/evaluation/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, studentAnswer, timeSpentSec = 0 } = body as EvaluationRequest;

    if (!questionId || !studentAnswer) {
      return NextResponse.json(
        { error: "Question ID and student answers are required." },
        { status: 400 }
      );
    }

    // 1. Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found." },
        { status: 404 }
      );
    }

    // 2. Persist the student submission
    const submission = await prisma.submission.create({
      data: {
        questionId,
        answerA: studentAnswer.answerA || "",
        legalBasisL: studentAnswer.legalBasisL || "",
        applicationA: studentAnswer.applicationA || "",
        conclusionC: studentAnswer.conclusionC || "",
        timeSpentSec: Number(timeSpentSec) || 0,
      },
    });

    // 3. Run evaluation through pluggable evaluation service
    const evaluationService = getEvaluationService();
    const evalResult = await evaluationService.evaluate({
      questionId,
      studentAnswer,
      timeSpentSec,
    });

    // 4. Save evaluation to database
    const savedEvaluation = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        overallScore: evalResult.overallScore,
        scoreA: evalResult.scores.answerScore,
        scoreL: evalResult.scores.legalBasisScore,
        scoreA2: evalResult.scores.applicationScore,
        scoreC: evalResult.scores.conclusionScore,
        whatWentWell: JSON.stringify(evalResult.whatWentWell),
        whatWasMissed: JSON.stringify(evalResult.whatWasMissed),
        legalErrors: JSON.stringify(evalResult.legalErrors),
        legalReasoningNotes: evalResult.legalReasoningNotes,
        howToImprove: JSON.stringify(evalResult.howToImprove),
        evaluatorMode: evalResult.evaluatorMode,
        verifiedRefsUsed: JSON.stringify(evalResult.verifiedLegalReferences),
      },
    });

    return NextResponse.json({
      submissionId: submission.id,
      evaluation: evalResult,
      dbEvaluationId: savedEvaluation.id,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
