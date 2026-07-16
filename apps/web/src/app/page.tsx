import Link from "next/link";

import {
  getLearningTopicSummaries,
  getQuestionSummaries,
} from "@/lib/mathforge-api";
import type {
  Audience,
  Difficulty,
  LearningTopicSummary,
  QuestionSummary,
} from "@/types/mathforge";

export const dynamic = "force-dynamic";

const audienceLabels: Record<Audience, string> = {
  general: "Herkes İçin Matematik",
  "math-lover": "Matematik Meraklıları",
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

async function loadHomeData(): Promise<{
  questions: QuestionSummary[];
  topics: LearningTopicSummary[];
}> {
  const [questionsResult, topicsResult] = await Promise.allSettled([
    getQuestionSummaries(),
    getLearningTopicSummaries(),
  ]);

  return {
    questions:
      questionsResult.status === "fulfilled" ? questionsResult.value : [],
    topics: topicsResult.status === "fulfilled" ? topicsResult.value : [],
  };
}

export default async function Home() {
  const { questions, topics } = await loadHomeData();

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <div className="flex items-center justify-between px-2 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Soru kataloğu
            </p>
            <h1 className="mt-1 text-xl font-bold">Matematik Soruları</h1>
          </div>

          <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
            {questions.length}/12
          </span>
        </div>

        <div className="mt-2 space-y-2">
          {questions.length > 0 ? (
            questions.map((question) => (
              <article
                key={question.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 hover:border-[var(--brand)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)]">
                    {String(question.order).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-[var(--text-primary)]">
                      {question.title}
                    </h2>

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
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--text-secondary)]">
              Sorular yüklenemedi. FastAPI sunucusunun çalıştığını kontrol et.
            </div>
          )}
        </div>
      </aside>

      <section className="space-y-5">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              JavaScript · Python · C#
            </p>
          </div>

          <div className="px-6 py-10 sm:px-10 sm:py-14">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                Kodlamayı matematikle öğren
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Formülü düşün.
                <br />
                <span className="text-[var(--brand)]">Kodla çöz.</span>
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                MathForge, matematik problemlerini kod yazarak çözmeni sağlar.
                Başlangıç soruları değişken, fonksiyon ve return gibi temel
                kavramları adım adım öğretir.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--on-brand)] hover:bg-[var(--brand-hover)]"
                >
                  İlk soruya başla
                </button>

                <Link
                  href="/learn"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-sm font-semibold hover:border-[var(--brand)]"
                >
                  Temelleri öğren
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Öğrenme konuları
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <p className="text-sm font-semibold">{topic.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                    {topic.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Desteklenen diller
            </p>

            <div className="mt-4 space-y-3">
              {[
                ["JS", "JavaScript", "Web geliştirmede kullanılan esnek dil"],
                ["PY", "Python", "Okunabilir ve başlangıç dostu"],
                ["C#", "C#", "Güçlü tip sistemi ve modern sözdizimi"],
              ].map(([shortName, name, description]) => (
                <div
                  key={name}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand)] text-xs font-black text-[var(--on-brand)]">
                    {shortName}
                  </span>

                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
