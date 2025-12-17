import { useState, useEffect, useRef } from "react";
import { Search, User, Check, Loader2, Phone, Mail, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { momenceAPI, type MomenceMember, type MomenceMemberDetails } from "@/lib/momenceAPI";
import { useToast } from "@/hooks/use-toast";

interface ClientSearchProps {
  onClientSelect: (client: MomenceMemberDetails) => void;
  selectedClientId?: string;
  className?: string;
}

export function ClientSearch({ onClientSelect, selectedClientId, className }: ClientSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MomenceMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState<MomenceMemberDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const { toast } = useToast();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Search for clients with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await momenceAPI.searchCustomers(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching clients:", error);
        toast({
          title: "Search Error",
          description: "Failed to search clients from Momence. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, toast]);

  const handleClientSelect = async (client: MomenceMember) => {
    setIsLoadingDetails(true);
    try {
      const fullDetails = await momenceAPI.getCustomerById(client.id);
      if (fullDetails) {
        const formattedData = momenceAPI.formatCustomerData(fullDetails);
        setSelectedClient(formattedData);
        onClientSelect(formattedData);
        setIsOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        
        const clientName = `${formattedData.firstName || ''} ${formattedData.lastName || ''}`.trim() || 'Client';
        toast({
          title: "Client Selected",
          description: `${clientName} details loaded successfully.`,
        });
      }
    } catch (error) {
      console.error("Error loading client details:", error);
      toast({
        title: "Error",
        description: "Failed to load client details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getClientInitials = (client: MomenceMember) => {
    const firstName = client.firstName || "";
    const lastName = client.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getClientDisplayName = (client: MomenceMember) => {
    const firstName = client.firstName || "";
    const lastName = client.lastName || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return client.email || client.phoneNumber || client.phone || "Unknown";
  };

  return (
    <div className={className}>
      <Label htmlFor="client-search" className="text-sm font-medium">
        Client Information
      </Label>
      
      {selectedClient ? (
        <div className="mt-2">
          <div className="flex items-start justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedClient.pictureUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getClientInitials(selectedClient)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-900">{`${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || "Unknown Client"}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedClient.email && (
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {selectedClient.email}
                      </span>
                    )}
                    {selectedClient.phone && (
                      <span className="inline-flex items-center text-xs text-gray-600">
                        <Phone className="h-3 w-3 mr-1" />
                        {selectedClient.phone}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Member ID */}
                <div className="text-xs text-gray-500 font-mono">ID: {selectedClient.id}</div>
                
                {/* Recent Sessions */}
                {selectedClient.recentSessions && selectedClient.recentSessions.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Recent Sessions:</span> {selectedClient.recentSessions.length} sessions
                    {selectedClient.lastSessionDate && (
                      <div className="text-gray-500 mt-1">Last: {new Date(selectedClient.lastSessionDate).toLocaleDateString()}</div>
                    )}
                  </div>
                )}
                
                {/* Memberships Info */}
                {selectedClient.activeMemberships && selectedClient.activeMemberships.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Active Memberships:</span> {selectedClient.activeMemberships.length}
                  </div>
                )}
                {selectedClient.totalMemberships > 0 && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Total Past Memberships:</span> {selectedClient.totalMemberships - (selectedClient.activeMemberships?.length || 0)}
                  </div>
                )}

                {/* Client Status Badges */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant={selectedClient.membershipStatus === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {selectedClient.membershipStatus}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedClient.activityLevel}
                  </Badge>
                  {selectedClient.totalSessions > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedClient.totalSessions} sessions
                    </Badge>
                  )}
                </div>

                {/* Membership Info */}
                {selectedClient.currentMembershipName && (
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Membership:</span> {selectedClient.currentMembershipName}
                    {selectedClient.creditsLeft !== null && (
                      <span className="ml-2">• {selectedClient.creditsLeft} credits left</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-xs"
            >
              Change Client
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-2 w-full justify-start text-left font-normal"
              id="client-search"
            >
              <Search className="h-4 w-4 mr-2" />
              Search for client...
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Search Client from Momence</DialogTitle>
              <DialogDescription>Type a name, email, or phone and select a client from results.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleClientSelect(client)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.pictureUrl} />
                        <AvatarFallback className="text-xs">
                          {getClientInitials(client)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {getClientDisplayName(client)}
                        </div>
                        <div className="text-xs text-gray-500 space-x-2">
                          {client.email && (
                            <span className="inline-flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {client.email}
                            </span>
                          )}
                          {client.phoneNumber && (
                            <span className="inline-flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {client.phoneNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {isLoadingDetails ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery.trim().length < 2 ? (
                      <div className="space-y-2">
                        <User className="h-8 w-8 mx-auto text-gray-300" />
                        <p>Enter at least 2 characters to search</p>
                      </div>
                    ) : isSearching ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-300" />
                        <p>Searching clients...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <User className="h-8 w-8 mx-auto text-gray-300" />
                        <p>No clients found</p>
                        <p className="text-xs">Try searching by name, email, or phone number</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!selectedClient && searchResults.length === 0 && !isSearching && searchQuery.length === 0 && (
                <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    Start typing a client name, email, or phone number to search.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}