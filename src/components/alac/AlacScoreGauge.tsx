import React from "react";
import { Award, CheckCircle2, TrendingUp } from "lucide-react";

interface AlacScoreGaugeProps {
  overallScore: number;
  scores: {
    answerScore: number;      // max 20
    legalBasisScore: number;  // max 35
    applicationScore: number; // max 35
    conclusionScore: number;  // max 10
  };
  evaluatorMode?: string;
}

export function AlacScoreGauge({
  overallScore,
  scores,
  evaluatorMode = "HEURISTIC_OFFLINE",
}: AlacScoreGaugeProps) {
  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "bg-emerald-500 text-emerald-700";
    if (ratio >= 0.6) return "bg-blue-500 text-blue-700";
    if (ratio >= 0.4) return "bg-amber-500 text-amber-700";
    return "bg-red-500 text-red-700";
  };

  const getOverallGrade = (score: number) => {
    if (score >= 90) return { label: "Excellent (Bar Passing)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 75) return { label: "Satisfactory (Passing)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    if (score >= 60) return { label: "Developing (Needs Focus)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Requires Substantial Revision", color: "text-red-700 bg-red-50 border-red-200" };
  };

  const grade = getOverallGrade(overallScore);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-700 uppercase bg-indigo-50 px-2.5 py-1 rounded-md">
            Bar Test Practice ALAC Rubric
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            Evaluation Scorecard
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated under educational 20 / 35 / 35 / 10 rubric
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
              {overallScore}
              <span className="text-lg text-slate-400 font-normal"> / 100</span>
            </div>
            <div className={`text-xs font-semibold px-2 py-0.5 mt-1 rounded-full border ${grade.color} inline-block`}>
              {grade.label}
            </div>
          </div>
        </div>
      </div>

      {/* Component Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* A — Answer */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">A — Answer</span>
            <span className="font-mono font-bold text-slate-900">
              {scores.answerScore} <span className="text-slate-400 font-normal">/ 20</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getScoreColor(scores.answerScore, 20)}`}
              style={{ width: `${(scores.answerScore / 20) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500">Categorical opening stance</div>
        </div>

        {/* L — Legal Basis */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">L — Legal Basis</span>
            <span className="font-mono font-bold text-slate-900">
              {scores.legalBasisScore} <span className="text-slate-400 font-normal">/ 35</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getScoreColor(scores.legalBasisScore, 35)}`}
              style={{ width: `${(scores.legalBasisScore / 35) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500">Statutory / doctrinal grounding</div>
        </div>

        {/* A — Application */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">A — Application</span>
            <span className="font-mono font-bold text-slate-900">
              {scores.applicationScore} <span className="text-slate-400 font-normal">/ 35</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getScoreColor(scores.applicationScore, 35)}`}
              style={{ width: `${(scores.applicationScore / 35) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500">Factual subsumption</div>
        </div>

        {/* C — Conclusion */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">C — Conclusion</span>
            <span className="font-mono font-bold text-slate-900">
              {scores.conclusionScore} <span className="text-slate-400 font-normal">/ 10</span>
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getScoreColor(scores.conclusionScore, 10)}`}
              style={{ width: `${(scores.conclusionScore / 10) * 100}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500">Synthesis &amp; ultimate relief</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          Evaluator Mode:{" "}
          <strong className="text-slate-700">
            {evaluatorMode === "HEURISTIC_OFFLINE" ? "Heuristic / Rule-Based (Offline)" : "Gemini Grounded AI"}
          </strong>
        </span>
        <span className="text-[11px] text-slate-400">
          Not an official Supreme Court or Bar Examiners assessment
        </span>
      </div>
    </div>
  );
}
