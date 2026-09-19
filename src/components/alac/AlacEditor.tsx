"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, Info, Save } from "lucide-react";
import { StudentAlacAnswer } from "@/lib/evaluation/types";

interface AlacEditorProps {
  questionId: string;
  initialValues?: StudentAlacAnswer;
  onChange: (values: StudentAlacAnswer) => void;
  disabled?: boolean;
}

export function AlacEditor({
  questionId,
  initialValues,
  onChange,
  disabled = false,
}: AlacEditorProps) {
  const [answerA, setAnswerA] = useState(initialValues?.answerA || "");
  const [legalBasisL, setLegalBasisL] = useState(initialValues?.legalBasisL || "");
  const [applicationA, setApplicationA] = useState(initialValues?.applicationA || "");
  const [conclusionC, setConclusionC] = useState(initialValues?.conclusionC || "");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const storageKey = `bar_draft_${questionId}`;

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.answerA) setAnswerA(parsed.answerA);
          if (parsed.legalBasisL) setLegalBasisL(parsed.legalBasisL);
          if (parsed.applicationA) setApplicationA(parsed.applicationA);
          if (parsed.conclusionC) setConclusionC(parsed.conclusionC);
          setLastSaved("Restored from draft");
        } catch {
          // ignore parsing error
        }
      }
    }
  }, [storageKey]);

  // Sync with parent and autosave to localStorage
  useEffect(() => {
    const currentValues: StudentAlacAnswer = {
      answerA,
      legalBasisL,
      applicationA,
      conclusionC,
    };
    onChange(currentValues);

    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(currentValues));
        const now = new Date();
        setLastSaved(`Autosaved at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [answerA, legalBasisL, applicationA, conclusionC, onChange, storageKey]);

  const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

  return (
    <div className="space-y-6">
      {/* Draft Save Status Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-200">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>ALAC Response Workspace</span>
        </div>
        {lastSaved && (
          <div className="flex items-center gap-1 text-slate-400">
            <Save className="w-3 h-3" aria-hidden="true" />
            <span>{lastSaved}</span>
          </div>
        )}
      </div>

      {/* 1. Answer (A) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider">
                A — ANSWER
              </span>
              <span className="text-xs text-slate-500 font-medium">Weight: 20%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Give a <strong>categorical, direct stance</strong> in the opening sentence (e.g., &quot;Yes&quot;, &quot;No&quot;, &quot;The petition should be dismissed&quot;). Avoid hesitant or equivocal phrasing.
            </p>
          </div>
          <div className="text-right shrink-0 text-[11px] text-slate-400">
            {countWords(answerA)} words
          </div>
        </div>
        <textarea
          value={answerA}
          onChange={(e) => setAnswerA(e.target.value)}
          placeholder="State your direct, categorical answer here in 1 to 2 sentences..."
          rows={3}
          disabled={disabled}
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-y"
        />
      </div>

      {/* 2. Legal Basis (L) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-bold tracking-wider">
                L — LEGAL BASIS
              </span>
              <span className="text-xs text-slate-500 font-medium">Weight: 35%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Identify the <strong>governing statutory provision, rule, or doctrine</strong>. State the rule and all its essential requisites or elements accurately without inventing citations.
            </p>
          </div>
          <div className="text-right shrink-0 text-[11px] text-slate-400">
            {countWords(legalBasisL)} words
          </div>
        </div>
        <textarea
          value={legalBasisL}
          onChange={(e) => setLegalBasisL(e.target.value)}
          placeholder="Under Article... / Rule... / According to the established Supreme Court doctrine of..."
          rows={5}
          disabled={disabled}
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-y"
        />
      </div>

      {/* 3. Application (A) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider">
                A — APPLICATION
              </span>
              <span className="text-xs text-slate-500 font-medium">Weight: 35%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>Subsume the problem&apos;s specific facts</strong> under each legal element. Explain <em>why</em> the conduct satisfies or fails the rule. Avoid merely copying facts without analysis.
            </p>
          </div>
          <div className="text-right shrink-0 text-[11px] text-slate-400">
            {countWords(applicationA)} words
          </div>
        </div>
        <textarea
          value={applicationA}
          onChange={(e) => setApplicationA(e.target.value)}
          placeholder="In this case, the facts show that... Applying the requisites to these facts demonstrates that..."
          rows={6}
          disabled={disabled}
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-y"
        />
      </div>

      {/* 4. Conclusion (C) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-bold tracking-wider">
                C — CONCLUSION
              </span>
              <span className="text-xs text-slate-500 font-medium">Weight: 10%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Provide a <strong>logical concluding wrap-up</strong> directly answering the specific relief, liability, or validity asked in the prompt.
            </p>
          </div>
          <div className="text-right shrink-0 text-[11px] text-slate-400">
            {countWords(conclusionC)} words
          </div>
        </div>
        <textarea
          value={conclusionC}
          onChange={(e) => setConclusionC(e.target.value)}
          placeholder="Therefore, ... / Hence, ... (Direct resolution of the controversy)"
          rows={3}
          disabled={disabled}
          className="w-full text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-y"
        />
      </div>
    </div>
  );
}
