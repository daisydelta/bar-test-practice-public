import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  RotateCcw,
  History,
  ShieldCheck,
} from "lucide-react";
import { AlacScoreGauge } from "@/components/alac/AlacScoreGauge";
import { BestAnswerComparison } from "@/components/alac/BestAnswerComparison";
import { HowToAnswerCard } from "@/components/alac/HowToAnswerCard";
import { CitationBadge } from "@/components/legal/CitationBadge";
import { SourceBadge } from "@/components/legal/SourceBadge";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { submissionId } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      question: {
        include: {
          subject: true,
          topic: true,
          legalReferences: true,
        },
      },
      evaluation: true,
    },
  });

  if (!submission || !submission.evaluation) {
    notFound();
  }

  const { question, evaluation } = submission;

  // Parse JSON diagnostic arrays
  const whatWentWell: string[] = JSON.parse(evaluation.whatWentWell || "[]");
  const whatWasMissed: string[] = JSON.parse(evaluation.whatWasMissed || "[]");
  const legalErrors: string[] = JSON.parse(evaluation.legalErrors || "[]");
  const howToImprove: string[] = JSON.parse(evaluation.howToImprove || "[]");

  const studentAnswer = {
    answerA: submission.answerA,
    legalBasisL: submission.legalBasisL,
    applicationA: submission.applicationA,
    conclusionC: submission.conclusionC,
  };

  const bestAnswer = {
    answerA: question.bestAnswerA || "",
    legalBasisL: question.bestAnswerL || "",
    applicationA: question.bestAnswerA2 || "",
    conclusionC: question.bestAnswerC || "",
  };

  const scores = {
    answerScore: evaluation.scoreA,
    legalBasisScore: evaluation.scoreL,
    applicationScore: evaluation.scoreA2,
    conclusionScore: evaluation.scoreC,
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/practice/${question.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Prompt</span>
        </Link>
        <div className="flex items-center gap-2">
          <SourceBadge source={question.questionSource} yearRef={question.barYearReference} />
          <CitationBadge status={question.verificationStatus} />
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
            {question.subject.name}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            • {question.topic.name}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review &amp; Diagnostic Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Evaluated question: <strong>{question.title}</strong>
        </p>
      </div>

      {/* 1. Scorecard Gauge */}
      <AlacScoreGauge
        overallScore={evaluation.overallScore}
        scores={scores}
        evaluatorMode={evaluation.evaluatorMode}
      />

      {/* 2. Qualitative Feedback Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What You Did Well */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>What You Did Well</span>
          </div>
          {whatWentWell.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No specific strengths noted.</p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {whatWentWell.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* What Was Missed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>What Was Missed</span>
          </div>
          {whatWasMissed.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No major statutory or factual elements omitted.</p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {whatWasMissed.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Legal Errors & Discrepancies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Legal Errors &amp; Fallacies</span>
          </div>
          {legalErrors.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No legal doctrinal errors detected.</p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {legalErrors.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Concrete Steps to Improve */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span>How to Improve</span>
          </div>
          {howToImprove.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Continue practicing under timed conditions.</p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-700">
              {howToImprove.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Legal Reasoning Feedback */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Legal Syllogism &amp; Reasoning Critique
        </h3>
        <p className="text-xs text-slate-800 leading-relaxed">
          {evaluation.legalReasoningNotes}
        </p>
      </div>

      {/* 3. Side-by-Side Model Best Answer Comparison */}
      <BestAnswerComparison studentAnswer={studentAnswer} bestAnswer={bestAnswer} />

      {/* 4. How to Answer Guidance */}
      <HowToAnswerCard guidance={question.howToAnswer ?? "Use ALAC: Answer, Legal Basis, Application, and Conclusion."} />

      {/* 5. Verified Legal References Used */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Verified Legal References Grounding This Question</span>
          </div>
          <span className="text-xs text-slate-500">
            {question.legalReferences.length} Canonical Authority Entries
          </span>
        </div>

        <div className="space-y-4">
          {question.legalReferences.map((ref) => (
            <div
              key={ref.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-xs text-slate-900 font-mono">
                  {ref.citation}
                </div>
                <CitationBadge status={ref.verificationStatus} />
              </div>
              <div className="text-xs font-medium text-slate-700">
                {ref.officialTitle}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Doctrine:</strong> {ref.doctrineSummary}
              </p>
              {ref.keyProvisionsText && (
                <div className="text-[11px] text-slate-700 bg-white border border-slate-200 p-3 rounded-lg font-serif italic">
                  &ldquo;{ref.keyProvisionsText}&rdquo;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <Link
          href={`/practice/${question.id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Practice This Question Again</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>View All History</span>
          </Link>
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Practice Another Question</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
