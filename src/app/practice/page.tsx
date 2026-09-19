import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { CitationBadge } from "@/components/legal/CitationBadge";
import { SourceBadge } from "@/components/legal/SourceBadge";
import GenerateQuestionForm from "@/components/practice/GenerateQuestionForm";

export const dynamic = "force-dynamic";

interface PracticePageProps {
  searchParams: Promise<{
    subject?: string;
    topic?: string;
    focus?: string;
    difficulty?: string;
  }>;
}

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const params = await searchParams;
  const currentSubjectSlug = params.subject;
  const currentTopicSlug = params.topic;
  const currentFocus = params.focus;
  const currentDifficulty = params.difficulty;

  // Load all 9 subjects for the filter pills
  const subjects = await prisma.subject.findMany({
    include: {
      topics: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const selectedSubject = subjects.find((s) => s.slug === currentSubjectSlug);

  // Build filter query for questions
  const whereClause: Record<string, unknown> = {};

  if (currentSubjectSlug) {
    whereClause.subject = { slug: currentSubjectSlug };
  }

  if (currentTopicSlug) {
    whereClause.topic = { slug: currentTopicSlug };
  }

  if (currentDifficulty) {
    whereClause.difficulty = currentDifficulty.toUpperCase();
  }

  if (currentFocus && currentFocus.trim().length > 0) {
    const search = currentFocus.trim();
    whereClause.OR = [
      { title: { contains: search } },
      { factsIssue: { contains: search } },
    ];
  }

  const questions = await prisma.question.findMany({
    where: whereClause,
    include: {
      subject: true,
      topic: true,
      legalReferences: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-indigo-600" />
          Essay Practice Setup
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Select a Bar subject, pick a syllabus topic, or enter a custom focus to start an ALAC practice session.
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Step 1: Select Subject */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. Select Philippine Bar Subject
          </label>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/practice"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                !currentSubjectSlug
                  ? "bg-indigo-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All 9 Subjects
            </Link>
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/practice?subject=${s.slug}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentSubjectSlug === s.slug
                    ? "bg-indigo-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Step 2: Select Topic OR Enter Custom Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Specific Syllabus Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2A. Specific Syllabus Topic
            </label>
            {selectedSubject ? (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                <Link
                  href={`/practice?subject=${selectedSubject.slug}`}
                  className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    !currentTopicSlug ? "bg-indigo-100 text-indigo-900 font-semibold" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  All Topics in {selectedSubject.name}
                </Link>
                {selectedSubject.topics.map((t) => (
                  <Link
                    key={t.id}
                    href={`/practice?subject=${selectedSubject.slug}&topic=${t.slug}`}
                    className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      currentTopicSlug === t.slug
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                Select a specific subject above to explore its syllabus topics.
              </div>
            )}
          </div>

          {/* Custom Focus / AI Question Generation */}
<div className="space-y-2">
  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
    2B. Custom Topic or Keyword Focus
  </label>

  <p className="text-xs text-slate-500 leading-relaxed">
    Enter a specific topic, doctrine, legal concept, or keyword.
    Gemini will generate a Bar-style essay question for ALAC practice.
  </p>

  <GenerateQuestionForm
    subjectSlug={currentSubjectSlug}
    topicSlug={currentTopicSlug}
    subjects={subjects}
  />
</div>
        </div>
      </div>

      {/* Available Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Available Essay Questions ({questions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Showing verified practice prompts
          </span>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No questions found matching this filter</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing your search query or selecting a different subject to explore available essay problems.
            </p>
            <Link
              href="/practice"
              className="inline-block px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {q.subject.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {q.topic?.name || "Custom Focus"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceBadge source={q.questionSource} yearRef={q.barYearReference} />
                    <CitationBadge status={q.verificationStatus} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {q.factsIssue}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Recommended: 15 mins
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      ALAC Format (4 Fields)
                    </span>
                  </div>

                  <Link
                    href={`/practice/${q.id}?timer=15`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-xs self-start sm:self-auto"
                  >
                    <span>Start ALAC Practice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
