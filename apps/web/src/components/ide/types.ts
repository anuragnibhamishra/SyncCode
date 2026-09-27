export type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  language?: string;
  content?: string;
};