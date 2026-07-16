import Link from "next/link";

import { ThemeSwitcher } from "@/components/theme-switcher";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--header-background)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-sm font-black text-[var(--on-brand)]"
              aria-hidden="true"
            >
              MF
            </span>

            <span>
              <span className="text-[var(--text-primary)]">Math</span>
              <span className="text-[var(--brand)]">Forge</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            >
              Sorular
            </Link>

            <Link
              href="/learn"
              className="rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            >
              Öğren
            </Link>
          </nav>
        </div>

        <ThemeSwitcher />
      </div>
    </header>
  );
}
