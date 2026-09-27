import type { FileNode } from "./types";

export const mockFiles: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    parentId: null,
  },
  {
    id: "index-js",
    name: "index.js",
    type: "file",
    parentId: "src",
    language: "javascript",
    content: `function hello() {
  console.log("Hello from index.js");
}

hello();`,
  },
  {
    id: "app-js",
    name: "app.js",
    type: "file",
    parentId: "src",
    language: "javascript",
    content: `const app = {
  name: "SyncCode",
};

console.log(app);`,
  },
  {
    id: "readme",
    name: "README.md",
    type: "file",
    parentId: null,
    language: "markdown",
    content: `# SyncCode

Real-time multiplayer code editor.
`,
  },
];