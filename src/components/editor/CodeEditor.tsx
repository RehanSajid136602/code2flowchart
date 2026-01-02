'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { useLogicStore } from '@/store/useLogicStore';

export default function CodeEditor() {
  const { code, setCode } = useLogicStore();

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a]">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          beforeMount={(monaco) => {
            // Disable typescript validation/errors
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
            });
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 20 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden'
            },
            renderLineHighlight: 'all',
            fontFamily: 'var(--font-geist-mono)',
          }}
        />
      </div>
    </div>
  );
}
