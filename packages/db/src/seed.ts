import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { db } from "./index";
import {
    files,
    users,
    workspaceMembers,
    workspaces,
} from "./schema";

dotenv.config({
    path: "../../.env",
});

async function seed() {
    console.log("🌱 Seeding database...");

    // Create user
    const [user] = await db
        .insert(users)
        .values({
            email: "anurag@example.com",
            name: "Anurag",
        })
        .onConflictDoNothing()
        .returning();

    // If user already exists, fetch it
    const existingUser =
        user ??
        (
            await db
                .select()
                .from(users)
                .where(eq(users.email, "anurag@example.com"))
                .limit(1)
        )[0];

    if (!existingUser) {
        throw new Error("Failed to create/find user");
    }

    // Create workspace
    const [workspace] = await db
        .insert(workspaces)
        .values({
            name: "Demo Workspace",
            ownerId: existingUser.id,
        })
        .returning();

    // Add owner as workspace member
    await db.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: existingUser.id,
        role: "OWNER",
    });

    // Create src folder
    const [srcFolder] = await db
        .insert(files)
        .values({
            workspaceId: workspace.id,
            name: "src",
            type: "folder",
        })
        .returning();

    // Create index.js
    await db.insert(files).values({
        workspaceId: workspace.id,
        parentId: srcFolder.id,
        name: "index.js",
        type: "file",
        content: 'console.log("Hello SyncCode");',
    });

    // Create README
    await db.insert(files).values({
        workspaceId: workspace.id,
        name: "README.md",
        type: "file",
        content: "# SyncCode\n\nWelcome to SyncCode!",
    });

    console.log("✅ Seed completed");
    console.log(`User: ${existingUser.email}`);
    console.log(`Workspace: ${workspace.name}`);
    console.log("Files: src/index.js, README.md");

    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
});