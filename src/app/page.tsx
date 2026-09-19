import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Scale,
  Gavel,
  Landmark,
  BriefcaseBusiness,
  FileText,
  Calculator,
  Shield,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import GenerateQuestionForm from "@/components/practice/GenerateQuestionForm";
import { SourceBadge } from "@/components/legal/SourceBadge";
import { CitationBadge } from "@/components/legal/CitationBadge";

export const dynamic = "force-dynamic";

const subjectIcons = [
  Scale,
  Landmark,
  BookOpen,
  BriefcaseBusiness,
  Gavel,
  GraduationCap,
  Calculator,
  FileText,
  Shield,
];

const subjectDescriptions: Record<string, string> = {
  "Political Law":
    "Constitutional law, public officers, administrative law, local government, and related public law principles.",
  "Constitutional Law":
    "Constitutional rights, judicial review, separation of powers, due process, and constitutional doctrines.",
  "Civil Law":
    "Persons, family relations, obligations, contracts, property, succession, and other civil law matters.",
  "Commercial Law":
    "Corporations, partnerships, negotiable instruments, insurance, banking, and other commercial law topics.",
  "Criminal Law":
    "The Revised Penal Code, special penal laws, criminal liability, and related jurisprudence.",
  "Labor Law":
    "Labor standards, labor relations, employment, termination, benefits, and social legislation.",
  Taxation:
    "National and local taxation, tax remedies, constitutional limitations, and taxation jurisprudence.",
  "Remedial Law":
    "Civil procedure, criminal procedure, evidence, special proceedings, and other remedial law topics.",
  "Basic Legal & Judicial Ethics":
    "CPRA, professional responsibility, judicial ethics, lawyer discipline, and ethical duties.",
};

export default async function HomePage() {
  const subjects = await prisma.subject.findMany({
    include: {
      topics: {
        orderBy: { name: "asc" },
      },
      questions: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  const questions = await prisma.question.findMany({
    include: {
      subject: true,
      topic: true,
      legalReferences: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.20),_transparent_40%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">
              <Scale className="h-4 w-4" />
              Philippine Bar Examination Practice
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              BAR TEST
              <span className="block text-indigo-400">PRACTICE</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Practice Philippine Bar Examination essay questions using the
              ALAC method. Answer legal problems, identify the governing law,
              apply it to the facts, and reach a clear conclusion.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#subjects"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-500"
              >
                Choose a Subject
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#practice"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4" />
                Generate Question
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ALAC BAR */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {[
            ["A", "ANSWER", "Directly answer the legal issue."],
            ["L", "LEGAL BASIS", "State the applicable law or doctrine."],
            ["A", "APPLICATION", "Apply the law to the given facts."],
            ["C", "CONCLUSION", "Give a clear and definite conclusion."],
          ].map(([letter, title, description], index) => (
  <div key={`${letter}-${index}`} className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg font-extrabold text-indigo-700">
                  {letter}
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section id="subjects" className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Bar Examination Subjects
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Choose Your Subject
          </h2>

          <p className="mt-4 text-slate-600">
            Select a subject to practice questions based on its available
            topics and jurisprudence.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, index) => {
            const Icon = subjectIcons[index % subjectIcons.length];

            return (
              <Link
                key={subject.id}
                href={`/practice?subject=${encodeURIComponent(subject.slug)}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-indigo-50 group-hover:text-indigo-700">
                    <Icon className="h-6 w-6" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  {subject.name}
                </h3>

                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  {subjectDescriptions[subject.name] ||
                    subject.description ||
                    "Practice questions and legal problems for this subject."}
                </p>

                <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                  <span>{subject.topics.length} Topics</span>
                  <span>•</span>
                  <span>{subject.questions.length} Questions</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRACTICE GENERATOR */}
      <section
        id="practice"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Sparkles className="h-6 w-6" />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-indigo-600">
                ALAC Exam Drill
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
                Generate a Bar Practice Question
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Select a subject and topic, then generate an essay question
                designed for Philippine Bar Examination practice.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-slate-900">
                  ALAC Scoring
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Answer</span>
                    <strong>20%</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Legal Basis</span>
                    <strong>35%</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Application</span>
                    <strong>35%</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Conclusion</span>
                    <strong>10%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
              <GenerateQuestionForm subjects={subjects} />
            </div>
          </div>
        </div>
      </section>

      {/* RECENT QUESTIONS */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Practice Library
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              Recent Practice Questions
            </h2>
          </div>

          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900"
          >
            View all questions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-700">
              No practice questions yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Generate your first question above.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {questions.map((q) => (
              <article
                key={q.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {q.subject.name}
                  </span>

                  <span className="text-xs text-slate-500">
                    {q.topic?.name || "General Topic"}
                  </span>

                  <div className="ml-auto flex gap-1">
                    <SourceBadge
                      source={q.questionSource}
                      yearRef={q.barYearReference}
                    />
                    <CitationBadge status={q.verificationStatus} />
                  </div>
                </div>

                <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                  {q.title}
                </h3>

                <p className="mt-3 line-clamp-4 font-serif text-sm leading-7 text-slate-600">
                  {q.factsIssue}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-500">
                    ALAC Essay Practice
                  </span>

                  <Link
                    href={`/practice/${q.id}?timer=15`}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                  >
                    Practice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="font-extrabold text-white">
                BAR TEST PRACTICE
              </div>
              <p className="mt-1 text-sm">
                Philippine Bar Examination & Law-School Practice
              </p>
            </div>

            <div className="text-sm">
              ALAC Method • Answer • Legal Basis • Application • Conclusion
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}