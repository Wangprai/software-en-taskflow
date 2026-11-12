"use client";

import { Badge } from "@/components/ui/badge";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";

export function RoleBadge({ role }: { role: Role | "OWNER" }) {
  return (
    <Badge
      className={cn(
        "border-transparent text-[10px] font-semibold tracking-wide",
        role === "OWNER"
          ? "bg-amber-500/15 text-amber-600"
          : role === "ADMIN"
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground",
      )}
    >
      {role}
    </Badge>
  );
}
