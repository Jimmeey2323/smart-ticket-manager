import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, User, Plus, X, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { momenceAPI, type MomenceSession } from "@/lib/momenceAPI";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectedSession extends MomenceSession {
  formattedDate?: string;
  formattedTime?: string;
}

interface SessionSearchProps {
  onSessionsSelect: (sessions: SelectedSession[]) => void;
  selectedSessions?: SelectedSession[];
  location?: string;
}

export function SessionSearch({ onSessionsSelect, selectedSessions = [], location }: SessionSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>(location || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<MomenceSession[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch sessions when location changes
  useEffect(() => {
    if (!locationFilter) {
      setSessions([]);
      return;
    }

    const fetchSessions = async () => {
      setIsSearching(true);
      try {
        console.log(`Fetching sessions for location: ${locationFilter}`);
        const result = await momenceAPI.getSessionsByLocation(locationFilter);
        
        if (result.payload && Array.isArray(result.payload)) {
          // Format session data
          const formattedSessions = result.payload.map((session: any) => {
            const formatted = momenceAPI.formatSessionData(session);
            return {
              ...formatted,
              formattedDate: new Date(session.startsAt).toLocaleDateString(),
              formattedTime: new Date(session.startsAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
            };
          });
          
          setSessions(formattedSessions);
          console.log(`Loaded ${formattedSessions.length} sessions for ${locationFilter}`);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Load Error",
          description: "Failed to load classes from Momence. Please try again.",
          variant: "destructive",
        });
        setSessions([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSessions();
  }, [locationFilter, toast]);

  // Filter sessions by search query
  const filteredSessions = sessions.filter(session => {
    const query = searchQuery.toLowerCase();
    return (
      (session.name ?? '').toLowerCase().includes(query) ||
      (session.teacher?.firstName ?? '').toLowerCase().includes(query) ||
      (session.teacher?.lastName ?? '').toLowerCase().includes(query) ||
      (session.description ?? '').toLowerCase().includes(query)
    );
  });

  const handleSessionSelect = async (session: MomenceSession) => {
    const isAlreadySelected = selectedSessions.some(s => s.id === session.id);
    
    if (isAlreadySelected) {
      // Remove from selected
      const updated = selectedSessions.filter(s => s.id !== session.id);
      onSessionsSelect(updated);
      toast({
        title: "Class Removed",
        description: `${session.name} has been removed.`,
      });
    } else {
      // Add to selected
      const formattedSession: SelectedSession = {
        ...session,
        formattedDate: session.startsAt ? new Date(session.startsAt).toLocaleDateString() : '',
        formattedTime: session.startsAt ? new Date(session.startsAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '',
      };
      const updated = [...selectedSessions, formattedSession];
      onSessionsSelect(updated);
      toast({
        title: "Class Added",
        description: `${session.name} added to ticket.`,
      });
    }
  };

  const isSessionSelected = (sessionId: string) => {
    return selectedSessions.some(s => s.id === sessionId);
  };

  const removeSession = (sessionId: string) => {
    const updated = selectedSessions.filter(s => s.id !== sessionId);
    onSessionsSelect(updated);
  };

  const locationOptions = [
    { label: "Select a studio", value: "" },
    { label: "Kwality House, Kemps Corner", value: "Kwality House" },
    { label: "Supreme HQ, Bandra", value: "Supreme HQ, Bandra" },
    { label: "Pop Up", value: "Pop Up" },
    { label: "Kenkere House", value: "Kenkere House" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location-filter" className="text-sm font-medium">
          Studio/Location
        </Label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger id="location-filter" className="mt-2">
            <SelectValue placeholder="Select a studio" />
          </SelectTrigger>
          <SelectContent>
            {locationOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Select a studio to view available classes
        </p>
      </div>

      {/* Selected Sessions Display */}
      {selectedSessions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Selected Classes ({selectedSessions.length})
          </Label>
          <div className="space-y-2">
            {selectedSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-3 border rounded-lg bg-green-50 border-green-200"
              >
                <div className="flex-1 space-y-1">
                  <div className="font-medium text-sm text-gray-900">{session.name}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {session.formattedDate}
                    </span>
                    <span className="inline-flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {session.formattedTime}
                    </span>
                    {session.teacher && (
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <User className="h-3 w-3 mr-1" />
                        {session.teacher.firstName} {session.teacher.lastName}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSession(session.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse Classes */}
      {locationFilter && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add More Classes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Browse Classes - {locationFilter}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search within location */}
              <div className="relative">
                <Input
                  placeholder="Search by class name or teacher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Sessions List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((session) => {
                    const isSelected = isSessionSelected(session.id);
                    return (
                      <Card
                        key={session.id}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => handleSessionSelect(session)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start gap-2">
                                <h4 className="font-medium text-sm text-gray-900 flex-1">
                                  {session.name}
                                </h4>
                                {isSelected && (
                                  <Badge className="bg-green-600">Added</Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="inline-flex items-center text-gray-600">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {session.formattedDate}
                                </span>
                                <span className="inline-flex items-center text-gray-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {session.formattedTime}
                                </span>
                                <span className="inline-flex items-center text-gray-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {session.durationInMinutes}m
                                </span>
                              </div>

                              {/* Teacher Info */}
                              {session.teacher && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <User className="h-3 w-3" />
                                  <span className="font-medium">
                                    {session.teacher.firstName} {session.teacher.lastName}
                                  </span>
                                </div>
                              )}

                              {/* Availability */}
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {session.availableSpots} spots left
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {session.utilizationRate}% full
                                </Badge>
                              </div>

                              {session.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {isSearching ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading classes...
                      </div>
                    ) : (
                      <p>No classes found for this location</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* No Location Selected Warning */}
      {!locationFilter && selectedSessions.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700">
            Select a studio first to browse and add classes to this ticket.
          </p>
        </div>
      )}
    </div>
  );
}
