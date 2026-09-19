import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

interface LegalDisclaimerProps {
  compact?: boolean;
}

export function LegalDisclaimer({ compact = false }: LegalDisclaimerProps) {
  if (compact) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-md px-3 py-1.5 text-xs text-amber-900 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Educational Practice Tool:</strong> Scores are not official Philippine Bar Examination scores. Legal references should be verified against authoritative sources.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-4 text-xs text-slate-700 space-y-2">
      <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
        <ShieldCheck className="w-4 h-4 text-indigo-700" />
        <span>Educational Disclaimer & Legal Grounding Notice</span>
      </div>
      <p className="leading-relaxed">
        This application is an educational Bar Examination and law-school practice tool. Its scores are not official Philippine Bar Examination scores and should not be treated as an official assessment by the Supreme Court or Bar Examiners. Legal references should be verified against current authoritative sources.
      </p>
      <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200">
        <span>Verified legal grounding &amp; no unsupported legal citations</span>
        <span>•</span>
        <span>Philippine Bar ALAC Methodology</span>
      </div>
    </div>
  );
}
