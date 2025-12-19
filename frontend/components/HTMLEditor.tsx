'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface HTMLEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  isFullscreen: boolean;
  onFullscreenChange: (fullscreen: boolean) => void;
}

export interface HTMLEditorRef {
  highlightRange: (startLine: number, startCol: number, endLine: number, endCol: number) => void;
  clearHighlights: () => void;
}

const HTMLEditor = forwardRef<HTMLEditorRef, HTMLEditorProps>(({ value, onChange, isFullscreen, onFullscreenChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        onFullscreenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  useImperativeHandle(ref, () => ({
    highlightRange: (startLine: number, startCol: number, endLine: number, endCol: number) => {
      if (monacoEditorRef.current) {
        const editor = monacoEditorRef.current;
        const model = editor.getModel();
        if (model) {
          // Clear existing decorations
          decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
          
          // Add new decoration
          const range = {
            startLineNumber: startLine,
            startColumn: startCol,
            endLineNumber: endLine,
            endColumn: endCol,
          };
          
          decorationsRef.current = editor.deltaDecorations([], [
            {
              range,
              options: {
                inlineClassName: 'bg-yellow-200',
                hoverMessage: { value: 'Selected element' },
              },
            },
          ]);
          
          // Scroll to the range
          editor.revealRangeInCenter(range);
        }
      }
    },
    clearHighlights: () => {
      if (monacoEditorRef.current) {
        decorationsRef.current = monacoEditorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    },
  }));

  return (
    <div
      ref={editorRef}
      className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'}`}
    >
      {isFullscreen && (
        <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white px-4 py-2 flex justify-between items-center z-10">
          <span className="font-semibold">HTML Editor - Press ESC to exit fullscreen</span>
          <button
            onClick={() => onFullscreenChange(false)}
            className="px-4 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
          >
            Exit Fullscreen
          </button>
        </div>
      )}
      <div className={`flex-1 ${isFullscreen ? 'pt-12' : ''}`} style={{ minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="html"
          value={value}
          onChange={onChange}
          onMount={(editor, monaco) => {
            monacoEditorRef.current = editor;
          }}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Editor...</p>
              </div>
            </div>
          }
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            acceptSuggestionOnEnter: 'on',
            snippetSuggestions: 'top',
            suggestSelection: 'first',
            wordBasedSuggestions: 'allDocuments',
            autoIndent: 'full',
            bracketPairColorization: { enabled: true },
            colorDecorators: true,
            contextmenu: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            folding: true,
            foldingStrategy: 'auto',
            showFoldingControls: 'always',
            links: true,
            matchBrackets: 'always',
            renderWhitespace: 'selection',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            stickyScroll: { enabled: true },
          }}
        />
      </div>
    </div>
  );
});

HTMLEditor.displayName = 'HTMLEditor';

export default HTMLEditor;

