import React from "react";
import { BookOpen, User, Sparkles, GraduationCap } from "lucide-react";

interface SourceBadgeProps {
  source: string;
  yearRef?: string | null;
  className?: string;
}

export function SourceBadge({ source, yearRef, className = "" }: SourceBadgeProps) {
  let label = "Verified Bar Question";
  let icon = <BookOpen className="w-3 h-3 text-blue-600" />;
  let style = "bg-blue-50 text-blue-700 border-blue-200";

  switch (source) {
    case "INSTRUCTOR_CREATED":
      label = "Instructor-Created";
      icon = <GraduationCap className="w-3 h-3 text-purple-600" />;
      style = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "USER_CREATED":
      label = "User-Created";
      icon = <User className="w-3 h-3 text-amber-600" />;
      style = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "AI_GENERATED":
      label = "AI-Generated (Needs Editorial Review)";
      icon = <Sparkles className="w-3 h-3 text-slate-600" />;
      style = "bg-slate-50 text-slate-700 border-slate-200";
      break;
    case "VERIFIED_BAR_QUESTION":
    default:
      label = yearRef || "Verified Bar Question";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
}
