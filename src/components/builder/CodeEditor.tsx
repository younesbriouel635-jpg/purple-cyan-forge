import { useRef, useCallback, useEffect } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
}

const CodeEditor = ({ code, onChange }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (!value) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange(value);
      }, 2500);
    },
    [onChange]
  );

  // Sync external code changes into the editor
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getValue() !== code) {
      editor.setValue(code);
    }
  }, [code]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={code}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 16 },
        renderLineHighlight: "gutter",
        scrollbar: { verticalScrollbarSize: 6 },
      }}
    />
  );
};

export default CodeEditor;
