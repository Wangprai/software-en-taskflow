
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { Avatar, AvatarFallback } from "../ui/avatar";

const TONES = [
  "bg-chart-1/20 text-chart-1",
  "bg-chart-2/20 text-chart-2",
  "bg-chart-3/25 text-chart-3",
  "bg-chart-4/20 text-chart-4",
  "bg-chart-5/20 text-chart-5",
];

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function UserAvatar({
  user,
  className,
}: {
  user: Pick<User, "id" | "name">;
  className?: string | undefined;
}) {
  const tone = TONES[Math.abs(hash(user.id)) % TONES.length]!;
  return (
    <Avatar className={cn("size-8 border border-border/60", className)}>
      <AvatarFallback className={cn("text-[11px] font-semibold", tone)}>
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h << 5) - h + value.charCodeAt(i);
  return h;
}
