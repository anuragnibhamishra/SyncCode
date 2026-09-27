import { useState, type FormEvent } from "react";
import { IconFilePlus, IconFiles } from "@tabler/icons-react";

import type { FileNode as FileNodeType } from "./types";
import FileTree from "./FileTree";

type Props = {
  files: FileNodeType[];
  activeFileId: string | null;
  selectedFolderId: string | null;
  isLoading: boolean;
  onFileSelect: (fileId: string) => void;
  onFolderSelect: (folderId: string) => void;
  onCreateFile: (parentId: string | null, name: string) => void;
  onDeleteFile: (fileId: string) => void;
};

export default function FileExplorer({
  files,
  activeFileId,
  selectedFolderId,
  isLoading,
  onFileSelect,
  onFolderSelect,
  onCreateFile,
  onDeleteFile,
}: Props) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  function handleCreateFile() {
    setNewFileName("");
    setIsCreatingFile(true);
  }

  function submitNewFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newFileName.trim();
    if (!name) return;

    onCreateFile(selectedFolderId, name);
    setIsCreatingFile(false);
    setNewFileName("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 items-center justify-between border-b border-slate-800 px-3">
        <div className="flex items-center gap-2 text-slate-400">
          <IconFiles size={16} />
          <span className="text-xs font-semibold uppercase tracking-wide">Explorer</span>
        </div>
        <button
          aria-label="New file"
          className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleCreateFile}
          disabled={isLoading}
          title="New file"
          type="button"
        >
          <IconFilePlus size={16} />
        </button>
      </div>

      {isCreatingFile && (
        <form className="flex gap-1 border-b border-slate-800 p-2" onSubmit={submitNewFile}>
          <input
            aria-label="New file name"
            autoFocus
            className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
            onChange={(event) => setNewFileName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsCreatingFile(false);
            }}
            placeholder="filename.ext"
            value={newFileName}
          />
          <button
            aria-label="Create file"
            className="rounded px-2 text-xs text-sky-300 hover:bg-slate-800 disabled:opacity-40"
            disabled={!newFileName.trim()}
            type="submit"
          >
            Add
          </button>
          <button
            aria-label="Cancel new file"
            className="rounded px-2 text-xs text-slate-400 hover:bg-slate-800"
            onClick={() => setIsCreatingFile(false)}
            type="button"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto">
        <FileTree
          activeFileId={activeFileId}
          files={files}
          onDeleteFile={onDeleteFile}
          onFileSelect={onFileSelect}
          onFolderSelect={onFolderSelect}
          selectedFolderId={selectedFolderId}
        />
      </div>
    </div>
  );
}