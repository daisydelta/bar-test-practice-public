import React from "react";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface CitationBadgeProps {
  status: string;
  className?: string;
}

export function CitationBadge({ status, className = "" }: CitationBadgeProps) {
  const isVerified = status === "VERIFIED";

  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        title="Verified against canonical statutory or Supreme Court sources"
      >
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        Verified Reference
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
      title="Requires verification against official primary sources"
    >
      <AlertCircle className="w-3 h-3 text-amber-600" />
      Needs Review
    </span>
  );
}
