"use client";

import React, { useState } from "react";
import { CheckCheck, User, Sparkles, Split } from "lucide-react";
import { StudentAlacAnswer } from "@/lib/evaluation/types";

interface BestAnswerComparisonProps {
  studentAnswer: StudentAlacAnswer;
  bestAnswer: {
    answerA: string;
    legalBasisL: string;
    applicationA: string;
    conclusionC: string;
  };
}

export function BestAnswerComparison({
  studentAnswer,
  bestAnswer,
}: BestAnswerComparisonProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "A" | "L" | "A2" | "C">("ALL");

  const components = [
    {
      id: "A" as const,
      label: "A — Answer",
      badge: "20%",
      student: studentAnswer.answerA,
      best: bestAnswer.answerA,
    },
    {
      id: "L" as const,
      label: "L — Legal Basis",
      badge: "35%",
      student: studentAnswer.legalBasisL,
      best: bestAnswer.legalBasisL,
    },
    {
      id: "A2" as const,
      label: "A — Application",
      badge: "35%",
      student: studentAnswer.applicationA,
      best: bestAnswer.applicationA,
    },
    {
      id: "C" as const,
      label: "C — Conclusion",
      badge: "10%",
      student: studentAnswer.conclusionC,
      best: bestAnswer.conclusionC,
    },
  ];

  const filtered = activeTab === "ALL" ? components : components.filter((c) => c.id === activeTab);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Split className="w-5 h-5 text-indigo-600" />
            Answer Comparison: Student vs. Model Best Answer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare your ALAC formulation directly with the verified model answer.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Fields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("A")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "A" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("L")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "L" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            L
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("A2")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "A2" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("C")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "C" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            C
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map((item) => (
          <div key={item.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">{item.label}</span>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {item.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Student Answer Column */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 pb-2 border-b border-slate-200/60">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Your Submitted Answer</span>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {item.student ? (
                    item.student
                  ) : (
                    <span className="italic text-slate-400">No response provided.</span>
                  )}
                </div>
              </div>

              {/* Model Best Answer Column */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 pb-2 border-b border-emerald-200/60">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Model Best Answer</span>
                </div>
                <div className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
                  {item.best}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
