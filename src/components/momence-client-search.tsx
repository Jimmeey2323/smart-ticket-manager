import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  // Extended fields from detailed fetch
  membershipStatus?: string;
  currentMembershipName?: string;
  currentMembershipType?: string;
  membershipStartDate?: string;
  membershipEndDate?: string;
  sessionsLimit?: number;
  sessionsUsed?: number;
  appointmentsLimit?: number;
  appointmentsUsed?: number;
  creditsLeft?: number;
  totalBookings?: number;
  totalSessions?: number;
  totalAppointments?: number;
  appointmentVisits?: number;
  bookingVisits?: number;
  openAreaVisits?: number;
  activeMemberships?: any[];
  recentSessions?: any[];
  activityLevel?: string;
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
    durationInMinutes?: number;
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
  formData?: any;
  setFormData?: (data: any) => void;
}

export function MomenceClientSearch({ 
  onClientSelect, 
  selectedClient,
  formData,
  setFormData 
}: MomenceClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MomenceMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [memberSessions, setMemberSessions] = useState<MemberSession[]>([]);
  const [memberMemberships, setMemberMemberships] = useState<MemberMembership[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke("momence-api", {
          body: { action: "searchMembers", query: searchQuery },
        });

        if (error) throw error;
        setSearchResults(data.payload || []);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

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

  const handleCustomerSelect = async (customer: MomenceMember) => {
    const displayCustomer = {
      ...customer,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'Unknown Customer'
    };
    
    onClientSelect(displayCustomer);
    setShowResults(false);
    setSearchQuery('');
    setIsCollapsed(false);
    setIsLoadingDetails(true);

    try {
      await loadMemberDetails(customer.id);
      
      // Update form data if setFormData is provided
      if (setFormData && formData) {
        setFormData({
          ...formData,
          customerName: `${customer.firstName} ${customer.lastName}`.trim(),
          customerEmail: customer.email,
          customerPhone: customer.phoneNumber,
          momenceCustomerId: customer.id.toString(),
          membershipStatus: customer.membershipStatus || 'unknown',
          totalBookings: customer.visits?.totalVisits || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const clearSelection = () => {
    onClientSelect(null);
    setMemberSessions([]);
    setMemberMemberships([]);
    setIsExpanded(false);
    setShowManualEntry(false);
    
    if (setFormData && formData) {
      setFormData({
        ...formData,
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        momenceCustomerId: '',
        membershipStatus: '',
        totalBookings: 0,
      });
    }
  };

  const handleManualEntry = () => {
    setShowManualEntry(true);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get membership status from memberships
  const getMembershipStatus = () => {
    if (memberMemberships.length === 0) return 'inactive';
    const hasActive = memberMemberships.some(m => !m.isFrozen && (!m.endDate || new Date(m.endDate) > new Date()));
    const hasFrozen = memberMemberships.some(m => m.isFrozen);
    if (hasActive) return 'active';
    if (hasFrozen) return 'frozen';
    return 'expired';
  };

  const membershipStatus = getMembershipStatus();

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 backdrop-blur-sm p-6 cursor-pointer flex items-center justify-between"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-foreground/20">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary-foreground">Customer Information</h3>
            <p className="text-primary-foreground/70 text-sm">Search Momence database or enter manually</p>
          </div>
        </div>
        <button type="button" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20 rounded-xl p-2 transition-all duration-300 border border-primary-foreground/10 backdrop-blur-sm">
          <svg className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-6">
          {!selectedClient && !showManualEntry ? (
            <>
              {/* Search Section */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  🔍 Search Customer Database
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full px-4 py-3 pl-12 border border-border/30 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary bg-background/70 backdrop-blur-sm transition-all shadow-sm hover:shadow-md"
                  />
                  <div className="absolute left-4 top-3.5">
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    ) : (
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                {showResults && (
                  <div className="absolute z-10 w-full mt-2 bg-card/90 backdrop-blur-xl border border-border/30 rounded-xl shadow-xl max-h-64 overflow-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((customer, index) => (
                        <div
                          key={index}
                          onClick={() => handleCustomerSelect(customer)}
                          className="p-4 hover:bg-accent/50 hover:backdrop-blur-sm cursor-pointer border-b border-border/50 last:border-b-0 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-foreground">
                                {`${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email}
                              </div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                              {customer.phoneNumber && <div className="text-sm text-muted-foreground">{customer.phoneNumber}</div>}
                            </div>
                            {customer.visits && (
                              <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                                {customer.visits.totalVisits} visits
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No customers found. Try a different search term.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="w-full px-4 py-3 bg-gradient-to-r from-secondary/80 to-accent/80 hover:from-secondary hover:to-accent text-foreground rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Enter Customer Details Manually
                </button>
              </div>
            </>
          ) : selectedClient ? (
            /* Customer Profile */
            <div className="space-y-4">
              {isLoadingDetails && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-muted-foreground text-sm">Loading customer data...</span>
                  </div>
                </div>
              )}
              
              {/* Essential Customer Card */}
              <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {selectedClient.pictureUrl ? (
                        <img 
                          src={selectedClient.pictureUrl} 
                          alt={`${selectedClient.firstName} ${selectedClient.lastName}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold shadow-sm">
                          {selectedClient.firstName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background shadow-sm ${
                        membershipStatus === 'active' ? 'bg-green-500' : 
                        membershipStatus === 'frozen' ? 'bg-blue-500' :
                        membershipStatus === 'expired' ? 'bg-red-500' : 'bg-muted'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-foreground">
                          {selectedClient.firstName} {selectedClient.lastName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          membershipStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          membershipStatus === 'frozen' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          membershipStatus === 'expired' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-muted text-muted-foreground'
                        }`}>
                          {membershipStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{selectedClient.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                          </svg>
                          <span className="font-medium text-primary">{selectedClient.visits?.totalVisits || 0} visits</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate">{selectedClient.phoneNumber || 'No phone'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="font-medium text-purple-600 dark:text-purple-400">{memberSessions.length} sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg p-2 transition-all duration-200"
                      title={isExpanded ? 'Collapse details' : 'View full details'}
                    >
                      <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-all duration-200"
                      title="Clear selection"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Customer Tags */}
                {selectedClient.customerTags && selectedClient.customerTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                    {selectedClient.customerTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                        style={{ backgroundColor: tag.badgeColor ? tag.badgeColor + '20' : 'hsl(var(--muted))', color: tag.badgeColor || 'hsl(var(--muted-foreground))' }}
                      >
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: tag.badgeColor || 'hsl(var(--muted-foreground))' }}
                        ></div>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-6">
                    {/* Activity Overview */}
                    <div className="bg-gradient-to-br from-muted/50 to-accent/30 rounded-xl p-6 shadow-sm">
                      <h5 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                        </svg>
                        Activity Overview
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center bg-card rounded-xl p-4 shadow-sm">
                          <div className="text-3xl font-bold text-primary mb-1">{selectedClient.visits?.totalVisits || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Visits</div>
                        </div>
                        <div className="text-center bg-card rounded-xl p-4 shadow-sm">
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{selectedClient.visits?.bookings || 0}</div>
                          <div className="text-sm text-muted-foreground">Bookings</div>
                        </div>
                        <div className="text-center bg-card rounded-xl p-4 shadow-sm">
                          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{memberSessions.length}</div>
                          <div className="text-sm text-muted-foreground">Sessions</div>
                        </div>
                        <div className="text-center bg-card rounded-xl p-4 shadow-sm">
                          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{memberMemberships.length}</div>
                          <div className="text-sm text-muted-foreground">Active Plans</div>
                        </div>
                      </div>
                    </div>

                    {/* Active Memberships */}
                    {memberMemberships.length > 0 && (
                      <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm">
                        <h5 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Active Memberships
                        </h5>
                        <div className="space-y-3">
                          {memberMemberships.map((membership) => (
                            <div key={membership.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                              <div>
                                <div className="font-semibold text-foreground">{membership.membership.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(membership.startDate)} - {membership.endDate ? formatDate(membership.endDate) : 'Ongoing'}
                                </div>
                                {membership.usageLimitForSessions && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Sessions: {membership.usedSessions || 0} / {membership.usageLimitForSessions}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  membership.isFrozen ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                  {membership.isFrozen ? 'Frozen' : 'Active'}
                                </span>
                                <span className="text-xs text-muted-foreground">{membership.membership.type}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Sessions */}
                    {memberSessions.length > 0 && (
                      <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm">
                        <h5 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Recent Sessions
                        </h5>
                        <div className="space-y-3">
                          {memberSessions.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/70 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${
                                  item.checkedIn ? 'bg-green-500' : item.cancelledAt ? 'bg-red-500' : 'bg-primary'
                                }`}></div>
                                <div>
                                  <div className="font-semibold text-foreground">{item.session.name}</div>
                                  {item.session.teacher && (
                                    <div className="text-sm text-muted-foreground">
                                      with {item.session.teacher.firstName} {item.session.teacher.lastName}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground">{formatDate(item.session.startsAt)}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  item.checkedIn ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                  item.cancelledAt ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary/10 text-primary'
                                }`}>
                                  {item.checkedIn ? 'Attended' : item.cancelledAt ? 'Cancelled' : 'Booked'}
                                </span>
                                {item.session.inPersonLocation && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.session.inPersonLocation.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Timeline */}
                    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm">
                      <h5 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Member Timeline
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-1">First Seen</div>
                          <div className="font-semibold text-green-700 dark:text-green-400">{formatDate(selectedClient.firstSeen)}</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-1">Last Visit</div>
                          <div className="font-semibold text-blue-700 dark:text-blue-400">{formatDate(selectedClient.lastSeen)}</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-1">Member ID</div>
                          <div className="font-semibold text-purple-700 dark:text-purple-400">{selectedClient.id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Manual Entry Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground">Manual Customer Entry</h4>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ← Back to search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData?.customerName || ''}
                    onChange={(e) => setFormData?.({ ...formData, customerName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background/70 backdrop-blur-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData?.customerEmail || ''}
                    onChange={(e) => setFormData?.({ ...formData, customerEmail: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background/70 backdrop-blur-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData?.customerPhone || ''}
                    onChange={(e) => setFormData?.({ ...formData, customerPhone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background/70 backdrop-blur-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Membership Status</label>
                  <select
                    value={formData?.membershipStatus || ''}
                    onChange={(e) => setFormData?.({ ...formData, membershipStatus: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background/70 backdrop-blur-sm transition-all"
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="frozen">Frozen</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
