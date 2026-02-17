"use client";

import Editor from "@monaco-editor/react";

interface ReadOnlyEditorProps {
  code: string;
  language: string;
}

export function ReadOnlyEditor({ code, language }: ReadOnlyEditorProps) {
  // Map language ID to Monaco language
  const getLanguage = (id: string) => {
    switch (id) {
        case "63": return "javascript";
        case "71": return "python";
        case "54": return "cpp";
        case "62": return "java";
        default: return "plaintext";
    }
  };

  return (
    <Editor
      height="100%"
      language={getLanguage(language)}
      theme="vs-dark"
      value={code}
      options={{
        readOnly: true,
        minimap: { enabled: true },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 20 },
      }}
    />
  );
}
