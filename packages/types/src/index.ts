export interface User {
  id: string;
  name: string;
  email: string;
}

export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface Workspace {
  id: string;
  name: string;
  role: WorkspaceRole;
}

export interface WorkspaceDetails extends Workspace {
  ownerId: string;
}