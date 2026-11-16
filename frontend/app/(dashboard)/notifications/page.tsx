"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationRow } from "@/features/notifications/components/notification-center";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";
import type { Notification } from "@/types";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = notifications ?? [];

  const router = useRouter();

  const handleNotificationClick = (id: string) => {
    const item = items.find((notification) => notification.id === id);

    if (!item) return;

    const navigateToTask = () => {
      if (item.workspaceSlug && item.projectId && item.taskId) {
        router.push(
          `/workspaces/${item.workspaceSlug}/projects/${item.projectId}?taskId=${item.taskId}`,
        );
      }
    };

    if (item.read) {
      navigateToTask();
      return;
    }

    markRead.mutate(id, {
      onSuccess: navigateToTask,
    });
  };

  const unread = items.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Activity from every workspace you belong to."
        actions={
          <Button
            variant="outline"
            disabled={unread.length === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({items.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          <NotificationList
            items={items}
            isLoading={isLoading}
            onRead={handleNotificationClick}
            emptyTitle="No notifications"
            emptyDescription="When teammates mention you or move your tasks, it shows up here."
          />
        </TabsContent>
        <TabsContent value="unread" className="pt-4">
          <NotificationList
            items={unread}
            isLoading={isLoading}
            onRead={(id) => markRead.mutate(id)}
            emptyTitle="You're all caught up"
            emptyDescription="Nothing unread right now — nice work."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({
  items,
  isLoading,
  onRead,
  emptyTitle,
  emptyDescription,
}: {
  items: Notification[];
  isLoading: boolean;
  onRead: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading notifications…</p>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={BellOff}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }
  return (
    <Card className="gap-0 divide-y divide-border overflow-hidden p-0">
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          item={item}
          onRead={() => onRead(item.id)}
        />
      ))}
    </Card>
  );
}
