import { useCallback, useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WorkspacePage from "./pages/Workspace";

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPathname);
    return () => window.removeEventListener("popstate", syncPathname);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  }, []);

  if (pathname === "/login") {
    return <Login onNavigate={navigate} />;
  }

  if (pathname === "/register") {
    return <Register onNavigate={navigate} />;
  }

  const workspaceMatch = pathname.match(/^\/workspaces\/([^/]+)$/);
  if (workspaceMatch) {
    return (
      <WorkspacePage id={workspaceMatch[1]} onNavigate={navigate} />
    );
  }

  return <Dashboard onNavigate={navigate} />;
}

export default App;
