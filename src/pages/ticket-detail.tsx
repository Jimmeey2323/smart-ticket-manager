import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Clock,
  User,
  Building2,
  Tag,
  MessageSquare,
  Paperclip,
  Edit2,
  AlertTriangle,
  CheckCircle,
  Send,
  MoreVertical,
  History,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { STATUSES, PRIORITIES, STUDIOS, DEPARTMENTS } from "@/lib/constants";
import type {
  Ticket,
  TicketComment,
  TicketHistory,
  User as UserType,
} from "@shared/schema";

interface TicketWithRelations extends Ticket {
  comments?: TicketComment[];
  history?: TicketHistory[];
  assignedTo?: UserType;
  reportedBy?: UserType;
}

export default function TicketDetail() {
  const [, params] = useRoute("/tickets/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const ticketId = params?.id;

  const [newComment, setNewComment] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [activeTab, setActiveTab] = useState("comments");

  const { data: ticket, isLoading } = useQuery<TicketWithRelations>({
    queryKey: ["/api/tickets", ticketId],
    enabled: !!ticketId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/tickets/${ticketId}`, { status });
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async (priority: string) => {
      return apiRequest("PATCH", `/api/tickets/${ticketId}`, { priority });
    },
    onSuccess: () => {
      toast({ title: "Priority updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
    },
    onError: () => {
      toast({ title: "Failed to update priority", variant: "destructive" });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; isInternal: boolean }) => {
      return apiRequest("POST", `/api/tickets/${ticketId}/comments`, data);
    },
    onSuccess: () => {
      toast({ title: "Comment added" });
      setNewComment("");
      setIsInternalNote(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", ticketId] });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({
        content: newComment.trim(),
        isInternal: isInternalNote,
      });
    }
  };

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The ticket you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/tickets")}>Back to Tickets</Button>
      </div>
    );
  }

  const studioName =
    STUDIOS.find((s) => s.id === ticket.studioId)?.name || ticket.studioId;

  const slaDeadline = ticket.slaDueAt
    ? new Date(ticket.slaDueAt)
    : ticket.createdAt
      ? new Date(new Date(ticket.createdAt).getTime() + 24 * 60 * 60 * 1000)
      : null;
  const isOverdue = slaDeadline && new Date() > slaDeadline;
  const hoursRemaining = slaDeadline
    ? Math.max(
        0,
        Math.round((slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60))
      )
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tickets")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">
              {ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status || "new"} />
            <PriorityBadge priority={ticket.priority || "medium"} />
          </div>
          <h1 className="text-xl font-semibold truncate mt-1">
            {ticket.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" data-testid="button-edit-ticket">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                data-testid="button-more-actions"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Assign to Team</DropdownMenuItem>
              <DropdownMenuItem>Escalate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Close Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {ticket.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">
                    {ticket.customerName || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">
                    {ticket.customerEmail || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">
                    {ticket.customerPhone || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Membership ID</span>
                  <p className="font-medium">
                    {ticket.customerMembershipId || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium capitalize">
                    {ticket.customerStatus?.replace(/_/g, " ") || "Not provided"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mood</span>
                  <p className="font-medium capitalize">
                    {ticket.clientMood || "Not recorded"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger
                    value="comments"
                    className="gap-2"
                    data-testid="tab-comments"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="gap-2"
                    data-testid="tab-history"
                  >
                    <History className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="attachments"
                    className="gap-2"
                    data-testid="tab-attachments"
                  >
                    <Paperclip className="h-4 w-4" />
                    Files
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="comments" className="m-0 space-y-4">
                  <div className="space-y-4">
                    {ticket.comments && ticket.comments.length > 0 ? (
                      ticket.comments.map((comment, index) => (
                        <div
                          key={comment.id}
                          className={`flex gap-3 ${comment.isInternal ? "bg-muted/50 p-3 rounded-md" : ""}`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.userId}
                              </span>
                              {comment.isInternal && (
                                <Badge variant="secondary" className="text-xs">
                                  Internal
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {comment.createdAt
                                  ? formatDistanceToNow(
                                      new Date(comment.createdAt),
                                      { addSuffix: true }
                                    )
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm mt-1 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet</p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-24"
                      data-testid="input-new-comment"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="internal-note"
                          checked={isInternalNote}
                          onCheckedChange={(checked) =>
                            setIsInternalNote(checked as boolean)
                          }
                          data-testid="checkbox-internal-note"
                        />
                        <Label
                          htmlFor="internal-note"
                          className="text-sm text-muted-foreground"
                        >
                          Internal note (not visible to client)
                        </Label>
                      </div>
                      <Button
                        onClick={handleAddComment}
                        disabled={
                          !newComment.trim() || addCommentMutation.isPending
                        }
                        data-testid="button-add-comment"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addCommentMutation.isPending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="m-0">
                  <div className="space-y-4">
                    {ticket.history && ticket.history.length > 0 ? (
                      ticket.history.map((event, index) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            {index < ticket.history!.length - 1 && (
                              <div className="w-px h-full bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium capitalize">
                                {event.fieldChanged}
                              </span>
                              <span className="text-muted-foreground">
                                changed from
                              </span>
                              <code className="bg-muted px-1 rounded text-xs">
                                {String(event.oldValue) || "empty"}
                              </code>
                              <span className="text-muted-foreground">to</span>
                              <code className="bg-muted px-1 rounded text-xs">
                                {String(event.newValue)}
                              </code>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {event.createdAt
                                ? formatDistanceToNow(
                                    new Date(event.createdAt),
                                    { addSuffix: true }
                                  )
                                : ""}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No activity recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="m-0">
                  <div className="text-center py-8 text-muted-foreground">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No attachments</p>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isOverdue || ticket.slaBreached ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">SLA Breached</span>
                </div>
              ) : slaDeadline ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">On Track</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hoursRemaining} hours remaining
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No SLA deadline set
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={ticket.status || "new"}
                  onValueChange={(value) => updateStatusMutation.mutate(value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-testid="select-ticket-status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUSES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">
                  Priority
                </Label>
                <Select
                  value={ticket.priority || "medium"}
                  onValueChange={(value) =>
                    updatePriorityMutation.mutate(value)
                  }
                  disabled={updatePriorityMutation.isPending}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-testid="select-ticket-priority"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITIES).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Studio:</span>
                  <span className="font-medium">{studioName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{ticket.categoryId || "N/A"}</span>
                </div>
                {ticket.subcategoryId && (
                  <div className="flex items-center gap-2 pl-6">
                    <span className="text-muted-foreground">Subcategory:</span>
                    <span className="font-medium">{ticket.subcategoryId}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <p className="font-medium">
                    {ticket.createdAt
                      ? format(new Date(ticket.createdAt), "PPp")
                      : "Unknown"}
                  </p>
                </div>
                {ticket.incidentDateTime && (
                  <div>
                    <span className="text-muted-foreground">
                      Incident Time
                    </span>
                    <p className="font-medium">
                      {format(new Date(ticket.incidentDateTime), "PPp")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Assignment
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-change-assignment"
                >
                  Change
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground">
                  Assigned To
                </span>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={ticket.assignedTo.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {ticket.assignedTo.firstName?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Unassigned
                  </p>
                )}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Team</span>
                <p className="text-sm font-medium mt-1">
                  {ticket.assignedTeamId || "No team assigned"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
