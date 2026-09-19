"use client";

import React, { useState } from "react";
import { FolderPlus, FileText, CheckCircle2, AlertCircle, Plus } from "lucide-react";

interface MaterialItem {
  id: string;
  title: string;
  materialType: string;
  subjectSlug: string;
  content: string;
  createdAt: string;
}

interface UserMaterialClientProps {
  initialMaterials: MaterialItem[];
}

export function UserMaterialClient({ initialMaterials }: UserMaterialClientProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [materialType, setMaterialType] = useState("SYLLABUS");
  const [subjectSlug, setSubjectSlug] = useState("statutory-construction");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/user-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          materialType,
          subjectSlug,
          content,
        }),
      });

      if (!res.ok) throw new Error("Failed to save study material");

      const data = await res.json();
      setMaterials([data.material, ...materials]);
      setTitle("");
      setContent("");
      setShowForm(false);
      setMessage("Material added to your study bank successfully!");
    } catch {
      setMessage("Error saving material. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Your Custom Study Bank</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Store syllabi, case digests, reviewers, and custom study notes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? "Close Form" : "Add Study Material"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Creation form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>Add to Study Bank</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Title / Case Name / Topic
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., StatCon Syllabus - Authority to Legislate"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Material Type
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="SYLLABUS">Syllabus / Outline</option>
                <option value="CASE_DIGEST">Case Digest</option>
                <option value="REVIEWER_NOTES">Reviewer Notes</option>
                <option value="CUSTOM_QUESTION">Custom Question</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Associated Bar Subject
            </label>
            <select
              value={subjectSlug}
              onChange={(e) => setSubjectSlug(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 bg-white"
            >
              <option value="statutory-construction">Statutory Construction</option>
              <option value="basic-legal-and-judicial-ethics">Basic Legal and Judicial Ethics</option>
              <option value="political-law">Political Law</option>
              <option value="civil-law">Civil Law</option>
              <option value="criminal-law">Criminal Law</option>
              <option value="labor-law">Labor Law</option>
              <option value="commercial-law">Commercial Law</option>
              <option value="remedial-law">Remedial Law</option>
              <option value="legal-ethics">Legal Ethics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Content / Notes / Case Doctrine
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste case facts, statutory provisions, or reviewer notes here..."
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save to Study Bank"}
            </button>
          </div>
        </form>
      )}

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.length === 0 ? (
          <div className="col-span-2 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-600 font-medium">No custom study materials yet.</p>
            <p className="text-[11px] text-slate-400">
              Add your StatCon syllabus, case digests, or custom reviewer notes above.
            </p>
          </div>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {m.materialType.replace("_", " ")}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{m.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-4 whitespace-pre-wrap font-sans">
                {m.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
