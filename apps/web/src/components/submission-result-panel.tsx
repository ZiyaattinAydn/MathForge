import type {
  SubmissionResponse,
  SubmissionStatus,
} from "@/types/mathforge";

const statusLabels: Record<SubmissionStatus, string> = {
  accepted: "Çözüm kabul edildi",
  wrong_answer: "Bazı testler başarısız",
  compilation_error: "Derleme hatası",
  runtime_error: "Çalışma zamanı hatası",
  time_limit_exceeded: "Süre sınırı aşıldı",
  internal_error: "Kod çalıştırma hatası",
};

const statusStyles: Record<SubmissionStatus, string> = {
  accepted:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  wrong_answer:
    "border-amber-500/30 bg-amber-500/10 text-amber-300",
  compilation_error:
    "border-red-500/30 bg-red-500/10 text-red-300",
  runtime_error:
    "border-red-500/30 bg-red-500/10 text-red-300",
  time_limit_exceeded:
    "border-orange-500/30 bg-orange-500/10 text-orange-300",
  internal_error:
    "border-red-500/30 bg-red-500/10 text-red-300",
};

type SubmissionResultPanelProps = {
  result: SubmissionResponse | null;
  error: string | null;
  isSubmitting: boolean;
};

export function SubmissionResultPanel({
  result,
  error,
  isSubmitting,
}: SubmissionResultPanelProps) {
  if (isSubmitting) {
    return (
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--text-secondary)]">
        Kodun çalıştırılıyor ve test ediliyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--text-secondary)]">
        Kodunu çalıştırdığında test sonuçları burada gösterilecek.
      </div>
    );
  }

  return (
    <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
      <div
        className={`rounded-lg border p-3 ${statusStyles[result.status]}`}
      >
        <p className="font-bold">{statusLabels[result.status]}</p>

        <p className="mt-1 text-sm">
          {result.passed_tests}/{result.total_tests} test başarılı
        </p>
      </div>

      {result.message ? (
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5 text-red-300">
          {result.message}
        </pre>
      ) : null}

      {result.results.length > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.results.map((testResult) => (
            <div
              key={testResult.index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">
                  Test {testResult.index + 1}
                </span>

                <span
                  className={
                    testResult.passed
                      ? "text-xs font-bold text-emerald-300"
                      : "text-xs font-bold text-red-300"
                  }
                >
                  {testResult.passed ? "Başarılı" : "Başarısız"}
                </span>
              </div>

              {!testResult.passed && testResult.actual ? (
                <p className="mt-2 break-all font-mono text-xs text-[var(--text-secondary)]">
                  Üretilen sonuç: {testResult.actual}
                </p>
              ) : null}

              {testResult.error ? (
                <p className="mt-2 break-all text-xs text-red-300">
                  {testResult.error}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
        {result.execution_time_ms !== null ? (
          <span>Süre: {result.execution_time_ms} ms</span>
        ) : null}

        {result.memory_kb !== null ? (
          <span>Bellek: {result.memory_kb} KB</span>
        ) : null}
      </div>
    </section>
  );
}
