/**
 * Evaluation Interfaces for Bar Test Practice
 *
 * Scoring Rubric: "Bar Test Practice ALAC Rubric"
 * - Answer (A): 20%
 * - Legal Basis (L): 35%
 * - Application (A): 35%
 * - Conclusion (C): 10%
 * Total: 100%
 *
 * Note: This rubric is an educational practice standard for law students
 * and reviewees. It is NOT an official Supreme Court of the Philippines
 * formula or official Bar Examiners' rubric.
 */

export interface StudentAlacAnswer {
  answerA: string;      // A — Direct, categorical answer
  legalBasisL: string;  // L — Statutory provision, rule, or doctrine
  applicationA: string; // A — Subsumption of facts under legal elements
  conclusionC: string;  // C — Concluding synthesis and relief
}

export interface EvaluationRequest {
  questionId: string;
  studentAnswer: StudentAlacAnswer;
  timeSpentSec?: number;
}

export interface VerifiedReferenceDisplay {
  citation: string;
  officialTitle: string;
  authorityType: string;
  doctrineSummary: string;
  keyProvisionsText?: string | null;
  verificationStatus: string;
}

export interface EvaluationResult {
  overallScore: number; // 0 - 100
  scores: {
    answerScore: number;      // Max 20
    legalBasisScore: number;  // Max 35
    applicationScore: number; // Max 35
    conclusionScore: number;  // Max 10
  };
  whatWentWell: string[];
  whatWasMissed: string[];
  legalErrors: string[];
  legalReasoningNotes: string;
  howToImprove: string[];
  bestAnswer: {
    answerA: string;
    legalBasisL: string;
    applicationA: string;
    conclusionC: string;
  };
  howToAnswerGuidance: string;
  verifiedLegalReferences: VerifiedReferenceDisplay[];
  evaluatorMode: "HEURISTIC_OFFLINE" | "AI_GROUNDED";
}

/**
 * Pluggable Evaluation Service Interface
 * Allows offline heuristic evaluation initially, and future connection
 * to Google Gemini API or other providers without modifying the UI layer.
 */
export interface IEvaluationService {
  evaluate(request: EvaluationRequest): Promise<EvaluationResult>;
}
