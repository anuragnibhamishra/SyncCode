import { useEffect, useRef, useState } from "react";

import FileNode from "./FileNode";
import type { FileNode as FileNodeType } from "./types";

type Props = {
  files: FileNodeType[];
  activeFileId: string | null;
  selectedFolderId: string | null;
  onFileSelect: (fileId: string) => void;
  onFolderSelect: (folderId: string) => void;
  onDeleteFile: (fileId: string) => void;
};

export default function FileTree({
  files,
  activeFileId,
  selectedFolderId,
  onFileSelect,
  onFolderSelect,
  onDeleteFile,
}: Props) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const previousFileCount = useRef(files.length);

  useEffect(() => {
    if (files.length > previousFileCount.current && selectedFolderId) {
      setOpenFolders((current) => current.includes(selectedFolderId)
        ? current
        : [...current, selectedFolderId]);
    }
    previousFileCount.current = files.length;
  }, [files.length, selectedFolderId]);

  const rootNodes = files.filter(
    (node) => node.parentId === null,
  );

  function toggleFolder(folderId: string) {
    setOpenFolders((current) =>
      current.includes(folderId)
        ? current.filter((id) => id !== folderId)
        : [...current, folderId],
    );
  }

  function renderNode(nodeId: string) {
    const node = files.find((file) => file.id === nodeId);

    if (!node) {
      return null;
    }

    const isOpen = openFolders.includes(node.id);

    const children = files.filter(
      (file) => file.parentId === node.id,
    );

    return (
      <div key={node.id}>
        <FileNode
          node={node}
          isOpen={isOpen}
          isSelected={node.type === "folder"
            ? selectedFolderId === node.id
            : activeFileId === node.id}
          onDelete={node.type === "file" ? () => onDeleteFile(node.id) : undefined}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.id);
              onFolderSelect(node.id);
            } else {
              onFileSelect(node.id);
            }
          }}
        />

        {node.type === "folder" && isOpen && (
          <div className="ml-3 border-l border-slate-800/80 pl-2">
            {children.map((child) => renderNode(child.id))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2">
      {rootNodes.map((node) => renderNode(node.id))}
    </div>
  );
}