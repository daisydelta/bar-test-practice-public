import React from "react";
import Link from "next/link";
import { Scale, BookOpen, Layers, History, FolderEdit } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-800 transition-colors">
            <Scale className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                Bar Test Practice
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                ALAC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Philippine Bar Exam &amp; Law-School Practice
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>9 Subjects</span>
          </Link>
          <Link
            href="/practice"
            className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Practice</span>
          </Link>
          <Link
            href="/user-materials"
            className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <FolderEdit className="w-4 h-4 text-slate-500" />
            <span>Study Bank</span>
          </Link>
          <Link
            href="/history"
            className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>History</span>
          </Link>
        </nav>

        {/* Header Disclaimer Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Verified Legal Grounding</span>
        </div>
      </div>
    </header>
  );
}
