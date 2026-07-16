"use client";

import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import type { Extension } from "@codemirror/state";
import { csharp } from "@replit/codemirror-lang-csharp";
import dynamic from "next/dynamic";

import type { Language } from "@/types/mathforge";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});

const languageExtensions: Record<Language, Extension> = {
  javascript: javascript(),
  python: python(),
  csharp: csharp(),
};

type CodeEditorProps = {
  language: Language;
  value: string;
  onChange: (value: string) => void;
};

export function CodeEditor({
  language,
  value,
  onChange,
}: CodeEditorProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#0d1117]">
      <CodeMirror
        key={language}
        value={value}
        height="430px"
        minHeight="430px"
        theme="dark"
        extensions={[languageExtensions[language]]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
        }}
      />
    </div>
  );
}
