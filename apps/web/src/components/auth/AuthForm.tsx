import { useState, type FormEvent } from "react";
import type { User } from "@repo/types";
import { apiFetch, getErrorMessage } from "../../lib/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  onNavigate: (path: string) => void;
};

type AuthResponse = {
  user: User;
};

function AuthForm({ mode, onNavigate }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch<AuthResponse>(
        isRegister ? "/auth/register" : "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(
            isRegister ? { name: name.trim(), email, password } : { email, password },
          ),
        },
      );
      onNavigate("/");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to sign in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-stone-50 text-slate-900 md:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative isolate flex min-h-80 flex-col justify-between overflow-hidden bg-[#153f34] px-7 py-7 text-white md:min-h-screen md:px-12 md:py-10 lg:px-20">
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[40px_40px]" />
        <a className="flex w-fit items-center gap-3 text-lg font-bold tracking-tight" href="/" onClick={(event) => {
          event.preventDefault();
          onNavigate("/");
        }}>
          <span className="grid size-9 place-items-center border border-white/40 font-mono text-xs text-orange-300" aria-hidden="true">&lt;/&gt;</span>
          <span>SyncCode</span>
        </a>
        <div className="my-12 max-w-lg md:my-16">
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">A shared space to build</p>
          <h1 className="mb-5 max-w-md font-serif text-5xl leading-[1.04] font-normal tracking-tight text-white sm:text-6xl">Good ideas get better together.</h1>
          <p className="max-w-sm text-sm leading-7 text-emerald-50/75">Bring your team into one workspace and make progress, line by line.</p>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-emerald-100/60">01 / COLLABORATE</span>
      </aside>

      <section className="flex min-h-140 flex-col justify-center px-7 py-12 sm:px-12 md:min-h-screen md:px-16 lg:px-24" aria-labelledby="auth-title">
        <div className="mx-auto w-full max-w-md">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">{isRegister ? "Get started" : "Welcome back"}</p>
          <h2 id="auth-title" className="mb-3 font-serif text-3xl leading-tight font-normal tracking-tight text-slate-900 sm:text-4xl">{isRegister ? "Create your account" : "Sign in to SyncCode"}</h2>
          <p className="text-sm leading-6 text-slate-500">
            {isRegister
              ? "Set up your account to start a workspace."
              : "Pick up where your team left off."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            {isRegister && (
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                <span>Name</span>
                <input
                  className="h-12 rounded border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                  autoComplete="name"
                  maxLength={100}
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
            )}
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Email</span>
              <input
                className="h-12 rounded border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Password</span>
              <input
                className="h-12 rounded border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 8 : 1}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            {error && <p className="rounded border-l-4 border-orange-600 bg-orange-50 px-4 py-3 text-sm leading-5 text-orange-900" role="alert">{error}</p>}
            <button className="mt-1 inline-flex h-12 items-center justify-center rounded bg-orange-700 px-5 text-sm font-semibold text-white transition hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? isRegister ? "Creating account..." : "Signing in..."
                : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "New to SyncCode?"}{" "}
            <a
              className="font-semibold text-emerald-800 underline decoration-emerald-800/40 underline-offset-4 hover:text-emerald-950"
              href={isRegister ? "/login" : "/register"}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(isRegister ? "/login" : "/register");
              }}
            >
              {isRegister ? "Sign in" : "Create an account"}
            </a>
          </p>
        </div>
        <span className="mx-auto mt-12 font-mono text-[10px] tracking-widest text-slate-400">SYNCCode · PRIVATE WORKSPACES</span>
      </section>
    </main>
  );
}

export default AuthForm;