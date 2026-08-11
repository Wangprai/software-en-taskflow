import type {
  Project,
  Role,
  Task,
  User,
  Workspace,
  WorkspaceMember,
} from "@/types";
const DB_KEY = "taskflow.db.v2";
export interface Db {
  users: Array<User & { password: string }>;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  projects: Project[];
  tasks: Task[];
}
const USERS: Array<User & { password: string }> = [
  {
    id: "u_1",
    name: "Alex Rivera",
    email: "alex@taskflow.dev",
    password: "password123",
    avatarUrl: null,
  },
  {
    id: "u_2",
    name: "Priya Nair",
    email: "priya@taskflow.dev",
    password: "password123",
    avatarUrl: null,
  },
  {
    id: "u_3",
    name: "Marcus Cole",
    email: "marcus@taskflow.dev",
    password: "password123",
    avatarUrl: null,
  },
  {
    id: "u_4",
    name: "Sofia Lindqvist",
    email: "sofia@taskflow.dev",
    password: "password123",
    avatarUrl: null,
  },
  {
    id: "u_5",
    name: "Dan Okafor",
    email: "dan@taskflow.dev",
    password: "password123",
    avatarUrl: null,
  },
];
function iso(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 86_400_000).toISOString();
}
function seed(): Db {
  const workspaces: Workspace[] = [
    {
      id: "w_1",
      name: "Acme Product",
      slug: "acme-product",
      description:
        "Core product squad building the TaskFlow platform experience.",
      createdAt: iso(-120),
      memberCount: 0,
      projectCount: 0,
    },
    {
      id: "w_2",
      name: "Growth Lab",
      slug: "growth-lab",
      description: "Experiments, lifecycle marketing and onboarding funnels.",
      createdAt: iso(-64),
      memberCount: 0,
      projectCount: 0,
    },
    {
      id: "w_3",
      name: "Platform Infra",
      slug: "platform-infra",
      description: "Reliability, CI/CD and developer tooling for all teams.",
      createdAt: iso(-31),
      memberCount: 0,
      projectCount: 0,
    },
  ];
  const roles: Array<[string, string, Role]> = [
    ["w_1", "u_1", "ADMIN"],
    ["w_1", "u_2", "MEMBER"],
    ["w_1", "u_3", "MEMBER"],
    ["w_1", "u_4", "MEMBER"],
    ["w_2", "u_1", "ADMIN"],
    ["w_2", "u_5", "MEMBER"],
    ["w_3", "u_1", "ADMIN"],
    ["w_3", "u_3", "ADMIN"],
    ["w_3", "u_5", "MEMBER"],
  ];
  const members: WorkspaceMember[] = roles.map(
    ([workspaceId, userId, role], i) => {
      const u = USERS.find((x) => x.id === userId)!;
      return {
        id: `m_${i + 1}`,
        workspaceId,
        role,
        joinedAt: iso(-100 + i * 4),
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          avatarUrl: u.avatarUrl ?? null,
        },
      };
    },
  );
  const plain = (id: string): User => {
    const u = USERS.find((x) => x.id === id)!;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl ?? null,
    };
  };
  const projects: Project[] = [
    {
      id: "p_1",
      workspaceId: "w_1",
      name: "Kanban Board v2",
      key: "KAN",
      description:
        "Rebuild the board with virtualised columns and realtime presence.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-42),
      updatedAt: iso(-42),
      taskCount: 0,
      color: "chart-1",
    },
    {
      id: "p_2",
      workspaceId: "w_1",
      name: "Billing & Plans",
      key: "BIL",
      description: "Self-serve upgrades, seat management and invoice history.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-27),
      updatedAt: iso(-27),
      taskCount: 0,
      color: "chart-2",
    },
    {
      id: "p_3",
      workspaceId: "w_1",
      name: "Mobile Companion",
      key: "MOB",
      description: "Read-only mobile app for triage and notifications.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-11),
      updatedAt: iso(-11),
      taskCount: 0,
      color: "chart-4",
    },
    {
      id: "p_4",
      workspaceId: "w_2",
      name: "Onboarding Funnel",
      key: "ONB",
      description: "Reduce time-to-first-project below 4 minutes.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-33),
      updatedAt: iso(-33),
      taskCount: 0,
      color: "chart-3",
    },
    {
      id: "p_5",
      workspaceId: "w_2",
      name: "Lifecycle Emails",
      key: "LFC",
      description: "Behaviour-driven email sequences and win-back campaigns.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-9),
      updatedAt: iso(-9),
      taskCount: 0,
      color: "chart-5",
    },
    {
      id: "p_6",
      workspaceId: "w_3",
      name: "CI Pipeline Rewrite",
      key: "CIP",
      description: "Cut median pipeline duration from 14m to under 5m.",
      ownerId: "u_1",
      owner: plain("u_1"),
      createdAt: iso(-18),
      updatedAt: iso(-18),
      taskCount: 0,
      color: "chart-2",
    },
  ];

  const rawTasks: Array<
    [
      string,
      string,
      Task["status"],
      Task["priority"],
      string | null,
      number | null,
    ]
  > = [
    ["p_1", "Design column drag affordances", "TODO", "HIGH", "u_2", 3],
    ["p_1", "Virtualise long task lists", "TODO", "MEDIUM", "u_3", 6],
    ["p_1", "Keyboard shortcuts for triage", "TODO", "LOW", null, null],
    ["p_1", "Realtime presence avatars", "IN_PROGRESS", "URGENT", "u_1", 1],
    ["p_1", "Optimistic status updates", "IN_PROGRESS", "HIGH", "u_4", 2],
    ["p_1", "Board filters & saved views", "REVIEW", "MEDIUM", "u_2", -1],
    ["p_1", "Task detail side panel", "REVIEW", "HIGH", "u_3", 4],
    ["p_1", "Drag and drop accessibility pass", "DONE", "MEDIUM", "u_1", -5],
    ["p_1", "Swimlane grouping spike", "DONE", "LOW", "u_4", -8],
    ["p_2", "Stripe checkout session", "TODO", "URGENT", "u_1", 2],
    ["p_2", "Seat-based proration", "IN_PROGRESS", "HIGH", "u_2", 5],
    ["p_2", "Invoice PDF export", "REVIEW", "LOW", "u_3", 9],
    ["p_2", "Plan comparison table", "DONE", "MEDIUM", "u_4", -3],
    ["p_3", "Push notification service", "TODO", "HIGH", "u_5", 12],
    ["p_3", "Offline cache layer", "IN_PROGRESS", "MEDIUM", "u_3", 7],
    ["p_4", "Interactive product tour", "TODO", "HIGH", "u_5", 4],
    ["p_4", "Sample workspace generator", "IN_PROGRESS", "MEDIUM", "u_1", 2],
    ["p_4", "Activation metrics dashboard", "DONE", "LOW", "u_5", -6],
    ["p_5", "Win-back sequence copy", "TODO", "MEDIUM", "u_5", 8],
    ["p_6", "Parallelise test shards", "IN_PROGRESS", "URGENT", "u_3", 1],
    ["p_6", "Remote build cache", "REVIEW", "HIGH", "u_5", 3],
    ["p_6", "Flaky test quarantine", "DONE", "MEDIUM", "u_3", -2],
  ];
  const now = new Date().toISOString();
  const tasks: Task[] = rawTasks.map(
    ([projectId, title, status, priority, assigneeId, due], i) => ({
      id: `t_${i + 1}`,
      projectId,
      title,
      description: "",
      status,
      priority,
      position: i,
      assigneeId,
      assignee: assigneeId ? plain(assigneeId) : null,
      createdById: USERS[0].id,
      createdBy: plain(USERS[0].id),
      dueDate: due === null ? null : iso(due),
      createdAt: now,
      updatedAt: now,
    }),
  );
  return { users: USERS, workspaces, members, projects, tasks };
}
export function loadDb(): Db {
  if (typeof window === "undefined") {
    return recount(seed());
  }
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      return recount(JSON.parse(raw) as Db);
    }
  } catch {
    /* ignore corrupt storage */
  }
  const fresh = recount(seed());
  saveDb(fresh);
  return fresh;
}
export function saveDb(db: Db) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}
export function recount(db: Db): Db {
  db.workspaces = db.workspaces.map((w) => ({
    ...w,
    memberCount: db.members.filter((m) => m.workspaceId === w.id).length,
    projectCount: db.projects.filter((p) => p.workspaceId === w.id).length,
  }));
  db.projects = db.projects.map((p) => ({
    ...p,
    taskCount: db.tasks.filter((t) => t.projectId === p.id).length,
  }));
  return db;
}
export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
