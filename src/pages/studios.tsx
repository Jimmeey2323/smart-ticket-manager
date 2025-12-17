import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Building2, MapPin, Phone, Mail, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import type { Studio } from "@shared/schema";

export default function Studios() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: studios, isLoading } = useQuery<Studio[]>({
    queryKey: ["/api/studios"],
  });

  const filteredStudios = studios?.filter(
    (studio) =>
      (studio.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (studio.address ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <StudiosSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Studios</h1>
          <p className="text-sm text-muted-foreground">
            Manage studio locations and contacts
          </p>
        </div>
        <Button data-testid="button-add-studio">
          <Plus className="h-4 w-4 mr-2" />
          Add Studio
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search studios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-studios"
        />
      </div>

      {filteredStudios && filteredStudios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudios.map((studio) => (
            <StudioCard key={studio.id} studio={studio} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No studios found"
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Create your first studio to get started"
          }
          action={
            !searchQuery
              ? { label: "Add Studio", onClick: () => {} }
              : undefined
          }
        />
      )}
    </div>
  );
}

function StudioCard({ studio }: { studio: Studio }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium truncate">{studio.name}</h3>
              {studio.code && (
                <p className="text-sm text-muted-foreground truncate">
                  {studio.code}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-testid={`button-studio-menu-${studio.id}`}>
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
          {studio.address && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{studio.address}</span>
            </div>
          )}
          {studio.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{studio.email}</span>
            </div>
          )}
          {studio.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{studio.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Badge variant={studio.isActive ? "default" : "secondary"}>
            {studio.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function StudiosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
