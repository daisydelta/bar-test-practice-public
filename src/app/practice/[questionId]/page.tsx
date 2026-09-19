import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft, BookOpen, Scale } from "lucide-react";
import { CitationBadge } from "@/components/legal/CitationBadge";
import { SourceBadge } from "@/components/legal/SourceBadge";
import { AlacWorkspaceClient } from "@/components/practice/AlacWorkspaceClient";

export const dynamic = "force-dynamic";

interface PracticeWorkspacePageProps {
  params: Promise<{
    questionId: string;
  }>;
  searchParams: Promise<{
    timer?: string;
  }>;
}

export default async function PracticeWorkspacePage({
  params,
  searchParams,
}: PracticeWorkspacePageProps) {
  const { questionId } = await params;
  const { timer } = await searchParams;
  const initialMinutes = timer ? parseInt(timer, 10) || 15 : 15;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      subject: true,
      topic: true,
      legalReferences: true,
    },
  });

  if (!question) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Practice Setup</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            BAR TEST PRACTICE
          </h1>
          <p className="text-xs text-slate-500">
            Philippine Bar Examination &amp; Law-School Practice
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SourceBadge source={question.questionSource} yearRef={question.barYearReference} />
          <CitationBadge status={question.verificationStatus} />
        </div>
      </div>

      {/* QUESTION Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
              QUESTION
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {question.subject.name} • {question.topic.name}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Difficulty: {question.difficulty}
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {question.title}
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
              <span>Fact Scenario &amp; Problem</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
              {question.factsIssue}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <Scale className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>
            Apply the ALAC structure: Answer categorical stance, Legal Basis, Application to facts, and Conclusion.
          </span>
        </div>
      </div>

      {/* YOUR ALAC ANSWER Workspace */}
      <div className="space-y-4">
        <AlacWorkspaceClient questionId={question.id} initialMinutes={initialMinutes} />
      </div>
    </div>
  );
}
