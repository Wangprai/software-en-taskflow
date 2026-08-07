import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";

import type { Project, Role, Task, User, Workspace, WorkspaceMember } from "@/types";
import { loadDb, recount, saveDb, slugify, uid } from "./db";

/**
 * In-browser mock of the TaskFlow REST API.
 * Every screen talks HTTP through axios, so swapping in the real backend is a
 * one-line change in src/lib/axios.ts.
 */

const LATENCY = 220;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return { data, status, statusText: "OK", headers: {}, config };
}

function body<T>(config: InternalAxiosRequestConfig): T {
  if (!config.data) return {} as T;
  return typeof config.data === "string" ? (JSON.parse(config.data) as T) : (config.data as T);
}

function publicUser(u: User): User {
  return { id: u.id, name: u.name, email: u.email, avatarUrl: u.avatarUrl ?? null };
}

function currentUser(config: InternalAxiosRequestConfig) {
  const header = String(config.headers?.get?.("Authorization") ?? "");
  const token = header.replace("Bearer ", "");
  const id = token.split(".")[1];
  const db = loadDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new HttpError(401, "Your session has expired. Please sign in again.");
  return user;
}

function match(path: string, pattern: string) {
  const p = path.split("?")[0]!.split("/").filter(Boolean);
  const q = pattern.split("/").filter(Boolean);
  if (p.length !== q.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < q.length; i++) {
    const seg = q[i]!;
    if (seg.startsWith(":")) params[seg.slice(1)] = decodeURIComponent(p[i]!);
    else if (seg !== p[i]) return null;
  }
  return params;
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await new Promise((r) => setTimeout(r, LATENCY));

  const method = (config.method ?? "get").toUpperCase();
  const url = (config.url ?? "").replace(/^\/api/, "") || "/";
  const db = loadDb();

  const commit = () => saveDb(recount(db));

  try {
    // ---- Auth -----------------------------------------------------------
    if (method === "POST" && match(url, "/auth/login")) {
      const { email, password } = body<{ email: string; password: string }>(config);
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user || user.password !== password)
        throw new HttpError(401, "Invalid email or password.");
      return ok(config, { token: `tf.${user.id}.${Date.now()}`, user: publicUser(user) });
    }

    if (method === "POST" && match(url, "/auth/register")) {
      const { name, email, password } = body<{ name: string; email: string; password: string }>(
        config,
      );
      if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim()))
        throw new HttpError(409, "An account with that email already exists.");
      const user = { id: uid("u"), name, email: email.trim(), password, avatarUrl: null };
      db.users.push(user);
      commit();
      return ok(config, { token: `tf.${user.id}.${Date.now()}`, user: publicUser(user) }, 201);
    }

    if (method === "GET" && match(url, "/auth/me")) {
      return ok(config, publicUser(currentUser(config)));
    }

    // ---- Workspaces -----------------------------------------------------
    if (method === "GET" && match(url, "/workspaces")) {
      currentUser(config);
      return ok(config, db.workspaces);
    }

    if (method === "POST" && match(url, "/workspaces")) {
      const me = currentUser(config);
      const input = body<{ name: string; description?: string }>(config);
      let slug = slugify(input.name);
      if (db.workspaces.some((w) => w.slug === slug)) slug = `${slug}-${uid("").slice(1, 4)}`;
      const workspace: Workspace = {
        id: uid("w"),
        name: input.name,
        slug,
        description: input.description ?? "",
        createdAt: new Date().toISOString(),
        memberCount: 1,
        projectCount: 0,
      };
      db.workspaces.unshift(workspace);
      db.members.push({
        id: uid("m"),
        workspaceId: workspace.id,
        role: "ADMIN",
        joinedAt: new Date().toISOString(),
        user: publicUser(me),
      });
      commit();
      return ok(config, workspace, 201);
    }

    let params = match(url, "/workspaces/:slug");
    if (params) {
      const workspace = db.workspaces.find((w) => w.slug === params!["slug"]);
      if (!workspace) throw new HttpError(404, "Workspace not found.");
      if (method === "GET") return ok(config, workspace);
      if (method === "PATCH" || method === "PUT") {
        const input = body<{ name?: string; description?: string }>(config);
        Object.assign(workspace, input);
        commit();
        return ok(config, workspace);
      }
      if (method === "DELETE") {
        db.workspaces = db.workspaces.filter((w) => w.id !== workspace.id);
        const projectIds = db.projects.filter((p) => p.workspaceId === workspace.id).map((p) => p.id);
        db.projects = db.projects.filter((p) => p.workspaceId !== workspace.id);
        db.tasks = db.tasks.filter((t) => !projectIds.includes(t.projectId));
        db.members = db.members.filter((m) => m.workspaceId !== workspace.id);
        commit();
        return ok(config, { success: true });
      }
    }

    // ---- Members --------------------------------------------------------
    params = match(url, "/workspaces/:slug/members");
    if (params) {
      const workspace = db.workspaces.find((w) => w.slug === params!["slug"]);
      if (!workspace) throw new HttpError(404, "Workspace not found.");
      if (method === "GET")
        return ok(
          config,
          db.members.filter((m) => m.workspaceId === workspace.id),
        );
      if (method === "POST") {
        const input = body<{ email: string; name?: string; role: Role }>(config);
        const email = input.email.trim().toLowerCase();
        if (db.members.some((m) => m.workspaceId === workspace.id && m.user.email === email))
          throw new HttpError(409, "That person is already a member of this workspace.");
        let user = db.users.find((u) => u.email.toLowerCase() === email);
        if (!user) {
          user = {
            id: uid("u"),
            name: input.name?.trim() || email.split("@")[0]!,
            email,
            password: "password123",
            avatarUrl: null,
          };
          db.users.push(user);
        }
        const member: WorkspaceMember = {
          id: uid("m"),
          workspaceId: workspace.id,
          role: input.role,
          joinedAt: new Date().toISOString(),
          user: publicUser(user),
        };
        db.members.push(member);
        commit();
        return ok(config, member, 201);
      }
    }

    params = match(url, "/workspaces/:slug/members/:memberId");
    if (params) {
      const member = db.members.find((m) => m.id === params!["memberId"]);
      if (!member) throw new HttpError(404, "Member not found.");
      if (method === "PATCH") {
        member.role = body<{ role: Role }>(config).role;
        commit();
        return ok(config, member);
      }
      if (method === "DELETE") {
        db.members = db.members.filter((m) => m.id !== member.id);
        commit();
        return ok(config, { success: true });
      }
    }

    // ---- Projects -------------------------------------------------------
    params = match(url, "/workspaces/:slug/projects");
    if (params) {
      const workspace = db.workspaces.find((w) => w.slug === params!["slug"]);
      if (!workspace) throw new HttpError(404, "Workspace not found.");
      if (method === "GET")
        return ok(
          config,
          db.projects.filter((p) => p.workspaceId === workspace.id),
        );
      if (method === "POST") {
        const input = body<{ name: string; description?: string }>(config);
        const palette = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];
        const project: Project = {
          id: uid("p"),
          workspaceId: workspace.id,
          name: input.name,
          key: input.name.slice(0, 3).toUpperCase(),
          description: input.description ?? "",
          createdAt: new Date().toISOString(),
          taskCount: 0,
          color: palette[db.projects.length % palette.length]!,
        };
        db.projects.unshift(project);
        commit();
        return ok(config, project, 201);
      }
    }

    params = match(url, "/projects/:id");
    if (params) {
      const project = db.projects.find((p) => p.id === params!["id"]);
      if (!project) throw new HttpError(404, "Project not found.");
      if (method === "GET") return ok(config, project);
      if (method === "PATCH" || method === "PUT") {
        Object.assign(project, body<{ name?: string; description?: string }>(config));
        commit();
        return ok(config, project);
      }
      if (method === "DELETE") {
        db.projects = db.projects.filter((p) => p.id !== project.id);
        db.tasks = db.tasks.filter((t) => t.projectId !== project.id);
        commit();
        return ok(config, { success: true });
      }
    }

    // ---- Tasks (mock-only until the Task API ships) ----------------------
    params = match(url, "/projects/:id/tasks");
    if (params) {
      if (method === "GET")
        return ok(
          config,
          db.tasks.filter((t) => t.projectId === params!["id"]),
        );
      if (method === "POST") {
        const input = body<Partial<Task>>(config);
        const task: Task = {
          id: uid("t"),
          projectId: params["id"]!,
          title: input.title ?? "Untitled task",
          description: input.description ?? "",
          status: input.status ?? "TODO",
          priority: input.priority ?? "MEDIUM",
          assignee: input.assignee ?? null,
          dueDate: input.dueDate ?? null,
          order: db.tasks.length,
        };
        db.tasks.push(task);
        commit();
        return ok(config, task, 201);
      }
    }

    params = match(url, "/tasks/:id");
    if (params) {
      const task = db.tasks.find((t) => t.id === params!["id"]);
      if (!task) throw new HttpError(404, "Task not found.");
      if (method === "PATCH") {
        Object.assign(task, body<Partial<Task>>(config));
        commit();
        return ok(config, task);
      }
      if (method === "DELETE") {
        db.tasks = db.tasks.filter((t) => t.id !== task.id);
        commit();
        return ok(config, { success: true });
      }
    }

    throw new HttpError(404, `No route for ${method} ${url}`);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Promise.reject({
      isAxiosError: true,
      message,
      config,
      response: { data: { message }, status, statusText: "Error", headers: {}, config },
    });
  }
};
