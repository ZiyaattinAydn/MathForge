import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "MathForge",
  description: "Matematik problemlerini kod yazarak çöz.",
};

const themeScript = `
(() => {
  try {
    const savedTheme = localStorage.getItem("mathforge-theme");
    const validThemes = ["molten", "arcane", "terminal"];
    const theme = validThemes.includes(savedTheme) ? savedTheme : "molten";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "molten";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
