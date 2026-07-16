import Link from "next/link";

import { getLearningTopicSummaries } from "@/lib/mathforge-api";
import type { LearningTopicSummary } from "@/types/mathforge";

export const dynamic = "force-dynamic";

async function loadTopics(): Promise<LearningTopicSummary[]> {
  try {
    return await getLearningTopicSummaries();
  } catch {
    return [];
  }
}

export default async function LearnPage() {
  const topics = await loadTopics();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          MathForge Başlangıç Rehberi
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
          Kodlamanın temellerini
          <span className="text-[var(--brand)]"> adım adım öğren.</span>
        </h1>

        <p className="mt-5 max-w-3xl leading-7 text-[var(--text-secondary)]">
          Bu bölümde değişkenlerden fonksiyonlara kadar MathForge sorularını
          çözmek için gereken temel bilgileri kısa örneklerle öğreneceksin.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm font-semibold hover:border-[var(--brand)]"
        >
          ← Sorulara dön
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <article
              key={topic.id}
              id={topic.slug}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <span className="text-xs font-bold text-[var(--brand)]">
                {String(topic.order).padStart(2, "0")}
              </span>

              <h2 className="mt-2 text-xl font-bold">{topic.title}</h2>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {topic.summary}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-[var(--text-secondary)] sm:col-span-2">
            Öğretici içerikler yüklenemedi. FastAPI sunucusunun çalıştığını
            kontrol et.
          </div>
        )}
      </div>
    </main>
  );
}
