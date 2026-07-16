import Link from "next/link";

import {
  getLearningTopic,
  getLearningTopicSummaries,
} from "@/lib/mathforge-api";
import type {
  Language,
  LearningTopic,
} from "@/types/mathforge";

export const dynamic = "force-dynamic";

const languages: Array<{
  id: Language;
  label: string;
}> = [
  {
    id: "javascript",
    label: "JavaScript",
  },
  {
    id: "python",
    label: "Python",
  },
  {
    id: "csharp",
    label: "C#",
  },
];

async function loadTopics(): Promise<LearningTopic[]> {
  try {
    const summaries = await getLearningTopicSummaries();

    const results = await Promise.allSettled(
      summaries.map((topic) => getLearningTopic(topic.slug)),
    );

    return results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<LearningTopic> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value)
      .sort((first, second) => first.order - second.order);
  } catch {
    return [];
  }
}

export default async function LearnPage() {
  const topics = await loadTopics();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          MathForge Başlangıç Rehberi
        </p>

        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">
          Kodlamanın temellerini
          <span className="text-[var(--brand)]">
            {" "}
            matematikle öğren.
          </span>
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-[var(--text-secondary)]">
          Değişkenlerden döngülere kadar MathForge sorularını çözmek
          için gereken temel kavramları kısa açıklamalar, örnekler,
          püf noktaları ve mini alıştırmalarla öğren.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--on-brand)] hover:bg-[var(--brand-hover)]"
          >
            Sorulara başla
          </Link>

          <a
            href="#konular"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-3 text-sm font-semibold hover:border-[var(--brand)]"
          >
            Konuları incele
          </a>
        </div>
      </section>

      <nav
        id="konular"
        className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        aria-label="Öğretici konu listesi"
      >
        <p className="px-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
          Konular
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.slug}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {String(topic.order).padStart(2, "0")} · {topic.title}
            </a>
          ))}
        </div>
      </nav>

      {topics.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--border)] p-6 text-[var(--text-secondary)]">
          Öğretici içerikler yüklenemedi. FastAPI sunucusunun
          çalıştığını kontrol et.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {topics.map((topic) => (
            <article
              key={topic.id}
              id={topic.slug}
              className="scroll-mt-24 rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <header className="border-b border-[var(--border)] p-5 sm:p-7">
                <span className="text-xs font-black text-[var(--brand)]">
                  {String(topic.order).padStart(2, "0")}
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {topic.title}
                </h2>

                <p className="mt-3 max-w-3xl leading-7 text-[var(--text-secondary)]">
                  {topic.summary}
                </p>
              </header>

              <div className="space-y-7 p-5 sm:p-7">
                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                      Bu nedir?
                    </p>

                    <p className="mt-3 leading-7">
                      {topic.concept}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                      Neden önemlidir?
                    </p>

                    <p className="mt-3 leading-7">
                      {topic.why_it_matters}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold">
                    Üç dilde örnek
                  </h3>

                  <div className="mt-4 grid gap-4 xl:grid-cols-3">
                    {languages.map((language) => (
                      <div
                        key={language.id}
                        className="min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
                      >
                        <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-bold text-[var(--brand)]">
                          {language.label}
                        </div>

                        <pre className="overflow-x-auto p-4 text-sm leading-6 text-[var(--text-primary)]">
                          <code>
                            {topic.code_examples[language.id]}
                          </code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
                    <h3 className="font-bold text-emerald-300">
                      Küçük püf noktaları
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {topic.quick_tips.map((tip) => (
                        <li key={tip}>
                          <span className="mr-2 text-emerald-300">
                            ✓
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
                    <h3 className="font-bold text-red-300">
                      Yaygın hatalar
                    </h3>

                    <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {topic.common_mistakes.map((mistake) => (
                        <li key={mistake}>
                          <span className="mr-2 text-red-300">
                            ×
                          </span>
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                    Mini alıştırma
                  </p>

                  <p className="mt-3 font-semibold leading-7">
                    {topic.mini_exercise.prompt}
                  </p>

                  <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <summary className="cursor-pointer font-bold">
                      Cevabı göster
                    </summary>

                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                      {languages.map((language) => (
                        <div
                          key={language.id}
                          className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)]"
                        >
                          <p className="border-b border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--brand)]">
                            {language.label}
                          </p>

                          <pre className="overflow-x-auto p-3 text-sm leading-6">
                            <code>
                              {
                                topic.mini_exercise.answers[
                                  language.id
                                ]
                              }
                            </code>
                          </pre>
                        </div>
                      ))}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                      {topic.mini_exercise.explanation}
                    </p>
                  </details>
                </section>

                <div className="flex justify-end">
                  <a
                    href="#konular"
                    className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--brand)]"
                  >
                    ↑ Konu listesine dön
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
