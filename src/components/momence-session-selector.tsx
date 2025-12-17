import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, User, Clock, X, Search, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MomenceSession {
  id: number;
  name: string;
  type: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  durationInMinutes: number;
  capacity: number;
  bookingCount?: number;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
    pictureUrl?: string;
  };
  isRecurring: boolean;
  isCancelled: boolean;
  isInPerson: boolean;
  isDraft: boolean;
  inPersonLocation?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    badgeColor?: string;
  }>;
}

interface MomenceSessionSelectorProps {
  onSessionSelect: (session: MomenceSession | null) => void;
  selectedSession: MomenceSession | null;
}

export function MomenceSessionSelector({ onSessionSelect, selectedSession }: MomenceSessionSelectorProps) {
  const [sessions, setSessions] = useState<MomenceSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<MomenceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("momence-api", {
        body: { action: "getSessions", pageSize: 200 },
      });

      if (error) throw error;
      
      const validSessions = (data.payload || []).filter(
        (s: MomenceSession) => !s.isCancelled && !s.isDraft
      );
      setSessions(validSessions);
      setFilteredSessions(validSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Failed to Load Sessions",
        description: "Could not load class sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen && sessions.length === 0) {
      loadSessions();
    }
  }, [isOpen, sessions.length, loadSessions]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(sessions);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredSessions(
        sessions.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.teacher?.firstName.toLowerCase().includes(query) ||
            s.teacher?.lastName.toLowerCase().includes(query) ||
            s.inPersonLocation?.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, sessions]);

  const handleSelectSession = (session: MomenceSession) => {
    onSessionSelect(session);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClearSession = () => {
    onSessionSelect(null);
  };

  if (selectedSession) {
    return (
      <Card className="border-primary/50">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium">{selectedSession.name}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(selectedSession.startsAt), "MMM d, yyyy h:mm a")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedSession.durationInMinutes} mins
                </span>
              </div>
              {selectedSession.teacher && (
                <p className="text-sm flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedSession.teacher.firstName} {selectedSession.teacher.lastName}
                </p>
              )}
              {selectedSession.inPersonLocation && (
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedSession.inPersonLocation.name}
                </p>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearSession}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {selectedSession.tags && selectedSession.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedSession.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  style={{ backgroundColor: tag.badgeColor || undefined }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select a Class Session
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by class name, instructor, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="p-2 space-y-2">
              {filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSelectSession(session)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{session.name}</p>
                        {session.bookingCount !== undefined && (
                          <Badge variant="secondary">
                            {session.bookingCount}/{session.capacity}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.startsAt), "MMM d, h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.durationInMinutes} mins
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {session.teacher && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            {session.teacher.firstName} {session.teacher.lastName}
                          </span>
                        )}
                        {session.inPersonLocation && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {session.inPersonLocation.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? "No sessions match your search." : "No upcoming sessions available."}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
