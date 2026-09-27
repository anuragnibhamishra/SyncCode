import { IconX } from "@tabler/icons-react";

import type { FileNode } from "./types";

type Props = {
  files: FileNode[];
  openFileIds: string[];
  activeFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
};

export default function EditorTabs({
  files,
  openFileIds,
  activeFileId,
  onSelectFile,
  onCloseFile,
}: Props) {
  return (
    <div className="flex h-10 overflow-x-auto border-b border-slate-800 bg-slate-950">
      {openFileIds.map((fileId) => {
        const file = files.find((node) => node.id === fileId && node.type === "file");

        if (!file) {
          return null;
        }

        const isActive = file.id === activeFileId;

        return (
          <div
            key={file.id}
            className={`group flex min-w-fit items-center border-r border-slate-800 ${
              isActive ? "border-t-2 border-t-sky-400 bg-slate-900" : "border-t-2 border-t-transparent bg-slate-950"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectFile(file.id)}
              className={`h-full px-3 text-sm ${
                isActive
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {file.name}
            </button>

            <button
              type="button"
              onClick={() => onCloseFile(file.id)}
              className="mr-1 rounded p-1 text-slate-500 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 hover:bg-slate-800 hover:text-white"
              aria-label={`Close ${file.name}`}
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}