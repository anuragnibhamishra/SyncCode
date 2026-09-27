import type { Workspace } from "@repo/types";
import WorkspaceCard from "./WorkspaceCard";

type WorkspaceListProps = {
  workspaces: Workspace[];
  onOpen: (id: string) => void;
};

function WorkspaceList({ workspaces, onOpen }: WorkspaceListProps) {
  return (
    <div className="grid gap-2.5 pt-4">
      {workspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} onOpen={onOpen} workspace={workspace} />
      ))}
    </div>
  );
}

export default WorkspaceList;