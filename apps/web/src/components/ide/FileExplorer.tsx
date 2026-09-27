import { IconFilePlus, IconFiles } from "@tabler/icons-react";

import type { FileNode as FileNodeType } from "./types";
import FileTree from "./FileTree";

type Props = {
  files: FileNodeType[];
  activeFileId: string | null;
  selectedFolderId: string | null;
  onFileSelect: (fileId: string) => void;
  onFolderSelect: (folderId: string) => void;
  onCreateFile: (parentId: string | null, name: string) => void;
  onDeleteFile: (fileId: string) => void;
};

export default function FileExplorer({
  files,
  activeFileId,
  selectedFolderId,
  onFileSelect,
  onFolderSelect,
  onCreateFile,
  onDeleteFile,
}: Props) {
  function handleCreateFile() {
    const enteredName = window.prompt("New file name");
    const name = enteredName?.trim();
    if (name) {
      onCreateFile(selectedFolderId, name);
    }
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
          className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-500"
          onClick={handleCreateFile}
          title="New file"
          type="button"
        >
          <IconFilePlus size={16} />
        </button>
      </div>

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