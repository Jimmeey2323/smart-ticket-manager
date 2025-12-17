import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, Mail, Phone, Calendar, CreditCard, X, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MomenceMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  pictureUrl?: string;
  firstSeen?: string;
  lastSeen?: string;
  visits?: {
    appointments: number;
    appointmentsVisits: number;
    bookings: number;
    bookingsVisits: number;
    openAreaVisits: number;
    total: number;
    totalVisits: number;
  };
  customerFields?: Array<{
    id: number;
    label: string;
    type: string;
    value: string;
  }>;
  customerTags?: Array<{
    id: number;
    name: string;
    isCustomerBadge: boolean;
    badgeLabel?: string;
    badgeColor?: string;
  }>;
}

interface MemberSession {
  id: number;
  createdAt: string;
  checkedIn: boolean;
  cancelledAt?: string;
  session: {
    id: number;
    name: string;
    type: string;
    startsAt: string;
    endsAt: string;
    teacher?: {
      firstName: string;
      lastName: string;
    };
    inPersonLocation?: {
      name: string;
    };
  };
}

interface MemberMembership {
  id: number;
  type: string;
  startDate: string;
  endDate?: string;
  isFrozen: boolean;
  usageLimitForSessions?: number;
  usedSessions?: number;
  membership: {
    id: number;
    name: string;
    type: string;
  };
}

interface MomenceClientSearchProps {
  onClientSelect: (client: MomenceMember | null) => void;
  selectedClient: MomenceMember | null;
}

export function MomenceClientSearch({ onClientSelect, selectedClient }: MomenceClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MomenceMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [memberSessions, setMemberSessions] = useState<MemberSession[]>([]);
  const [memberMemberships, setMemberMemberships] = useState<MemberMembership[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showMemberships, setShowMemberships] = useState(false);
  const { toast } = useToast();

  const searchMembers = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("momence-api", {
        body: { action: "searchMembers", query: searchQuery },
      });

      if (error) throw error;
      setSearchResults(data.payload || []);
    } catch (error) {
      console.error("Error searching members:", error);
      toast({
        title: "Search Failed",
        description: "Could not search members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, toast]);

  const loadMemberDetails = useCallback(async (memberId: number) => {
    setIsLoadingDetails(true);
    try {
      const [sessionsRes, membershipsRes] = await Promise.all([
        supabase.functions.invoke("momence-api", {
          body: { action: "getMemberSessions", memberId },
        }),
        supabase.functions.invoke("momence-api", {
          body: { action: "getMemberMemberships", memberId },
        }),
      ]);

      if (sessionsRes.data?.payload) {
        setMemberSessions(sessionsRes.data.payload);
      }
      if (membershipsRes.data?.payload) {
        setMemberMemberships(membershipsRes.data.payload);
      }
    } catch (error) {
      console.error("Error loading member details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handleSelectMember = (member: MomenceMember) => {
    onClientSelect(member);
    setSearchResults([]);
    setSearchQuery("");
    loadMemberDetails(member.id);
  };

  const handleClearClient = () => {
    onClientSelect(null);
    setMemberSessions([]);
    setMemberMemberships([]);
    setShowSessions(false);
    setShowMemberships(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchMembers();
    }
  };

  return (
    <div className="space-y-4">
      {!selectedClient ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={searchMembers} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {isSearching && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-2 space-y-2">
                {searchResults.map((member) => (
                  <Card
                    key={member.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectMember(member)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {member.pictureUrl ? (
                          <img
                            src={member.pictureUrl}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {member.email && (
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </span>
                            )}
                            {member.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {member.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                        {member.visits && (
                          <Badge variant="secondary">
                            {member.visits.totalVisits} visits
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No members found. Try a different search term.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Client Card */}
          <Card className="border-primary/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Selected Client
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleClearClient}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedClient.pictureUrl ? (
                  <img
                    src={selectedClient.pictureUrl}
                    alt={`${selectedClient.firstName} ${selectedClient.lastName}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Member ID: {selectedClient.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedClient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phoneNumber}</span>
                  </div>
                )}
                {selectedClient.lastSeen && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Last seen: {format(new Date(selectedClient.lastSeen), "MMM d, yyyy")}</span>
                  </div>
                )}
                {selectedClient.visits && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Total Visits:</span>
                    <Badge variant="secondary">{selectedClient.visits.totalVisits}</Badge>
                  </div>
                )}
              </div>

              {/* Customer Tags */}
              {selectedClient.customerTags && selectedClient.customerTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedClient.customerTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.badgeColor || undefined }}
                      variant="outline"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Custom Fields */}
              {selectedClient.customerFields && selectedClient.customerFields.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                  {selectedClient.customerFields.map((field) => (
                    <div key={field.id}>
                      <span className="text-muted-foreground">{field.label}:</span>{" "}
                      <span className="font-medium">{field.value || "N/A"}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Collapsible open={showSessions} onOpenChange={setShowSessions}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Sessions ({memberSessions.length})
                </span>
                {showSessions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {isLoadingDetails ? (
                <Skeleton className="h-32 w-full" />
              ) : memberSessions.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {memberSessions.slice(0, 10).map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.session.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.session.startsAt), "MMM d, yyyy h:mm a")}
                            </p>
                            {item.session.teacher && (
                              <p className="text-sm text-muted-foreground">
                                with {item.session.teacher.firstName} {item.session.teacher.lastName}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={item.checkedIn ? "default" : "secondary"}>
                              {item.checkedIn ? "Checked In" : "Booked"}
                            </Badge>
                            {item.session.inPersonLocation && (
                              <span className="text-xs text-muted-foreground">
                                {item.session.inPersonLocation.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent sessions found.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Active Memberships */}
          <Collapsible open={showMemberships} onOpenChange={setShowMemberships}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Active Memberships ({memberMemberships.length})
                </span>
                {showMemberships ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {isLoadingDetails ? (
                <Skeleton className="h-32 w-full" />
              ) : memberMemberships.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {memberMemberships.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.membership.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.startDate), "MMM d, yyyy")}
                              {item.endDate && ` - ${format(new Date(item.endDate), "MMM d, yyyy")}`}
                            </p>
                            {item.usageLimitForSessions && (
                              <p className="text-sm">
                                Sessions: {item.usedSessions || 0} / {item.usageLimitForSessions}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={item.isFrozen ? "destructive" : "default"}>
                              {item.isFrozen ? "Frozen" : "Active"}
                            </Badge>
                            <Badge variant="outline">{item.membership.type}</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active memberships found.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
