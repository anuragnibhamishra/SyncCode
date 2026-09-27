import { useEffect, useState } from "react";
import type { WorkspaceDetails } from "@repo/types";
import { ApiError, apiFetch, getErrorMessage } from "../lib/api";
import IDELayout from "../components/ide/IDELayout";

type WorkspacePageProps = {
  id: string;
  onNavigate: (path: string) => void;
};

type WorkspaceResponse = { workspace: WorkspaceDetails };

function WorkspacePage({ id, onNavigate }: WorkspacePageProps) {
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadWorkspace() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFetch<WorkspaceResponse>(`/workspaces/${encodeURIComponent(id)}`);
        if (isCurrent) setWorkspace(response.workspace);
      } catch (loadError) {
        if (!isCurrent) return;
        if (loadError instanceof ApiError && loadError.status === 401) {
          onNavigate("/login");
          return;
        }
        setError(getErrorMessage(loadError, "Unable to load this workspace."));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadWorkspace();
    return () => {
      isCurrent = false;
    };
  }, [id, onNavigate]);

  return (
    <main className="flex min-h-screen flex-col bg-stone-50 text-slate-900">
      <header className="flex min-h-19 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]">
        <a className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900" href="/" onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}>
          <span className="grid size-9 place-items-center border border-emerald-800/35 font-mono text-xs text-orange-700" aria-hidden="true">&lt;/&gt;</span>
          <span>SyncCode</span>
        </a>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 sm:px-4 sm:text-sm" onClick={() => onNavigate("/")} type="button">
          <span aria-hidden="true">←</span> Dashboard
        </button>
      </header>

      <section className="mx-auto w-full max-w-4xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <p className="mb-4 font-mono text-[10px] font-semibold tracking-[0.16em] text-emerald-800">WORKSPACE / OVERVIEW</p>
        {isLoading ? (
          <p className="py-6 text-sm text-slate-500" role="status">Loading workspace...</p>
        ) : error ? (
          <p className="rounded border-l-4 border-orange-600 bg-orange-50 px-4 py-3 text-sm leading-5 text-orange-900" role="alert">{error}</p>
        ) : workspace ? (
          <>
            <h1 className="mb-8 wrap-break-word font-serif text-4xl leading-tight font-normal tracking-tight text-slate-900 sm:text-5xl">{workspace.name}</h1>
            <dl className="grid border-t border-slate-200 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div className="min-w-0 border-b border-slate-200 py-5 sm:pr-5">
                <dt className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">Workspace ID</dt>
                <dd className="break-all font-mono text-xs leading-5 text-slate-800 sm:text-sm">{workspace.id}</dd>
              </div>
              <div className="border-b border-slate-200 py-5">
                <dt className="mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">Your role</dt>
                <dd className="m-0"><span className="inline-flex bg-emerald-100 px-2.5 py-1 font-mono text-[11px] text-emerald-900">{workspace.role}</span></dd>
              </div>
            </dl>
            <IDELayout />
          </>
        ) : null}
      </section>
      <footer className="flex justify-between border-t border-slate-200 px-5 py-4 font-mono text-[10px] tracking-wider text-slate-400 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]"><span>SYNCCode</span><span>BUILD TOGETHER</span></footer>
    </main>
  );
}

export default WorkspacePage;