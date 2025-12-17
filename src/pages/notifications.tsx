import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Ticket,
  MessageSquare,
  AlertTriangle,
  Info,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

const notificationIcons: Record<string, React.ElementType> = {
  ticket_created: Ticket,
  ticket_assigned: Ticket,
  comment_added: MessageSquare,
  sla_warning: AlertTriangle,
  sla_breached: AlertTriangle,
  default: Info,
};

export default function Notifications() {
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/notifications/read-all");
    },
    onSuccess: () => {
      toast({ title: "All notifications marked as read" });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;
  const groupedNotifications = groupNotificationsByDate(notifications || []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {date}
              </h3>
              <Card>
                <CardContent className="p-0 divide-y">
                  {items.map((notification) => {
                    const Icon =
                      notificationIcons[notification.type || "default"] ||
                      notificationIcons.default;
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            notification.type?.includes("breach") ||
                            notification.type?.includes("warning")
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <Badge
                                variant="default"
                                className="text-xs flex-shrink-0"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.createdAt
                                ? formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    { addSuffix: true }
                                  )
                                : ""}
                            </span>
                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    markAsReadMutation.mutate(notification.id)
                                  }
                                  disabled={markAsReadMutation.isPending}
                                  data-testid={`button-mark-read-${notification.id}`}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  deleteNotificationMutation.mutate(
                                    notification.id
                                  )
                                }
                                disabled={deleteNotificationMutation.isPending}
                                data-testid={`button-delete-notification-${notification.id}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! Notifications about tickets and updates will appear here."
        />
      )}
    </div>
  );
}

function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {};
  const now = new Date();

  notifications.forEach((notification) => {
    const date = notification.createdAt
      ? new Date(notification.createdAt)
      : now;
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    let key: string;
    if (diffDays === 0) {
      key = "Today";
    } else if (diffDays === 1) {
      key = "Yesterday";
    } else if (diffDays < 7) {
      key = "This Week";
    } else {
      key = "Earlier";
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
  });

  return groups;
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-16 mb-3" />
          <Card>
            <CardContent className="p-0 divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
