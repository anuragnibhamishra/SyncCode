import { useState, type FormEvent } from "react";
import type { WorkspaceDetails, WorkspaceRole } from "@repo/types";
import { apiFetch, getErrorMessage } from "../../lib/api";

type CreateWorkspaceFormProps = {
  onCreated: () => void;
};

type CreateWorkspaceResponse = {
  workspace: Pick<WorkspaceDetails, "id" | "name" | "ownerId">;
  role: WorkspaceRole;
};

function CreateWorkspaceForm({ onCreated }: CreateWorkspaceFormProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const workspaceName = name.trim();
    if (!workspaceName) {
      setError("Enter a workspace name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await apiFetch<CreateWorkspaceResponse>("/workspaces", {
        method: "POST",
        body: JSON.stringify({ name: workspaceName }),
      });
      setName("");
      onCreated();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to create workspace. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor="workspace-name">
        <span>Workspace name</span>
        <input
          className="h-11 rounded border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
          id="workspace-name"
          maxLength={100}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Weekend project"
          required
          value={name}
        />
      </label>
      {error && <p className="rounded border-l-4 border-orange-600 bg-orange-50 px-3 py-2.5 text-sm leading-5 text-orange-900" role="alert">{error}</p>}
      <button className="inline-flex h-11 items-center justify-center gap-2 rounded bg-orange-700 px-4 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={isSubmitting || !name.trim()} type="submit">
        <span aria-hidden="true" className="text-lg leading-none">+</span>
        {isSubmitting ? "Creating..." : "Create workspace"}
      </button>
    </form>
  );
}

export default CreateWorkspaceForm;