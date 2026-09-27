import Editor from "@monaco-editor/react";
import type { FileNode } from "./types";

type Props = {
  file: FileNode | null;
  onChange: (content: string) => void;
};

export default function CodeEditor({ file, onChange }: Props) {
  if (!file) {
    return (
      <div className="grid h-full place-items-center bg-slate-950 px-6 text-center text-sm text-slate-500">
        <p>Select a file or create one to start editing.</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={file.language ?? "plaintext"}
      value={file.content ?? ""}
      onChange={(content) => onChange(content ?? "")}
      theme="vs-dark"
      options={{
        minimap: {
          enabled: true,
        },
        automaticLayout: true,
      }}
    />
  );
}