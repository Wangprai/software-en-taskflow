import {
  ArrowRightLeft,
  MessageSquare,
  Pencil,
  Plus,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatRelative } from "@/lib/format";
import type { Activity, ActivityType } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<ActivityType, LucideIcon> = {
  TASK_CREATED: Plus,
  TASK_UPDATED: Pencil,
  TASK_ASSIGNED: UserPlus,
  STATUS_CHANGED: ArrowRightLeft,
  COMMENT_CREATED: MessageSquare,
};

export function ActivityTimeline({
  activities,
  className,
  emptyLabel = "No activity recorded yet.",
}: {
  activities: Activity[];
  className?: string;
  emptyLabel?: string;
}) {
  if (activities.length === 0) {
    return (
      <p className={cn("rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-4 pl-6", className)}>
      <span className="absolute left-[11px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {activities.map((activity) => {
        const Icon = ICONS[activity.type] ?? ArrowRightLeft;
        return (
          <li key={activity.id} className="relative">
            <span className="absolute -left-6 top-0 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <Icon className="size-3" />
            </span>
            <p className="text-sm leading-snug">
              <span className="font-medium">{activity.actor.name}</span>{" "}
              <span className="text-muted-foreground">{activity.summary}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatRelative(activity.createdAt)}</p>
          </li>
        );
      })}
    </ol>
  );
}
