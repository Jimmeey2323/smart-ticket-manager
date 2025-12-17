import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { Clock, MapPin, User, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";
import type { Ticket } from "@shared/schema";

interface TicketCardProps {
  ticket: Ticket;
  className?: string;
}

const priorityBorderColors: Record<string, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
  low: "border-l-green-500",
};

export function TicketCard({ ticket, className }: TicketCardProps) {
  const borderColor = priorityBorderColors[ticket.priority || "medium"];
  const isOverdue = ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && 
    !["resolved", "closed"].includes(ticket.status || "");

  return (
    <Link href={`/tickets/${ticket.id}`}>
      <Card 
        className={cn(
          "hover-elevate active-elevate-2 cursor-pointer border-0 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1.5 bg-white dark:from-slate-900 dark:to-slate-800 border-l-4 relative overflow-hidden",
          borderColor,
          isOverdue && "ring-2 ring-red-500/60 shadow-red-500/10",
          className
        )}
        data-testid={`card-ticket-${ticket.id}`}
      >
        {/* Glossy shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <CardContent className="p-5 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">
                    {ticket.ticketNumber}
                  </span>
                  {isOverdue && (
                    <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      Overdue
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-2">
                  {ticket.title}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={ticket.status || "new"} />
                <PriorityBadge priority={ticket.priority || "medium"} />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              {ticket.categoryId && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">{ticket.categoryId}</span>
                  {ticket.subcategoryId && (
                    <span className="text-muted-foreground/60">/ {ticket.subcategoryId}</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {ticket.customerName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {ticket.customerName}
                  </span>
                )}
                {ticket.studioId && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {ticket.studioId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </div>
            </div>

            {ticket.assignedToUserId && (
              <div className="flex items-center gap-2 pt-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {ticket.assignedToUserId.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Assigned</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
