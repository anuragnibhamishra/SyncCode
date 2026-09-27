import { useCallback, useEffect, useRef, useState } from "react";
import { IconDeviceFloppy } from "@tabler/icons-react";
import type { WorkspaceFile } from "@repo/types";

import FileExplorer from "./FileExplorer";
import EditorTabs from "./EditorTabs";
import CodeEditor from "./CodeEditor";
import { apiFetch, getErrorMessage } from "../../lib/api";
import type { FileNode } from "./types";

type IDELayoutProps = {
  workspaceId: string;
};

type WorkspaceFilesResponse = { files: WorkspaceFile[] };
type WorkspaceFileResponse = { file: WorkspaceFile };

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

function toFileNode(file: WorkspaceFile): FileNode | null {
  if (file.type !== "file" && file.type !== "folder") {
    return null;
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return {
    id: file.id,
    name: file.name,
    type: file.type,
    parentId: file.parentId,
    content: file.content ?? "",
    language: file.type === "file"
      ? languageByExtension[extension] ?? "plaintext"
      : undefined,
  };
}

export default function IDELayout({ workspaceId }: IDELayoutProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [dirtyFileIds, setDirtyFileIds] = useState<string[]>([]);
  const [savingFileIds, setSavingFileIds] = useState<string[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [fileActionError, setFileActionError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editVersions = useRef(new Map<string, number>());
  const activeFile = files.find((file) => file.id === activeFileId && file.type === "file") ?? null;

  useEffect(() => {
    let isCurrent = true;

    async function loadFiles() {
      setIsLoadingFiles(true);
      setWorkspaceError(null);
      setFiles([]);
      setActiveFileId(null);
      setOpenFileIds([]);
      setSelectedFolderId(null);
      setDirtyFileIds([]);

      try {
        const response = await apiFetch<WorkspaceFilesResponse>(
          `/workspaces/${encodeURIComponent(workspaceId)}/files`,
        );
        if (!isCurrent) return;
        setFiles(response.files.flatMap((file) => {
          const node = toFileNode(file);
          return node ? [node] : [];
        }));
      } catch (loadError) {
        if (!isCurrent) return;
        setWorkspaceError(getErrorMessage(loadError, "Unable to load workspace files."));
      } finally {
        if (isCurrent) setIsLoadingFiles(false);
      }
    }

    void loadFiles();
    return () => {
      isCurrent = false;
    };
  }, [workspaceId]);

  const saveFile = useCallback(async (file: FileNode) => {
    const version = editVersions.current.get(file.id) ?? 0;
    setSavingFileIds((current) => current.includes(file.id) ? current : [...current, file.id]);
    setSaveError(null);

    try {
      await apiFetch<WorkspaceFileResponse>(`/files/${encodeURIComponent(file.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ content: file.content ?? "" }),
      });

      if (editVersions.current.get(file.id) === version) {
        setDirtyFileIds((current) => current.filter((id) => id !== file.id));
      }
    } catch (saveFailure) {
      setSaveError(getErrorMessage(saveFailure, "Unable to save this file."));
    } finally {
      setSavingFileIds((current) => current.filter((id) => id !== file.id));
    }
  }, []);

  useEffect(() => {
    if (dirtyFileIds.length === 0) return;

    const timeoutId = window.setTimeout(() => {
      for (const fileId of dirtyFileIds) {
        const file = files.find((item) => item.id === fileId);
        if (file) void saveFile(file);
      }
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [dirtyFileIds, files, saveFile]);

  const saveActiveFile = useCallback(() => {
    if (!activeFile || !dirtyFileIds.includes(activeFile.id)) return;
    void saveFile(activeFile);
  }, [activeFile, dirtyFileIds, saveFile]);

  useEffect(() => {
    function handleSaveShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveActiveFile();
      }
    }

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [saveActiveFile]);

  function handleFileSelect(fileId: string) {
    setActiveFileId(fileId);
    setOpenFileIds((current) =>
      current.includes(fileId) ? current : [...current, fileId],
    );
  }

  function handleFileChange(fileId: string, content: string) {
    editVersions.current.set(fileId, (editVersions.current.get(fileId) ?? 0) + 1);
    setFiles((current) => current.map((file) =>
      file.id === fileId ? { ...file, content } : file));
    setDirtyFileIds((current) => current.includes(fileId) ? current : [...current, fileId]);
    setSaveError(null);
  }

  async function handleCreateFile(parentId: string | null, name: string) {
    setFileActionError(null);
    try {
      const response = await apiFetch<WorkspaceFileResponse>(
        `/workspaces/${encodeURIComponent(workspaceId)}/files`,
        {
          method: "POST",
          body: JSON.stringify({ name, parentId }),
        },
      );
      const newFile = toFileNode(response.file);
      if (!newFile || newFile.type !== "file") {
        throw new Error("The API returned an invalid file.");
      }
      setFiles((current) => [...current, newFile]);
      setOpenFileIds((current) => current.includes(newFile.id) ? current : [...current, newFile.id]);
      setActiveFileId(newFile.id);
    } catch (createError) {
      setFileActionError(getErrorMessage(createError, "Unable to create this file."));
    }
  }

  async function handleDeleteFile(fileId: string) {
    const file = files.find((item) => item.id === fileId);
    if (!file || file.type !== "file" || !window.confirm(`Delete ${file.name}?`)) {
      return;
    }

    setFileActionError(null);
    try {
      await apiFetch<{ message: string }>(`/files/${encodeURIComponent(fileId)}`, {
        method: "DELETE",
      });
      const remainingFileIds = openFileIds.filter((id) => id !== fileId);
      setFiles((current) => current.filter((item) => item.id !== fileId));
      setOpenFileIds(remainingFileIds);
      setDirtyFileIds((current) => current.filter((id) => id !== fileId));
      if (activeFileId === fileId) {
        setActiveFileId(remainingFileIds.at(-1) ?? null);
      }
    } catch (deleteError) {
      setFileActionError(getErrorMessage(deleteError, "Unable to delete this file."));
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
      <header className="flex h-12 items-center justify-between border-b border-slate-800 px-4">
        <span className="font-semibold">SyncCode</span>
        <div className="flex items-center gap-3">
          <span className="max-w-xs truncate text-xs text-slate-400" role={workspaceError || fileActionError || saveError ? "alert" : "status"}>
            {workspaceError ?? fileActionError ?? saveError ?? (
              isLoadingFiles ? "Loading files..." :
                activeFile && savingFileIds.includes(activeFile.id) ? "Saving..." :
                  activeFile && dirtyFileIds.includes(activeFile.id) ? "Unsaved changes" :
                    activeFile ? "Saved" : ""
            )}
          </span>
          <button
            className="inline-flex h-8 items-center gap-2 rounded border border-slate-700 px-3 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!activeFile || !dirtyFileIds.includes(activeFile.id) || savingFileIds.includes(activeFile.id)}
            onClick={saveActiveFile}
            type="button"
          >
            <IconDeviceFloppy size={15} />
            Save
          </button>
        </div>
      </header>

      {/* Main IDE */}
      <div className="flex flex-1 min-h-0">
        {/* File Explorer */}
        <aside className="w-60 border-r border-slate-800">
          <FileExplorer
            activeFileId={activeFileId}
            files={files}
            isLoading={isLoadingFiles}
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