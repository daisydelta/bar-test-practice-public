import React from "react";
import { Compass, Lightbulb, AlertOctagon } from "lucide-react";

interface HowToAnswerCardProps {
  guidance: string;
  className?: string;
}

export function HowToAnswerCard({ guidance, className = "" }: HowToAnswerCardProps) {
  return (
    <div className={`bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
        <Compass className="w-5 h-5 text-indigo-600" />
        <span>How to Answer: Doctrinal Guidance &amp; Examiner Approach</span>
      </div>

      <div className="text-xs text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
        {guidance}
      </div>

      <div className="pt-3 border-t border-indigo-100/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong>ALAC Tip:</strong> Ensure your legal basis states the specific statutory test or doctrine before starting factual analysis.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            <strong>Avoid Waffling:</strong> Never begin with ambiguous expressions like &quot;It depends&quot; unless the problem genuinely presents two distinct scenarios.
          </span>
        </div>
      </div>
    </div>
  );
}
