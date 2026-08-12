import {
  ArrowRight,
  CheckCircle2,
  GitBranch,
  KanbanSquare,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban that keeps up",
    body: "Drag tasks across To do, In progress, Review and Done with optimistic updates.",
  },
  {
    icon: Users,
    title: "Workspaces & roles",
    body: "Organise teams into workspaces with admin and member permissions.",
  },
  {
    icon: GitBranch,
    title: "Projects with structure",
    body: "Every workspace groups projects, owners, due dates and progress in one place.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">SE-TaskFlow</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-glow relative overflow-hidden border-b border-border">
          <div
            className="surface-grid absolute inset-0 opacity-[0.35]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" /> Now with
              realtime-ready boards
            </span>
            <h1 className="text-gradient mt-6 text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Plan, track and ship work your team actually finishes
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              TaskFlow is the collaborative project management platform for
              software teams — workspaces, projects and boards without the
              enterprise bloat.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start for free <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-20 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <f.icon className="size-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border bg-card/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-10 text-sm text-muted-foreground">
            {["Role-based access", "Drag & drop board", "Dark mode"].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" /> {item}
                </span>
              ),
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TaskFlow. Built as a portfolio SaaS demo.
      </footer>
    </div>
  );
}
