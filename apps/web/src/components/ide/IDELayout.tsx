import { useState } from "react";

import FileExplorer from "./FileExplorer";
import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import { mockFiles } from "./mockFiles";


export default function IDELayout() {
  const [files, setFiles] = useState(mockFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>("index-js");
  const [openFileIds, setOpenFileIds] = useState<string[]>(["index-js"]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const activeFile = files.find((file) => file.id === activeFileId && file.type === "file") ?? null;

  function handleFileSelect(fileId: string) {
    setActiveFileId(fileId);
    setOpenFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId],
    );
  }

  function handleFileChange(fileId: string, content: string) {
    setFiles((current) => current.map((file) =>
      file.id === fileId ? { ...file, content } : file,
    ));
  }

  function handleCreateFile(parentId: string | null, name: string) {
    const extension = name.split(".").pop()?.toLowerCase();
    const languageByExtension: Record<string, string> = {
      cjs: "javascript",
      css: "css",
      html: "html",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      md: "markdown",
      mjs: "javascript",
      ts: "typescript",
      tsx: "typescript",
    };
    const newFile = {
      id: crypto.randomUUID(),
      name,
      type: "file" as const,
      parentId,
      language: languageByExtension[extension ?? ""] ?? "plaintext",
      content: "",
    };

    setFiles((current) => [...current, newFile]);
    setOpenFileIds((current) => [...current, newFile.id]);
    setActiveFileId(newFile.id);
  }

  function handleDeleteFile(fileId: string) {
    const file = files.find((item) => item.id === fileId);
    if (!file || file.type !== "file" || !window.confirm(`Delete ${file.name}?`)) {
      return;
    }

    const remainingFileIds = openFileIds.filter((id) => id !== fileId);
    setFiles((current) => current.filter((item) => item.id !== fileId));
    setOpenFileIds(remainingFileIds);
    if (activeFileId === fileId) {
      setActiveFileId(remainingFileIds.at(-1) ?? null);
    }
  }

  function handleCloseFile(fileId: string) {
    const remainingFileIds = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(remainingFileIds);
    if (activeFileId === fileId) {
      setActiveFileId(remainingFileIds.at(-1) ?? null);
    }
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      {/* Topbar */}
      <header className="h-12 border-b border-slate-800 flex items-center px-4">
        <span className="font-semibold">SyncCode</span>
      </header>

      {/* Main IDE */}
      <div className="flex flex-1 min-h-0">
        {/* File Explorer */}
        <aside className="w-60 border-r border-slate-800">
          <FileExplorer
            activeFileId={activeFileId}
            files={files}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onFileSelect={handleFileSelect}
            onFolderSelect={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
          />
        </aside>

        {/* Editor */}
        <main className="flex-1 min-w-0 flex flex-col">
          <EditorTabs
            activeFileId={activeFileId}
            files={files}
            openFileIds={openFileIds}
            onSelectFile={setActiveFileId}
            onCloseFile={handleCloseFile}
          />
          <div className="flex-1 min-h-0">
            <CodeEditor
              file={activeFile}
              onChange={(content) => activeFile && handleFileChange(activeFile.id, content)}
            />
          </div>
        </main>

        {/* Future collaboration panel */}
        <aside className="w-64 border-l border-slate-800">
          <div className="p-3 text-sm text-slate-500">
            Collaboration
          </div>
        </aside>
      </div>

      {/* Terminal */}
      <section className="h-40 border-t border-slate-800">
        <div className="p-3 text-sm text-slate-500">
          Terminal
        </div>
      </section>
    </div>
  );
}