import React from "react";
import { prisma } from "@/lib/db";
import { FolderEdit, BookOpen, AlertCircle } from "lucide-react";
import { UserMaterialClient } from "@/components/user-materials/UserMaterialClient";

export const dynamic = "force-dynamic";

export default async function UserMaterialsPage() {
  const materials = await prisma.userMaterial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedMaterials = materials.map((m) => ({
    id: m.id,
    title: m.title,
    materialType: m.materialType,
    subjectSlug: m.subjectSlug,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FolderEdit className="w-7 h-7 text-indigo-600" />
          User Study Bank &amp; Custom Materials
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Add your own StatCon syllabus, case digests, notes, or custom questions to tailor your Bar practice.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold">User Study Bank Architecture:</strong>
          <p className="leading-relaxed">
            User-provided materials are isolated and tagged separately from canonical sources. Custom questions created here are marked as <code>USER_CREATED</code> with status <code>NEEDS_REVIEW</code> until verified against official sources.
          </p>
        </div>
      </div>

      <UserMaterialClient initialMaterials={serializedMaterials} />
    </div>
  );
}
