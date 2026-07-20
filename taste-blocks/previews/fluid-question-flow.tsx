"use client";

import { useState } from "react";
import {
  AskUserQuestions,
  type AskUserAnswer,
  type AskUserQuestion,
} from "@/registry/sources/fluid-functionalism/components/question-flow";

const questions: AskUserQuestion[] = [
  {
    id: "role",
    title: "What are you working on?",
    options: [
      { id: "site", title: "Website", description: "Marketing or editorial" },
      { id: "product", title: "Product", description: "Interactive application" },
      { id: "system", title: "Design system", description: "Shared interface patterns" },
    ],
    skippable: false,
  },
  {
    id: "priorities",
    title: "What matters most?",
    options: [
      { id: "clarity", title: "Clarity" },
      { id: "speed", title: "Speed" },
      { id: "accessibility", title: "Accessibility" },
    ],
    multiSelect: true,
    skippable: false,
  },
  {
    id: "note",
    title: "Add one constraint",
    freeText: true,
    freeTextMultiline: false,
    freeTextPlaceholder: "For example: keyboard-first",
    skippable: true,
    nextLabel: "Finish",
  },
];

export default function FluidQuestionFlowPreview() {
  const [run, setRun] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AskUserAnswer> | null>(null);

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-3">
      <AskUserQuestions
        key={run}
        questions={questions}
        onComplete={setAnswers}
      />
      <div className="flex min-h-8 items-center gap-3 text-xs text-muted-foreground">
        <span aria-live="polite">
          {answers ? `${Object.keys(answers).length} answers saved.` : "Complete the flow to save answers."}
        </span>
        {answers && (
          <button
            type="button"
            className="rounded-md border px-2 py-1 text-foreground"
            onClick={() => {
              setAnswers(null);
              setRun((value) => value + 1);
            }}
          >
            Start again
          </button>
        )}
      </div>
    </div>
  );
}
