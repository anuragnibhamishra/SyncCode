import type { Workspace } from "@repo/types";

type WorkspaceCardProps = {
  workspace: Workspace;
  onOpen: (id: string) => void;
};

function WorkspaceCard({ workspace, onOpen }: WorkspaceCardProps) {
  return (
    <button
      className="group grid min-h-20.5 w-full grid-cols-[44px_minmax(0,1fr)_24px] items-center gap-4 rounded border border-slate-200 bg-white px-4 py-3 text-left text-slate-900 transition hover:-translate-y-0.5 hover:border-emerald-800/40 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:px-5"
      onClick={() => onOpen(workspace.id)}
      type="button"
    >
      <span className="grid size-11 place-items-center bg-emerald-50 font-serif text-lg text-emerald-900" aria-hidden="true">{workspace.name.slice(0, 1).toUpperCase()}</span>
      <span className="grid min-w-0 gap-1">
        <strong className="truncate text-sm font-semibold">{workspace.name}</strong>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">{workspace.role.toLowerCase()}</span>
      </span>
      <span className="justify-self-end text-base text-orange-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
    </button>
  );
}

export default WorkspaceCard;