// Momence API Service
// Handles authentication and customer data fetching from Momence

export type MomenceMember = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  pictureUrl?: string;
};

export type MomenceMemberDetails = MomenceMember & Record<string, any>;

export type MomenceSession = {
  id: string;
  name?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  durationInMinutes?: number;
  teacher?: { id?: string; firstName?: string; lastName?: string; email?: string; pictureUrl?: string };
  [key: string]: any;
};

class MomenceAPI {
  private accessToken: string = '';
  private refreshToken: string = '';
  private baseURL: string;
  private authToken: string;
  private username: string;
  private password: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_MOMENCE_API_BASE_URL || 'https://api.momence.com/api/v2';
    this.authToken = import.meta.env.VITE_MOMENCE_AUTH_TOKEN || '';
    this.username = import.meta.env.VITE_MOMENCE_USERNAME || '';
    this.password = import.meta.env.VITE_MOMENCE_PASSWORD || '';
    
    // Debug: Check if environment variables are set
    if (!this.authToken || !this.username || !this.password) {
      console.warn('Momence API: Missing environment variables. Customer search will be disabled.');
      console.warn({
        hasAuthToken: !!this.authToken,
        hasUsername: !!this.username,
        hasPassword: !!this.password
      });
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      // Check if credentials are available
      if (!this.authToken || !this.username || !this.password) {
        console.warn('Momence API: Cannot authenticate - missing credentials');
        return false;
      }

      console.log('Momence API: Attempting authentication...');
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Basic ${this.authToken}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.username,
          password: this.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Momence auth failed:', response.status, response.statusText, errorText);
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      console.log('Momence auth success:', { 
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token || !!data.refreshToken,
        tokenType: data.token_type 
      });
      
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || data.refreshToken;
      
      return true;
    } catch (error) {
      console.error('Momence authentication error:', error);
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Basic ${this.authToken}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refreshToken;
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async searchCustomers(query: string): Promise<any[]> {
    try {
      // Early return if no credentials
      if (!this.authToken || !this.username || !this.password) {
        console.warn('Momence API: Customer search disabled - missing environment variables');
        return [];
      }

      if (!this.accessToken) {
        console.log('Momence API: No access token, authenticating...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          console.warn('Momence API: Authentication failed, skipping search');
          return [];
        }
      }

      console.log('Momence API: Searching for:', query);
      
      // Use the correct search endpoint with query parameter
      const searchUrl = `${this.baseURL}/host/members?page=0&pageSize=100&sortOrder=ASC&sortBy=firstName&query=${encodeURIComponent(query)}`;
      console.log('Momence API: Search URL:', searchUrl);
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 401) {
        console.log('Momence API: Token expired, refreshing...');
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.searchCustomers(query);
        } else {
          console.warn('Momence API: Token refresh failed');
          return [];
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Momence search failed:', response.status, response.statusText, errorText);
        return [];
      }

      const data = await response.json();
      console.log('Momence API: Search response:', { 
        resultsCount: data.payload?.length || 0,
        totalCount: data.pagination?.totalCount || 0,
        page: data.pagination?.page || 0
      });
      
      return data.payload || [];
    } catch (error) {
      console.error('Customer search error:', error);
      return [];
    }
  }

  async getCustomerById(memberId: string): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      console.log('Momence API: Fetching comprehensive customer data for ID:', memberId);

      // Fetch basic member details
      const memberResponse = await fetch(
        `${this.baseURL}/host/members/${memberId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (memberResponse.status === 401) {
        await this.refreshAccessToken();
        return this.getCustomerById(memberId);
      }

      if (!memberResponse.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const memberData = await memberResponse.json();

      // Fetch customer sessions
      const sessionsResponse = await fetch(
        `${this.baseURL}/host/members/${memberId}/sessions?page=0&pageSize=100&sortOrder=ASC&sortBy=startsAt&includeCancelled=true`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      let sessionsData = { payload: [] };
      if (sessionsResponse.ok) {
        sessionsData = await sessionsResponse.json();
      }

      // Fetch active memberships
      const membershipsResponse = await fetch(
        `${this.baseURL}/host/members/${memberId}/bought-memberships/active?page=0&pageSize=200`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      let membershipsData = { payload: [] };
      if (membershipsResponse.ok) {
        membershipsData = await membershipsResponse.json();
      }

      // Combine all data
      const comprehensiveData = {
        ...memberData,
        sessions: sessionsData.payload || [],
        activeMemberships: membershipsData.payload || [],
        totalSessions: (sessionsData.payload || []).length,
        totalMemberships: (membershipsData.payload || []).length
      };

      console.log('Momence API: Customer data fetched:', {
        memberId,
        sessionsCount: comprehensiveData.sessions.length,
        membershipsCount: comprehensiveData.activeMemberships.length
      });

      return comprehensiveData;
    } catch (error) {
      console.error('Get customer error:', error);
      return null;
    }
  }

  async getCustomerBookings(memberId: string): Promise<any[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await fetch(
        `${this.baseURL}/host/members/${memberId}/bookings`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.status === 401) {
        await this.refreshAccessToken();
        return this.getCustomerBookings(memberId);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch customer bookings');
      }

      const data = await response.json();
      return data.payload || [];
    } catch (error) {
      console.error('Get customer bookings error:', error);
      return [];
    }
  }

  formatCustomerData(customer: any) {
    const activeMembership = customer.activeMemberships?.[0];
    const recentSessions = customer.sessions?.slice(-5) || [];
    const lastSession = customer.sessions?.[customer.sessions.length - 1];
    
    return {
      id: customer.id,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phoneNumber || customer.phone || '',
      pictureUrl: customer.pictureUrl || '',
      
      // Timeline data
      firstSeen: customer.firstSeen || null,
      lastSeen: customer.lastSeen || null,
      
      // Visit statistics
      totalVisits: (customer.sessions || []).length || customer.visits?.total || 0,
      totalAppointments: customer.visits?.appointments || 0,
      totalBookings: (customer.sessions || []).filter((s: any) => s.session).length || customer.visits?.bookings || 0,
      appointmentVisits: customer.visits?.appointmentsVisits || 0,
      bookingVisits: (customer.sessions || []).filter((s: any) => s.checkedIn).length || customer.visits?.bookingsVisits || 0,
      openAreaVisits: customer.visits?.openAreaVisits || 0,
      
      // Session data
      sessions: customer.sessions || [],
      totalSessions: (customer.sessions || []).length || customer.totalSessions || 0,
      recentSessions: recentSessions,
      lastSessionDate: lastSession?.session?.startsAt || null,
      lastSessionName: lastSession?.session?.name || null,
      
      // Membership data
      activeMemberships: customer.activeMemberships || [],
      totalMemberships: customer.totalMemberships || 0,
      currentMembershipName: activeMembership?.membership?.name || null,
      currentMembershipType: activeMembership?.type || null,
      membershipStartDate: activeMembership?.startDate || null,
      membershipEndDate: activeMembership?.endDate || null,
      membershipFrozen: activeMembership?.isFrozen || false,
      creditsLeft: activeMembership?.eventCreditsLeft || null,
      sessionsUsed: activeMembership?.usedSessions || 0,
      sessionsLimit: activeMembership?.usageLimitForSessions || null,
      appointmentsUsed: activeMembership?.usedAppointments || 0,
      appointmentsLimit: activeMembership?.usageLimitForAppointments || null,
      
      // Custom fields and tags
      customerFields: customer.customerFields || [],
      customerTags: customer.customerTags || [],
      
      // Computed status
      membershipStatus: this.getMembershipStatus(activeMembership),
      activityLevel: this.getActivityLevel(customer.visits?.total || 0),
      
      // Legacy fields for compatibility
      membershipId: activeMembership?.membership?.id || '',
      joinDate: customer.firstSeen || null,
      lastVisit: customer.lastSeen || null,
      notes: customer.notes || '',
    };
  }

  private getMembershipStatus(membership: any): string {
    if (!membership) return 'inactive';
    if (membership.isFrozen) return 'frozen';
    
    const endDate = membership.endDate ? new Date(membership.endDate) : null;
    const now = new Date();
    
    if (endDate && endDate < now) return 'expired';
    return 'active';
  }

  private getActivityLevel(totalVisits: number): string {
    if (totalVisits === 0) return 'new';
    if (totalVisits <= 5) return 'beginner';
    if (totalVisits <= 20) return 'regular';
    if (totalVisits <= 50) return 'frequent';
    return 'vip';
  }

  // Session management methods
  async getSessions(page: number = 0, pageSize: number = 200, startsBefore?: string, locationId?: string): Promise<any> {
    try {
      // Early return if no credentials
      if (!this.authToken || !this.username || !this.password) {
        console.warn('Momence API: Sessions fetch disabled - missing environment variables');
        return { payload: [], pagination: { totalCount: 0, page: 0, pageSize: 0 } };
      }

      if (!this.accessToken) {
        console.log('Momence API: No access token for sessions, authenticating...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          console.warn('Momence API: Authentication failed for sessions');
          return { payload: [], pagination: { totalCount: 0, page: 0, pageSize: 0 } };
        }
      }

      // Default startsBefore to tomorrow to avoid future classes
      let startsBeforeParam = startsBefore;
      if (!startsBeforeParam) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startsBeforeParam = `${tomorrow.toISOString().split('.')[0]}Z`;
      }

      let url = `${this.baseURL}/host/sessions?page=${page}&pageSize=${pageSize}&sortOrder=DESC&sortBy=startsAt&includeCancelled=false&startsBefore=${encodeURIComponent(startsBeforeParam)}`;
      
      // Add locationId if provided
      if (locationId) {
        url += `&locationId=${encodeURIComponent(locationId)}`;
      }

      console.log(`Momence API: Fetching sessions page ${page} with pageSize ${pageSize} before ${startsBeforeParam}${locationId ? ` for location ${locationId}` : ''}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 401) {
        console.log('Momence API: Token expired during sessions fetch, refreshing...');
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.getSessions(page, pageSize, startsBeforeParam, locationId);
        } else {
          console.warn('Momence API: Token refresh failed for sessions');
          return { payload: [], pagination: { totalCount: 0, page: 0, pageSize: 0 } };
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Momence sessions fetch failed:', response.status, response.statusText, errorText);
        return { payload: [], pagination: { totalCount: 0, page: 0, pageSize: 0 } };
      }

      const data = await response.json();
      console.log(`Momence API: Successfully fetched ${data.payload?.length || 0} sessions`);
      return data;
    } catch (error) {
      console.error('Get sessions error:', error);
      return { payload: [], pagination: { totalCount: 0, page: 0, pageSize: 0 } };
    }
  }

  async getSessionById(sessionId: string): Promise<any> {
    try {
      // Early return if no credentials
      if (!this.authToken || !this.username || !this.password) {
        console.warn('Momence API: Session details fetch disabled - missing environment variables');
        return null;
      }

      if (!this.accessToken) {
        console.log('Momence API: No access token for session details, authenticating...');
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          console.warn('Momence API: Authentication failed for session details');
          return null;
        }
      }

      console.log(`Momence API: Fetching session details for ${sessionId}`);
      
      const response = await fetch(`${this.baseURL}/host/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${this.accessToken}`,
        },
      });

      if (response.status === 401) {
        console.log('Momence API: Token expired during session details fetch, refreshing...');
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.getSessionById(sessionId);
        } else {
          console.warn('Momence API: Token refresh failed for session details');
          return null;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Momence session ${sessionId} fetch failed:`, response.status, response.statusText, errorText);
        return null;
      }

      const data = await response.json();
      console.log(`Momence API: Successfully fetched details for session ${sessionId}`);
      return data;
    } catch (error) {
      console.error('Get session details error:', error);
      return null;
    }
  }

  async getAllSessionsWithDetails(maxPages: number = 5, startsBefore?: string, locationId?: string): Promise<any[]> {
    try {
      let allSessions: any[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      console.log(`Momence API: Starting to fetch all sessions with details (max ${maxPages} pages)${locationId ? ` for location ${locationId}` : ''}`);

      while (hasMoreData && currentPage < maxPages) {
        const response = await this.getSessions(currentPage, 200, startsBefore, locationId);
        
        if (response.payload && response.payload.length > 0) {
          console.log(`Momence API: Processing page ${currentPage} with ${response.payload.length} sessions`);
          
          // Fetch detailed information for each session
          const sessionsWithDetails = await Promise.all(
            response.payload.map(async (session: any) => {
              try {
                const detailedSession = await this.getSessionById(session.id);
                return {
                  ...session,
                  detailedInfo: detailedSession
                };
              } catch (error) {
                console.error(`Error fetching details for session ${session.id}:`, error);
                return session; // Return original session if detailed fetch fails
              }
            })
          );

          allSessions = [...allSessions, ...sessionsWithDetails];
          
          // Check if we've reached the end
          if (response.payload.length < 200 || response.pagination?.totalCount <= (currentPage + 1) * 200) {
            hasMoreData = false;
          } else {
            currentPage++;
          }
        } else {
          hasMoreData = false;
        }
      }

      console.log(`Momence API: Fetched total of ${allSessions.length} sessions with details`);
      return allSessions;
    } catch (error) {
      console.error('Error fetching all sessions with details:', error);
      return [];
    }
  }

  formatSessionData(session: any): any {
    if (!session) return null;

    const detailed = session.detailedInfo || session;
    
    return {
      id: session.id,
      name: session.name,
      description: session.description,
      type: session.type,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      durationInMinutes: session.durationInMinutes,
      capacity: detailed.capacity || session.capacity,
      bookingCount: detailed.bookingCount || session.bookingCount,
      waitlistCapacity: detailed.waitlistCapacity,
      waitlistBookingCount: detailed.waitlistBookingCount,
      teacher: {
        id: session.teacher?.id,
        firstName: session.teacher?.firstName,
        lastName: session.teacher?.lastName,
        fullName: `${session.teacher?.firstName || ''} ${session.teacher?.lastName || ''}`.trim(),
        email: detailed.teacher?.email || session.teacher?.email,
        pictureUrl: session.teacher?.pictureUrl
      },
      originalTeacher: detailed.originalTeacher,
      additionalTeachers: detailed.additionalTeachers || [],
      isRecurring: session.isRecurring,
      isCancelled: session.isCancelled,
      isInPerson: session.isInPerson,
      isDraft: session.isDraft,
      inPersonLocation: session.inPersonLocation,
      zoomLink: detailed.zoomLink,
      zoomMeetingId: detailed.zoomMeetingId,
      zoomMeetingPassword: detailed.zoomMeetingPassword,
      onlineStreamUrl: session.onlineStreamUrl || detailed.onlineStreamUrl,
      onlineStreamPassword: session.onlineStreamPassword || detailed.onlineStreamPassword,
      bannerImageUrl: session.bannerImageUrl,
      hostPhotoUrl: session.hostPhotoUrl,
      tags: session.tags || [],
      availableSpots: (detailed.capacity || session.capacity || 0) - (detailed.bookingCount || session.bookingCount || 0),
      utilizationRate: detailed.capacity ? Math.round(((detailed.bookingCount || 0) / detailed.capacity) * 100) : 0,
      sessionStatus: session.isCancelled ? 'Cancelled' : session.isDraft ? 'Draft' : 'Active'
    };
  }

  // Helper to convert location name to Momence locationId
  getLocationId(locationName?: string): string | undefined {
    if (!locationName) return undefined;
    
    const locationMap: Record<string, string> = {
      'Kwality House': '9030',
      'Supreme HQ, Bandra': '29821',
      'Supreme HQ Bandra': '29821',
      'Kwality House, Kemps Corner': '9030'
    };
    
    // Try direct match first
    if (locationMap[locationName]) {
      return locationMap[locationName];
    }
    
    // Try case-insensitive substring match
    const lowerName = (locationName ?? '').toLowerCase();
    for (const [key, value] of Object.entries(locationMap)) {
      if (lowerName.includes((key ?? '').toLowerCase())) {
        return value;
      }
    }
    
    // For Pop Up, Kenkere House, or other locations - don't include locationId
    return undefined;
  }

  async getSessionsByLocation(locationName?: string): Promise<any> {
    const locationId = this.getLocationId(locationName);
    return this.getSessions(0, 200, undefined, locationId);
  }

  async getAllSessionsByLocationWithDetails(locationName?: string, maxPages: number = 5): Promise<any[]> {
    const locationId = this.getLocationId(locationName);
    return this.getAllSessionsWithDetails(maxPages, undefined, locationId);
  }
}

export const momenceAPI = new MomenceAPI();