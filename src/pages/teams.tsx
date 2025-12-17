import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Users, Mail, Clock, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import type { Team } from "@shared/schema";

export default function Teams() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const filteredTeams = teams?.filter(
    (team) =>
      (team.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <TeamsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-sm text-muted-foreground">
            Manage support teams and their assignments
          </p>
        </div>
        <Button data-testid="button-add-team">
          <Plus className="h-4 w-4 mr-2" />
          Add Team
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-teams"
        />
      </div>

      {filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No teams found"
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Create your first team to get started"
          }
          action={
            !searchQuery
              ? { label: "Add Team", onClick: () => {} }
              : undefined
          }
        />
      )}
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{team.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {team.description || "No description"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-team-menu-${team.id}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          {team.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{team.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>SLA: {team.slaHours || 24}h</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant={team.isActive ? "default" : "secondary"}>
            {team.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
