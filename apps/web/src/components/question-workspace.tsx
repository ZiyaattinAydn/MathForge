"use client";

import Link from "next/link";
import { useState } from "react";

import { CodeEditor } from "@/components/code-editor";
import { SubmissionResultPanel } from "@/components/submission-result-panel";
import { getQuestion, submitSolution } from "@/lib/mathforge-api";
import type {
  Audience,
  Difficulty,
  JsonValue,
  Language,
  LearningTopicId,
  Question,
  QuestionSummary,
  SubmissionResponse,
} from "@/types/mathforge";

const languages: Language[] = [
  "javascript",
  "python",
  "csharp",
];

const languageLabels: Record<Language, string> = {
  javascript: "JavaScript",
  python: "Python",
  csharp: "C#",
};

const audienceLabels: Record<Audience, string> = {
  general: "Temel Seviye",
  "math-lover": "Matematik Meraklısı",
};

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

const difficultyStyles: Record<Difficulty, string> = {
  easy: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  hard: "border-red-500/30 bg-red-500/10 text-red-300",
};

const learningTopicLinks: Record<
  LearningTopicId,
  {
    label: string;
    href: string;
  }
> = {
  variables: {
    label: "Değişkenler",
    href: "/learn#degiskenler",
  },
  arithmetic: {
    label: "Dört işlem",
    href: "/learn#dort-islem",
  },
  functions: {
    label: "Fonksiyonlar",
    href: "/learn#fonksiyonlar",
  },
  return: {
    label: "return",
    href: "/learn#return",
  },
  conditions: {
    label: "Koşullar",
    href: "/learn#kosullar",
  },
  loops: {
    label: "Döngüler",
    href: "/learn#donguler",
  },
  arrays: {
    label: "Listeler ve diziler",
    href: "/learn#listeler",
  },
  modulo: {
    label: "Kalan bulma",
    href: "/learn#modulo",
  },
};

const DRAFT_STORAGE_KEY = "mathforge-drafts-v1";

function readStoredDrafts(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const storedValue = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!storedValue) {
      return {};
    }

    return JSON.parse(storedValue) as Record<string, string>;
  } catch {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return {};
  }
}

function persistDrafts(drafts: Record<string, string>) {
  try {
    localStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify(drafts),
    );
  } catch {
    // Taslakların saklanamaması editör kullanımını engellememeli.
  }
}

function getDraftKey(
  questionId: string,
  language: Language,
): string {
  return `${questionId}:${language}`;
}

function createQuestionDrafts(
  question: Question,
): Record<string, string> {
  return {
    [getDraftKey(question.id, "javascript")]:
      question.starter_code.javascript,
    [getDraftKey(question.id, "python")]:
      question.starter_code.python,
    [getDraftKey(question.id, "csharp")]:
      question.starter_code.csharp,
  };
}

function formatValue(value: JsonValue): string {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  return JSON.stringify(value);
}

type QuestionWorkspaceProps = {
  questions: QuestionSummary[];
  initialQuestion: Question | null;
};

export function QuestionWorkspace({
  questions,
  initialQuestion,
}: QuestionWorkspaceProps) {
  const [selectedQuestion, setSelectedQuestion] =
    useState<Question | null>(initialQuestion);

  const [selectedAudience, setSelectedAudience] =
    useState<Audience>(initialQuestion?.audience ?? "general");

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>("python");

  const [drafts, setDrafts] = useState<Record<string, string>>(
    () => ({
      ...(initialQuestion
        ? createQuestionDrafts(initialQuestion)
        : {}),
      ...readStoredDrafts(),
    }),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResponse | null>(null);
  const [submissionError, setSubmissionError] =
    useState<string | null>(null);

  async function chooseQuestion(slug: string) {
    if (
      selectedQuestion?.slug === slug ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setSubmissionResult(null);
    setSubmissionError(null);

    try {
      const nextQuestion = await getQuestion(slug);

      setSelectedQuestion(nextQuestion);

      setDrafts((currentDrafts) => ({
        ...createQuestionDrafts(nextQuestion),
        ...currentDrafts,
      }));
    } catch {
      setLoadError(
        "Soru yüklenemedi. FastAPI sunucusunun çalıştığını kontrol et.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateCode(value: string) {
    if (!selectedQuestion) {
      return;
    }

    setSubmissionResult(null);
    setSubmissionError(null);

    const key = getDraftKey(
      selectedQuestion.id,
      selectedLanguage,
    );

    setDrafts((currentDrafts) => {
      const nextDrafts = {
        ...currentDrafts,
        [key]: value,
      };

      persistDrafts(nextDrafts);
      return nextDrafts;
    });
  }

  function resetCode() {
    if (!selectedQuestion) {
      return;
    }

    const key = getDraftKey(
      selectedQuestion.id,
      selectedLanguage,
    );

    setDrafts((currentDrafts) => {
      const nextDrafts = {
        ...currentDrafts,
        [key]: selectedQuestion.starter_code[selectedLanguage],
      };

      persistDrafts(nextDrafts);
      return nextDrafts;
    });
  }

  async function runCode() {
    if (!selectedQuestion || !currentCode.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    setSubmissionError(null);

    try {
      const result = await submitSolution({
        question_id: selectedQuestion.id,
        language: selectedLanguage,
        source_code: currentCode,
      });

      setSubmissionResult(result);
    } catch {
      setSubmissionError(
        "Kod çalıştırılamadı. FastAPI ve Judge0 bağlantısını kontrol et.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredQuestions = questions.filter(
    (question) => question.audience === selectedAudience,
  );

  function chooseAudience(audience: Audience) {
    setSelectedAudience(audience);

    const firstQuestion = questions.find(
      (question) => question.audience === audience,
    );

    if (
      firstQuestion &&
      selectedQuestion?.audience !== audience
    ) {
      void chooseQuestion(firstQuestion.slug);
    }
  }

  const currentCode = selectedQuestion
    ? drafts[
        getDraftKey(
          selectedQuestion.id,
          selectedLanguage,
        )
      ] ?? selectedQuestion.starter_code[selectedLanguage]
    : "";

  return (
    <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="self-start rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 lg:sticky lg:top-20">
        <div className="flex items-center justify-between px-2 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Soru kataloğu
            </p>

            <h1 className="mt-1 text-xl font-bold">
              Matematik Soruları
            </h1>
          </div>

          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
            {filteredQuestions.length} soru
          </span>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`rounded-xl border px-3 py-3 text-left ${
              selectedAudience === "general"
                ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]"
                : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--brand)]"
            }`}
            onClick={() => chooseAudience("general")}
          >
            <span className="block text-sm font-bold">
              Temel Seviye
            </span>
            <span className="mt-1 block text-xs opacity-75">
              {questions.filter((question) => question.audience === "general").length} soru
            </span>
          </button>

          <button
            type="button"
            className={`rounded-xl border px-3 py-3 text-left ${
              selectedAudience === "math-lover"
                ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--on-brand)]"
                : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--brand)]"
            }`}
            onClick={() => chooseAudience("math-lover")}
          >
            <span className="block text-sm font-bold">
              Matematik Meraklısı
            </span>
            <span className="mt-1 block text-xs opacity-75">
              {questions.filter((question) => question.audience === "math-lover").length} soru
            </span>
          </button>
        </div>

        <div className="space-y-2">
          {filteredQuestions.map((question) => {
            const isSelected =
              selectedQuestion?.slug === question.slug;

            return (
              <button
                key={question.id}
                type="button"
                className={`w-full rounded-xl border p-4 text-left ${
                  isSelected
                    ? "border-[var(--brand)] bg-[var(--surface-elevated)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[var(--brand)]"
                }`}
                onClick={() => {
                  void chooseQuestion(question.slug);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
                    {String(question.order).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {question.title}
                    </p>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {audienceLabels[question.audience]}
                    </p>

                    <span
                      className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-medium ${difficultyStyles[question.difficulty]}`}
                    >
                      {difficultyLabels[question.difficulty]}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {!selectedQuestion ? (
        <section className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--text-secondary)]">
          Bir soru seç veya FastAPI sunucusunun çalıştığını
          kontrol et.
        </section>
      ) : (
        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="self-start rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <header className="border-b border-[var(--border)] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${difficultyStyles[selectedQuestion.difficulty]}`}
                >
                  {difficultyLabels[selectedQuestion.difficulty]}
                </span>

                <span className="text-xs text-[var(--text-secondary)]">
                  {audienceLabels[selectedQuestion.audience]}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black">
                {selectedQuestion.order}.{" "}
                {selectedQuestion.title}
              </h2>

              <p className="mt-3 leading-7 text-[var(--text-secondary)]">
                {selectedQuestion.description}
              </p>
            </header>

            <div className="space-y-6 p-5">
              <section>
                <h3 className="font-bold text-[var(--brand)]">
                  Görevin
                </h3>

                <p className="mt-2 leading-7">
                  {selectedQuestion.task}
                </p>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                    Girdi
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedQuestion.input_description}
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                    Çıktı
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {selectedQuestion.output_description}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-bold">Örnekler</h3>

                <div className="mt-3 space-y-3">
                  {selectedQuestion.examples.map(
                    (example, index) => (
                      <div
                        key={`${selectedQuestion.id}-${index}`}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                      >
                        <div className="grid gap-2 font-mono text-sm">
                          <p>
                            <span className="text-[var(--text-secondary)]">
                              Girdi:
                            </span>{" "}
                            {example.inputs
                              .map(formatValue)
                              .join(", ")}
                          </p>

                          <p>
                            <span className="text-[var(--text-secondary)]">
                              Çıktı:
                            </span>{" "}
                            {formatValue(
                              example.expected_output,
                            )}
                          </p>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {example.explanation}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <h3 className="font-bold">
                  Bilmen gerekenler
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedQuestion.learning_topics.map(
                    (topicId) => {
                      const topic =
                        learningTopicLinks[topicId];

                      return (
                        <Link
                          key={topicId}
                          href={topic.href}
                          className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        >
                          {topic.label}
                        </Link>
                      );
                    },
                  )}
                </div>
              </section>

              <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <summary className="cursor-pointer font-bold">
                  İpuçlarını göster
                </summary>

                <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {selectedQuestion.hints.map(
                    (hint, index) => (
                      <li key={hint}>
                        {index + 1}. {hint}
                      </li>
                    ),
                  )}
                </ol>
              </details>

              <details className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
                <summary className="cursor-pointer font-bold">
                  Yaygın hatalar
                </summary>

                <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {selectedQuestion.common_mistakes.map(
                    (mistake) => (
                      <li key={mistake}>• {mistake}</li>
                    ),
                  )}
                </ul>
              </details>
            </div>
          </article>

          <article className="self-start overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] xl:sticky xl:top-20">
            <header className="border-b border-[var(--border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-1">
                  {languages.map((language) => (
                    <button
                      key={language}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                        selectedLanguage === language
                          ? "bg-[var(--brand)] text-[var(--on-brand)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                      onClick={() => {
                        setSelectedLanguage(language);
                        setSubmissionResult(null);
                        setSubmissionError(null);
                      }}
                    >
                      {languageLabels[language]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:border-[var(--brand)]"
                  onClick={resetCode}
                >
                  Başlangıç koduna dön
                </button>
              </div>
            </header>

            <div className="p-4">
              {loadError ? (
                <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {loadError}
                </p>
              ) : null}

              {isLoading ? (
                <p className="mb-3 text-sm text-[var(--text-secondary)]">
                  Soru yükleniyor...
                </p>
              ) : null}

              <CodeEditor
                language={selectedLanguage}
                value={currentCode}
                onChange={updateCode}
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  Taslaklar bu tarayıcıda otomatik olarak saklanır.
                </p>

                <button
                  type="button"
                  disabled={isSubmitting || !currentCode.trim()}
                  className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--on-brand)] hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    void runCode();
                  }}
                >
                  {isSubmitting ? "Çalıştırılıyor..." : "Kodu Çalıştır"}
                </button>
              </div>

              <SubmissionResultPanel
                result={submissionResult}
                error={submissionError}
                isSubmitting={isSubmitting}
              />
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
