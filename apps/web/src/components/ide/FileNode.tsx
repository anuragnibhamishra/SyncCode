import {
  IconChevronDown,
  IconChevronRight,
  IconFile,
  IconFolder,
  IconFolderOpen,
  IconTrash,
} from "@tabler/icons-react";

import type { FileNode as FileNodeType } from "./types";

type Props = {
  node: FileNodeType;
  isOpen?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  onDelete?: () => void;
};

export default function FileNode({
  node,
  isOpen = false,
  isSelected = false,
  onClick,
  onDelete,
}: Props) {
  const isFolder = node.type === "folder";

  return (
    <div className="group flex items-center">
      <button
        aria-pressed={isSelected}
        className={`flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1.5 text-left text-sm transition ${
          isSelected
            ? "bg-slate-800 text-white"
            : "text-slate-300 hover:bg-slate-800/70"
        }`}
        onClick={onClick}
        type="button"
      >
        {isFolder ? (
          <>
            {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            {isOpen ? <IconFolderOpen size={16} className="shrink-0 text-sky-300" /> : <IconFolder size={16} className="shrink-0 text-sky-300" />}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <IconFile size={16} className="shrink-0 text-slate-400" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {onDelete && (
        <button
          aria-label={`Delete ${node.name}`}
          className="mr-1 rounded p-1 text-slate-500 opacity-0 transition hover:bg-rose-950 hover:text-rose-300 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-rose-500 group-hover:opacity-100"
          onClick={onDelete}
          title={`Delete ${node.name}`}
          type="button"
        >
          <IconTrash size={14} />
        </button>
      )}
    </div>
  );
}