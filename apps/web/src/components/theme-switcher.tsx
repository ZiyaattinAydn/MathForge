"use client";

import { useEffect, useState } from "react";

type Theme = "molten" | "arcane" | "terminal";

const themes: Array<{
  id: Theme;
  name: string;
  description: string;
  swatchClass: string;
}> = [
  {
    id: "molten",
    name: "Molten Forge",
    description: "Amber ve erimiş metal",
    swatchClass: "bg-[#f59e0b]",
  },
  {
    id: "arcane",
    name: "Arcane Math",
    description: "Mor ve cyan",
    swatchClass: "bg-[#8b5cf6]",
  },
  {
    id: "terminal",
    name: "Terminal Forge",
    description: "Yeşil terminal",
    swatchClass: "bg-[#4ade80]",
  },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (selectedTheme === null) {
      return;
    }

    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem("mathforge-theme", selectedTheme);
  }, [selectedTheme]);

  function chooseTheme(theme: Theme) {
    setSelectedTheme(theme);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--brand)]"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true">◐</span>
        <span className="hidden sm:inline">Tema</span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl"
        >
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[var(--surface-elevated)]"
              onClick={() => chooseTheme(theme.id)}
            >
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${theme.swatchClass}`}
                aria-hidden="true"
              />

              <span>
                <span className="block text-sm font-semibold text-[var(--text-primary)]">
                  {theme.name}
                </span>

                <span className="block text-xs text-[var(--text-secondary)]">
                  {theme.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
