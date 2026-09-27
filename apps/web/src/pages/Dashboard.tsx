import { useEffect, useState } from "react";
import type { User, Workspace } from "@repo/types";
import CreateWorkspaceForm from "../components/workspace/CreateWorkspaceForm";
import WorkspaceList from "../components/workspace/WorkspaceList";
import { ApiError, apiFetch, getErrorMessage } from "../lib/api";

type DashboardProps = {
  onNavigate: (path: string) => void;
};

type AuthResponse = { user: User };
type WorkspaceListResponse = { workspaces: Workspace[] };

function Dashboard({ onNavigate }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWorkspaceLoadError, setHasWorkspaceLoadError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);
      setHasWorkspaceLoadError(false);
      let didLoadUser = false;
      try {
        const authResponse = await apiFetch<AuthResponse>("/auth/me");
        if (!isCurrent) return;
        setUser(authResponse.user);
        didLoadUser = true;

        const workspaceResponse = await apiFetch<WorkspaceListResponse>("/workspaces");
        if (!isCurrent) return;
        setWorkspaces(workspaceResponse.workspaces);
      } catch (loadError) {
        if (!isCurrent) return;
        if (loadError instanceof ApiError && loadError.status === 401) {
          onNavigate("/login");
          return;
        }
        if (didLoadUser) setHasWorkspaceLoadError(true);
        setError(getErrorMessage(loadError, "Unable to load your dashboard."));
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      isCurrent = false;
    };
  }, [onNavigate, refreshKey]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setError(null);
    try {
      await apiFetch<{ message: string }>("/auth/logout", { method: "POST" });
      onNavigate("/login");
    } catch (logoutError) {
      setError(getErrorMessage(logoutError, "Unable to log out. Please try again."));
    } finally {
      setIsLoggingOut(false);
    }
  }

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
        <div className="flex items-center gap-3 sm:gap-5">
          {user && <span className="grid max-w-36 text-right text-xs font-semibold leading-5 text-slate-800 sm:max-w-none sm:text-sm">{user.name}<small className="truncate text-[11px] font-normal text-slate-500">{user.email}</small></span>}
          <button className="inline-flex h-10 items-center justify-center rounded border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm" disabled={isLoggingOut} onClick={handleLogout} type="button">
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-9 flex items-end justify-between sm:mb-11">
          <div>
            <p className="mb-2 font-mono text-[10px] font-semibold tracking-[0.16em] text-emerald-800">YOUR TEAM SPACE</p>
            <h1 className="mb-2 font-serif text-4xl leading-tight font-normal tracking-tight text-slate-900 sm:text-5xl">My Workspaces</h1>
            <p className="text-sm leading-6 text-slate-500">A good place to get something started.</p>
          </div>
          <span className="hidden pb-1 font-mono text-[11px] tracking-wider text-slate-400 sm:block">SYNC / 03</span>
        </div>

        {error && <p className="mb-6 rounded border-l-4 border-orange-600 bg-orange-50 px-4 py-3 text-sm leading-5 text-orange-900" role="alert">{error}</p>}

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <section className="min-w-0" aria-labelledby="workspace-heading">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <h2 id="workspace-heading" className="text-base font-bold text-slate-900">Workspaces</h2>
              {!isLoading && <span className="font-mono text-[11px] text-slate-500">{workspaces.length.toString().padStart(2, "0")}</span>}
            </div>
            {isLoading ? (
              <p className="py-6 text-sm text-slate-500" role="status">Loading your workspaces...</p>
            ) : hasWorkspaceLoadError && workspaces.length === 0 ? (
              <p className="py-6 text-sm text-slate-500">Your workspace list could not be loaded.</p>
            ) : workspaces.length > 0 ? (
              <WorkspaceList onOpen={(id) => onNavigate(`/workspaces/${id}`)} workspaces={workspaces} />
            ) : (
              <div className="grid min-h-56 content-center justify-items-start py-7">
                <span className="mb-4 grid size-10 place-items-center border border-emerald-800/35 font-mono text-xl text-emerald-800" aria-hidden="true">+</span>
                <h3 className="mb-2 text-sm font-bold text-slate-900">Your first workspace starts here</h3>
                <p className="max-w-sm text-sm leading-6 text-slate-500">Create a workspace to bring your project into SyncCode.</p>
              </div>
            )}
          </section>

          <aside className="border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="create-heading">
            <p className="mb-2 font-mono text-[10px] font-semibold tracking-[0.14em] text-emerald-800">MAKE A PLACE FOR IT</p>
            <h2 id="create-heading" className="text-base font-bold text-slate-900">New workspace</h2>
            <p className="mb-5 mt-2 text-sm leading-6 text-slate-500">Start a shared space for your next idea.</p>
            <CreateWorkspaceForm onCreated={() => setRefreshKey((key) => key + 1)} />
          </aside>
        </div>
      </div>
      <footer className="flex justify-between border-t border-slate-200 px-5 py-4 font-mono text-[10px] tracking-wider text-slate-400 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]"><span>SYNCCode</span><span>BUILD TOGETHER</span></footer>
    </main>
  );
}

export default Dashboard;