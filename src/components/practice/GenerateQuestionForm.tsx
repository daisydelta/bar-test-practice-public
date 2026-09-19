"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubjectOption {
  id: string;
  name: string;
  slug: string;
  topics: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface GenerateQuestionFormProps {
  subjectSlug?: string;
  topicSlug?: string;
  subjects?: SubjectOption[];
}

export default function GenerateQuestionForm({
  subjectSlug: initialSubjectSlug,
  topicSlug: initialTopicSlug,
  subjects = [],
}: GenerateQuestionFormProps) {
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] =
    useState<string>(
      initialSubjectSlug ||
        (subjects.length > 0
          ? subjects[0].slug
          : "")
    );

  const [selectedTopic, setSelectedTopic] =
    useState<string>(
      initialTopicSlug || ""
    );

  const [focus, setFocus] = useState("");
  const [difficulty, setDifficulty] =
    useState<string>("MEDIUM");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const currentSubjectObj =
    subjects.find(
      (subject) =>
        subject.slug === selectedSubject
    );

  const availableTopics =
    currentSubjectObj
      ? currentSubjectObj.topics
      : [];

  async function handleGenerate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const subjectToUse =
      selectedSubject ||
      initialSubjectSlug ||
      "";

    if (!subjectToUse) {
      setError(
        "Please select a Philippine Bar subject first."
      );
      return;
    }

    let focusToUse =
      focus.trim();

    if (!focusToUse) {
      if (selectedTopic) {
        const foundTopic =
          availableTopics.find(
            (topic) =>
              topic.slug === selectedTopic
          );

        focusToUse = foundTopic
          ? foundTopic.name
          : selectedTopic;
      } else if (currentSubjectObj) {
        focusToUse =
          "General " +
          currentSubjectObj.name +
          " bar exam scenario";
      } else {
        setError(
          "Please enter a topic or select a syllabus area."
        );
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/generate-question",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            subject:
              subjectToUse,
            focus:
              focusToUse,
            topic:
              selectedTopic ||
              initialTopicSlug ||
              undefined,
            difficulty:
              difficulty,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate question."
        );
      }

      if (!data.question?.id) {
        throw new Error(
          "The generated question did not return a valid ID."
        );
      }

      router.push(
        "/practice/" +
          data.question.id +
          "?timer=15"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the question."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleGenerate}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {subjects.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject
            </label>

            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(
                  e.target.value
                );
                setSelectedTopic("");
                setError("");
              }}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              disabled={loading}
            >
              {subjects.map(
                (subject) => (
                  <option
                    key={subject.id}
                    value={subject.slug}
                  >
                    {subject.name}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {availableTopics.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Topic
            </label>

            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(
                  e.target.value
                );
                setError("");
              }}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              disabled={loading}
            >
              <option value="">
                -- All Topics / Custom Focus --
              </option>

              {availableTopics.map(
                (topic) => (
                  <option
                    key={topic.id}
                    value={topic.slug}
                  >
                    {topic.name}
                  </option>
                )
              )}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Custom Topic / Doctrine / Focus
          <span className="font-normal text-slate-400">
            {" "}
            (Optional if topic selected)
          </span>
        </label>

        <div className="relative">
          <Sparkles
            className="w-4 h-4 text-indigo-500 absolute left-3 top-2.5"
            aria-hidden="true"
          />

          <input
            type="text"
            value={focus}
            onChange={(e) => {
              setFocus(e.target.value);
              setError("");
            }}
            placeholder="e.g., separation of powers, verba legis, quasi-delict, conflict of interest..."
            className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 bg-white"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            Difficulty:
          </span>

          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">

            {[
              "EASY",
              "MEDIUM",
              "HARD",
            ].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  setDifficulty(diff);
                  setError("");
                }}
                disabled={loading}
                className={
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors " +
                  (difficulty === diff
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800")
                }
              >
                {diff.charAt(0) +
                  diff
                    .slice(1)
                    .toLowerCase()}
              </button>
            ))}

          </div>
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (!selectedSubject &&
              !initialSubjectSlug)
          }
          className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          {loading ? (
            <>
              <Loader2
                className="w-3.5 h-3.5 animate-spin"
                aria-hidden="true"
              />

              <span>
                Generating Bar Question...
              </span>
            </>
          ) : (
            <>
              <Sparkles
                className="w-3.5 h-3.5 text-amber-300"
                aria-hidden="true"
              />

              <span>
                Generate Question
              </span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}