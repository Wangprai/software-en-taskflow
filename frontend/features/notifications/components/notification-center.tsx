import {
  Bell,
  CheckCheck,
  CheckCircle2,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";
import { formatRelative } from "@/lib/format";
import type { Notification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getNotificationTitle } from "../utils/notification-display";

export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  TASK_ASSIGNED: UserPlus,
  COMMENT_ADDED: MessageSquare,
  STATUS_CHANGED: CheckCircle2,
};

export function NotificationCenter() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = notifications ?? [];
  const unread = items.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications (${unread} unread)`}
        >
          <span className="relative">
            <Bell className="size-4" />

            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                {unread}
              </span>
            )}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={unread === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>

        <div className="scroll-slim max-h-96 divide-y divide-border overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </p>
          ) : (
            items
              .slice(0, 8)
              .map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onRead={() => markRead.mutate(item.id)}
                />
              ))
          )}
        </div>

        <div className="border-t border-border p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function NotificationRow({
  item,
  onRead,
}: {
  item: Notification;
  onRead: () => void;
}) {
  const title = getNotificationTitle(item);
  const Icon = NOTIFICATION_ICONS[item.type] ?? Bell;
  
  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60",
        !item.read && "bg-primary/5",
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {!item.read && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </span>
        <span className="line-clamp-2 block text-sm text-muted-foreground">
          {item.body}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {formatRelative(item.createdAt)}
        </span>
      </span>
    </button>
  );
}
