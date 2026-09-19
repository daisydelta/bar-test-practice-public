"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlacEditor } from "@/components/alac/AlacEditor";
import { PracticeTimer } from "@/components/practice/PracticeTimer";
import { StudentAlacAnswer } from "@/lib/evaluation/types";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface AlacWorkspaceClientProps {
  questionId: string;
  initialMinutes?: number;
}

export function AlacWorkspaceClient({
  questionId,
  initialMinutes = 15,
}: AlacWorkspaceClientProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<StudentAlacAnswer>({
    answerA: "",
    legalBasisL: "",
    applicationA: "",
    conclusionC: "",
  });
  const [timeSpentSec, setTimeSpentSec] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate that at least one field has text
    if (
      !answers.answerA.trim() &&
      !answers.legalBasisL.trim() &&
      !answers.applicationA.trim() &&
      !answers.conclusionC.trim()
    ) {
      setErrorMessage("Please fill in at least one ALAC field before submitting for evaluation.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          studentAnswer: answers,
          timeSpentSec,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to evaluate answer.");
      }

      const data = await res.json();
      // Clear draft for this question
      if (typeof window !== "undefined") {
        localStorage.removeItem(`bar_draft_${questionId}`);
      }

      // Redirect to review page
      router.push(`/review/${data.submissionId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during evaluation.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* YOUR ALAC ANSWER Header Bar with Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            YOUR ALAC ANSWER
          </h2>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Answer • Legal Basis • Application • Conclusion
          </p>
        </div>
        <PracticeTimer initialMinutes={initialMinutes} onTimeUpdate={(s) => setTimeSpentSec(s)} />
      </div>

      {/* Core 4-Field ALAC Editor */}
      <AlacEditor
        questionId={questionId}
        initialValues={answers}
        onChange={setAnswers}
        disabled={isSubmitting}
      />

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Ready to submit? Your response will be evaluated against the ALAC method criteria.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" aria-hidden="true" />
              <span>Evaluating Answer...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>Submit Answer</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
