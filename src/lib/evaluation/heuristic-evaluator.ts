import { prisma } from "@/lib/db";
import { EvaluationRequest, EvaluationResult, IEvaluationService } from "./types";

export class HeuristicEvaluationService implements IEvaluationService {
  async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const { questionId, studentAnswer } = request;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        legalReferences: true,
      },
    });

    if (!question) {
      throw new Error(`Question with id ${questionId} not found`);
    }

    const ansA = (studentAnswer.answerA || "").trim();
    const legL = (studentAnswer.legalBasisL || "").trim();
    const appA = (studentAnswer.applicationA || "").trim();
    const conC = (studentAnswer.conclusionC || "").trim();

    const whatWentWell: string[] = [];
    const whatWasMissed: string[] = [];
    const legalErrors: string[] = [];
    const howToImprove: string[] = [];

    // --- 1. EVALUATE ANSWER (A) [Max 20 Points] ---
    let scoreA = 0;
    const categoricalPatterns = [
      /^(yes|no)[,.\s]/i,
      /^(the contention is|the petition should|the motion should|the assessment is)/i,
      /^(mario is|company x is|atty\.|pedro is)/i,
      /^(it is valid|it is invalid|it is meritorious|it is unmeritorious)/i,
    ];

    const isCategorical = categoricalPatterns.some((pattern) => pattern.test(ansA));
    const wordCountA = ansA ? ansA.split(/\s+/).length : 0;

    if (!ansA) {
      scoreA = 0;
      whatWasMissed.push("Answer (A): The opening answer field was left blank.");
      howToImprove.push("State your categorical answer immediately in the first sentence (e.g., 'Yes, ...' or 'No, ...').");
    } else if (isCategorical) {
      scoreA = 16;
      whatWentWell.push("Answer (A): Strong, categorical, and direct opening stance without waffling.");
      if (wordCountA >= 10 && wordCountA <= 60) {
        scoreA += 4; // Perfect 20
        whatWentWell.push("Answer (A): Concise framing of the initial conclusion within one to two sentences.");
      } else if (wordCountA > 60) {
        scoreA += 2;
        howToImprove.push("Answer (A): Keep your opening answer to 1-2 concise sentences. Save detailed legal arguments for the Legal Basis and Application sections.");
      }
    } else {
      scoreA = 10;
      legalErrors.push("Answer (A): Opening answer lacks a definitive, categorical stance. Avoid hesitant openings.");
      howToImprove.push("Begin with an unequivocal 'Yes' or 'No', followed by the primary legal proposition.");
    }

    // --- 2. EVALUATE LEGAL BASIS (L) [Max 35 Points] ---
    let scoreL = 0;
    const wordCountL = legL ? legL.split(/\s+/).length : 0;
    const lowerL = legL.toLowerCase();

    // Check against verified citations and doctrines from DB
    const verifiedRefs = question.legalReferences;
    let matchedRefsCount = 0;

    for (const ref of verifiedRefs) {
      const citationWords = ref.citation
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const foundKeyWord = citationWords.some((w) => lowerL.includes(w));
      if (foundKeyWord) {
        matchedRefsCount++;
      }
    }

    if (!legL) {
      scoreL = 0;
      whatWasMissed.push("Legal Basis (L): No governing statutory provision or Supreme Court jurisprudence was cited.");
      howToImprove.push("Identify and state the exact governing legal rule or statutory article (e.g. Civil Code, Revised Penal Code, or CPRA).");
    } else {
      // Base score for non-empty legal statement
      scoreL = 12;

      if (matchedRefsCount > 0) {
        scoreL += 15;
        whatWentWell.push(`Legal Basis (L): Accurately identified verified legal authorities relevant to ${question.title}.`);
      } else {
        whatWasMissed.push(`Legal Basis (L): Did not cite the specific canonical provisions (e.g., ${verifiedRefs.map((r) => r.citation).join(", ")}).`);
        howToImprove.push("Ground your legal basis in verified statutory provisions or leading jurisprudence rather than generic principles.");
      }

      if (wordCountL >= 25) {
        scoreL += 8;
        whatWentWell.push("Legal Basis (L): Thorough articulation of the legal rule and its operative elements.");
      } else {
        scoreL += 3;
        howToImprove.push("State the complete requisites or elements of the legal doctrine, not just its general name.");
      }
    }

    scoreL = Math.min(35, scoreL);

    // --- 3. EVALUATE APPLICATION (A) [Max 35 Points] ---
    let scoreA2 = 0;
    const wordCountA2 = appA ? appA.split(/\s+/).length : 0;
    const lowerA2 = appA.toLowerCase();

    // Factual subsumption cues
    const subsumptionPhrases = [
      "in this case",
      "here",
      "the facts show",
      "under the circumstances",
      "applying the rule",
      "because",
      "as a result",
      "since",
    ];
    const hasSubsumptionCue = subsumptionPhrases.some((p) => lowerA2.includes(p));

    if (!appA) {
      scoreA2 = 0;
      whatWasMissed.push("Application (A): No factual application provided.");
      howToImprove.push("Subsume the specific facts of the scenario under each element of the legal basis.");
    } else {
      scoreA2 = 12;

      if (hasSubsumptionCue) {
        scoreA2 += 10;
        whatWentWell.push("Application (A): Clear factual subsumption linking specific facts to the operative legal elements.");
      } else {
        howToImprove.push("Use clear transitional phrases (e.g., 'In this case, ...') to contrast the facts with the legal rule.");
      }

      if (wordCountA2 >= 40) {
        scoreA2 += 13;
        whatWentWell.push("Application (A): Detailed factual analysis showing why the conduct satisfies or fails the legal requisites.");
      } else if (wordCountA2 >= 20) {
        scoreA2 += 6;
        howToImprove.push("Deepen your factual analysis by showing how each specific character's action satisfies the statutory elements.");
      } else {
        scoreA2 += 2;
        legalErrors.push("Application (A): Application is too brief. Avoid merely restating the conclusion without analyzing the facts.");
      }
    }

    scoreA2 = Math.min(35, scoreA2);

    // --- 4. EVALUATE CONCLUSION (C) [Max 10 Points] ---
    let scoreC = 0;
    const wordCountC = conC ? conC.split(/\s+/).length : 0;
    const conclusionCues = [/^(therefore|hence|wherefore|accordingly|in conclusion|in view of the foregoing)[,.\s]/i];
    const hasConclusionCue = conclusionCues.some((regex) => regex.test(conC));

    if (!conC) {
      scoreC = 0;
      whatWasMissed.push("Conclusion (C): The conclusion field was left blank.");
      howToImprove.push("Conclude with a clean, single-sentence resolution of the ultimate issue.");
    } else if (hasConclusionCue) {
      scoreC = 8;
      whatWentWell.push("Conclusion (C): Logical final synthesis tying the application back to the ultimate disposition.");
      if (wordCountC >= 8 && wordCountC <= 45) {
        scoreC = 10;
      }
    } else {
      scoreC = 6;
      whatWentWell.push("Conclusion (C): Provided a concluding wrap-up.");
      howToImprove.push("Begin your conclusion with a formal transitional term (e.g., 'Therefore, ...' or 'Hence, ...').");
    }

    scoreC = Math.min(10, scoreC);

    const overallScore = Math.round(scoreA + scoreL + scoreA2 + scoreC);

    const legalReasoningNotes =
      overallScore >= 75
        ? "Sound syllogistic construction. The major premise (legal basis) and minor premise (factual subsumption) support the conclusion coherently."
        : overallScore >= 50
        ? "Developing legal reasoning. Ensure the legal basis explicitly states the requisites before attempting factual application."
        : "Incomplete legal reasoning. Focus on clearly separating the governing rule from the specific facts of the problem.";

    return {
      overallScore,
      scores: {
        answerScore: scoreA,
        legalBasisScore: scoreL,
        applicationScore: scoreA2,
        conclusionScore: scoreC,
      },
      whatWentWell,
      whatWasMissed,
      legalErrors,
      legalReasoningNotes,
      howToImprove,
      bestAnswer: {
        answerA: question.bestAnswerA || "",
        legalBasisL: question.bestAnswerL || "",
        applicationA: question.bestAnswerA2 || "",
        conclusionC: question.bestAnswerC || "",
      },
     howToAnswerGuidance: question.howToAnswer ?? "Use ALAC: Answer, Legal Basis, Application, and Conclusion.",
      verifiedLegalReferences: question.legalReferences.map((ref) => ({
        citation: ref.citation,
        officialTitle: ref.officialTitle,
        authorityType: ref.authorityType,
        doctrineSummary: ref.doctrineSummary,
        keyProvisionsText: ref.keyProvisionsText,
        verificationStatus: ref.verificationStatus,
      })),
      evaluatorMode: "HEURISTIC_OFFLINE",
    };
  }
}
