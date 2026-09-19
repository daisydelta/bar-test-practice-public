import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { History, BookOpen, ArrowRight, Award, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const submissions = await prisma.submission.findMany({
    include: {
      question: {
        include: {
          subject: true,
          topic: true,
        },
      },
      evaluation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-7 h-7 text-indigo-600" />
          Practice History &amp; Score Tracker
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Review your past ALAC essay submissions, score breakdowns, and diagnostic evaluations.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No practice submissions yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Select an essay question from any of the 9 Philippine Bar subjects to complete your first ALAC practice session.
          </p>
          <Link
            href="/practice"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs transition-colors shadow-xs"
          >
            Start Your First Practice
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const evalData = sub.evaluation;
            const score = evalData ? Math.round(evalData.overallScore) : null;

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {sub.question.subject.name}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      • {sub.question.topic.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {new Date(sub.createdAt).toLocaleDateString()} at{" "}
                      {new Date(sub.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{sub.question.title}</h3>

                  {evalData && (
                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="font-medium">
                        A: <strong className="text-slate-900">{evalData.scoreA}/20</strong>
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        L: <strong className="text-slate-900">{evalData.scoreL}/35</strong>
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        A: <strong className="text-slate-900">{evalData.scoreA2}/35</strong>
                      </span>
                      <span>•</span>
                      <span className="font-medium">
                        C: <strong className="text-slate-900">{evalData.scoreC}/10</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {score !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 font-mono">{score}/100</div>
                      <div className="text-[10px] text-slate-400 font-medium">ALAC Score</div>
                    </div>
                  )}

                  <Link
                    href={`/review/${sub.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-900 text-slate-800 font-bold text-xs transition-colors"
                  >
                    <span>View Evaluation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
