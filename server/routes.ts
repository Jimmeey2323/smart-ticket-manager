import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs/promises";
import path from "path";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import { createClient } from "@supabase/supabase-js";
import { insertTicketSchema, insertTicketCommentSchema, insertTeamSchema, insertStudioSchema, insertCategorySchema, insertNotificationSchema, updateTicketSchema, updateTeamSchema, updateStudioSchema } from "@shared/schema";
import { storage } from "./storage";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Since we're skipping database operations for now, return user from token
      const user = req.user?.profile || {
        id: req.user.claims.sub,
        email: req.user.claims.email,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      // Return empty array for now since database is not connected
      res.json([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/teams', async (req, res) => {
    try {
      // Return empty array for now since database is not connected
      res.json([]);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.post('/api/teams', isAuthenticated, async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      // For now, just return a mock team object
      const team = {
        id: crypto.randomUUID(),
        ...teamData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(400).json({ message: "Failed to create team" });
    }
  });

  app.patch('/api/teams/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = updateTeamSchema.parse(req.body);
      // For now, just return a mock updated team
      const team = {
        id: req.params.id,
        ...updates,
        updatedAt: new Date()
      };
      res.json(team);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(400).json({ message: "Failed to update team" });
    }
  });

  app.get('/api/studios', async (req, res) => {
    try {
      const studios = await storage.getStudios();
      res.json(studios);
    } catch (error) {
      console.error("Error fetching studios:", error);
      // Fallback to hardcoded studios if database fails
      const fallbackStudios = [
        { id: "bb4c3259-d990-4f37-ba3d-fa5df1002f73", name: "Kwality House Kemps Corner", code: "KH-KC", city: "Mumbai" },
        { id: "ffa43ab8-f8d4-4bd2-bfce-3d1975ed7a12", name: "Kenkre House", code: "KENKRE", city: "Mumbai" },
        { id: "b9fbcb4c-7ab9-460d-bdba-9d7f7e376281", name: "South United Football Club", code: "SUFC", city: "Mumbai" },
        { id: "848980b2-098a-4719-9d1f-52f3f5201a08", name: "Supreme HQ Bandra", code: "SHQ-BDR", city: "Mumbai" },
        { id: "426ab626-5e56-4cae-a87c-fceb9a7b5cbc", name: "WeWork Prestige Central", code: "WW-PC", city: "Bangalore" },
        { id: "91ba5ee9-fa33-424c-b90a-143ada8ef68e", name: "WeWork Galaxy", code: "WW-GAL", city: "Delhi" },
        { id: "83b2da09-d557-4aa4-8200-7f0bd7e70239", name: "The Studio by Copper + Cloves", code: "CC-STU", city: "Gurgaon" },
      ];
      res.json(fallbackStudios);
    }
  });

  app.post('/api/studios', isAuthenticated, async (req, res) => {
    try {
      const studioData = insertStudioSchema.parse(req.body);
      // For now, just return a mock studio object
      const studio = {
        id: crypto.randomUUID(),
        ...studioData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      res.status(201).json(studio);
    } catch (error) {
      console.error("Error creating studio:", error);
      res.status(400).json({ message: "Failed to create studio" });
    }
  });

  app.patch('/api/studios/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = updateStudioSchema.parse(req.body);
      // For now, just return a mock updated studio
      const studio = {
        id: req.params.id,
        ...updates,
        updatedAt: new Date()
      };
      res.json(studio);
    } catch (error) {
      console.error("Error updating studio:", error);
      res.status(400).json({ message: "Failed to update studio" });
    }
  });

  app.get('/api/categories', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('isActive', true)
        .order('name');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });
      
      const categoryData = insertCategorySchema.parse(req.body);
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  app.get('/api/subcategories', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });
      
      const categoryId = req.query.categoryId as string | undefined;
      let query = supabase.from('subcategories').select('*').eq('isActive', true);
      
      if (categoryId) {
        query = query.eq('categoryId', categoryId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  app.get('/api/tickets', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });
      
      const filters = {
        status: req.query.status as string | undefined,
        priority: req.query.priority as string | undefined,
        category: req.query.category as string | undefined,
        studioId: (req.query.studioId || req.query.studio) as string | undefined,
        assignedToUserId: req.query.assignedToUserId as string | undefined,
        search: req.query.search as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      };
      
      let query = supabase.from('tickets').select('*');
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.studioId) query = query.eq('studioId', filters.studioId);
      if (filters.assignedToUserId) query = query.eq('assignedToUserId', filters.assignedToUserId);
      if (filters.search) query = query.ilike('title', `%${filters.search}%`);
      
      if (filters.limit) query = query.limit(filters.limit);
      if (filters.offset) query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      
      const { data, error } = await query.order('createdAt', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get('/api/tickets/:id', async (req, res) => {
    try {
      // Prefer Supabase (consistent with list endpoint), fall back to storage if needed
      if (supabase) {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            category:categories(id, name, code, icon, color),
            subcategory:subcategories(id, name, code),
            studio:studios(id, name, code),
            assignedTo:users!tickets_assignedToUserId_fkey(id, firstName, lastName, displayName, email),
            reportedBy:users!tickets_reportedByUserId_fkey(id, firstName, lastName, displayName)
          `)
          .eq('id', req.params.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
        if (data) return res.json(data);
        // If not found by id, try by ticket number
        const { data: byNumber, error: numberErr } = await supabase
          .from('tickets')
          .select(`
            *,
            category:categories(id, name, code, icon, color),
            subcategory:subcategories(id, name, code),
            studio:studios(id, name, code),
            assignedTo:users!tickets_assignedToUserId_fkey(id, firstName, lastName, displayName, email),
            reportedBy:users!tickets_reportedByUserId_fkey(id, firstName, lastName, displayName)
          `)
          .eq('ticketNumber', req.params.id)
          .single();
        if (numberErr && numberErr.code !== 'PGRST116') throw numberErr;
        if (byNumber) return res.json(byNumber);
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Fallback: use storage (drizzle)
      let ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        ticket = await storage.getTicketByNumber(req.params.id);
      }
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post('/api/tickets', isAuthenticated, async (req: any, res) => {
    try {
      // Transform incidentDateTime string to Date object if present
      if (req.body.incidentDateTime && typeof req.body.incidentDateTime === 'string') {
        req.body.incidentDateTime = new Date(req.body.incidentDateTime);
      }
      
      const ticketData = insertTicketSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const ticket = await storage.createTicket({
        ...ticketData,
        reportedByUserId: userId,
      });
      
      await storage.createTicketHistory({
        ticketId: ticket.id,
        changedByUserId: userId,
        action: 'created',
        fieldChanged: 'status',
        newValue: 'Ticket created',
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({ message: "Failed to create ticket" });
    }
  });

  app.patch('/api/tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const existingTicket = await storage.getTicket(req.params.id);
      if (!existingTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      const userId = req.user.claims.sub;
      const updates = updateTicketSchema.parse(req.body);

      for (const [key, value] of Object.entries(updates)) {
        const oldValue = (existingTicket as any)[key];
        if (oldValue !== value) {
          await storage.createTicketHistory({
            ticketId: req.params.id,
            changedByUserId: userId,
            action: 'updated',
            fieldChanged: key,
            oldValue: String(oldValue ?? ''),
            newValue: String(value ?? ''),
          });
        }
      }

      if (updates.status === 'resolved' && !updates.resolvedAt) {
        (updates as any).resolvedAt = new Date();
      }
      if (updates.status === 'closed' && !updates.closedAt) {
        (updates as any).closedAt = new Date();
      }

      const ticket = await storage.updateTicket(req.params.id, updates);
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(400).json({ message: "Failed to update ticket" });
    }
  });

  // Dev-only test endpoint to create a minimal ticket and history (no auth)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/_test/create-ticket', async (req: any, res) => {
      try {
        const ticket = await storage.createTicket({
          title: 'Dev Test Ticket',
          description: 'Created by test endpoint',
          // use a real studio UUID from your DB so the insert doesn't violate NOT NULL
          studioId: 'bb4c3259-d990-4f37-ba3d-fa5df1002f73',
        } as any);

        await storage.createTicketHistory({
          ticketId: ticket.id,
          changedByUserId: 'dev-test',
          action: 'created',
          fieldChanged: 'status',
          newValue: 'Ticket created via test endpoint',
        });

        res.json({ ticket });
      } catch (error: any) {
        console.error('Dev test create ticket error:', error);
        res.status(500).json({ message: 'Dev test create failed', error: String(error) });
      }
    });
  }

  app.delete('/api/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  app.get('/api/tickets/:id/comments', async (req, res) => {
    try {
      const comments = await storage.getTicketComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/tickets/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId: req.params.id,
        userId,
      });
      const comment = await storage.createTicketComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/tickets/:id/attachments', async (req, res) => {
    try {
      const attachments = await storage.getTicketAttachments(req.params.id);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.get('/api/tickets/:id/history', async (req, res) => {
    try {
      const history = await storage.getTicketHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Graceful degrade: return empty list when DB is unreachable
      res.json([]);
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(400).json({ message: "Failed to mark notification read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Safe defaults to avoid frontend errors when DB is down
      res.json({
        totalOpen: 0,
        totalNew: 0,
        resolvedToday: 0,
        slaBreached: 0,
        avgResolutionHours: 0,
        byStatus: [],
        byPriority: [],
        byCategory: []
      });
    }
  });

  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsData();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Safe defaults
      res.json({
        ticketsByCategory: [],
        ticketsByStudio: [],
        ticketsByTeam: [],
        ticketTrend: [],
        resolutionTimeByPriority: [],
        topCategories: []
      });
    }
  });

  // Proxy endpoints for Momence to avoid exposing API token in the browser and bypass CORS
  app.get('/api/momence/search', async (req, res) => {
    try {
      const q = String(req.query.q || '').trim();
      if (!q) return res.json({ payload: [] });

      const baseURL = process.env.MOMENCE_API_BASE_URL || process.env.VITE_MOMENCE_API_BASE_URL || 'https://api.momence.com/api/v2';
      const token = process.env.MOMENCE_AUTH_TOKEN || process.env.VITE_MOMENCE_AUTH_TOKEN || '';

      const url = `${baseURL}/host/members?page=0&pageSize=100&sortOrder=ASC&sortBy=firstName&query=${encodeURIComponent(q)}`;

      const doFetch = async (useBasic: boolean) => {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (useBasic) headers['Authorization'] = `Basic ${token}`;
        else headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { method: 'GET', headers });
      };

      let response = await doFetch(true);
      if (response.status === 401) response = await doFetch(false);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({ message: `Momence search failed: ${text}` });
      }

      const json = await response.json().catch(() => null);
      res.json(json || { payload: [] });
    } catch (error) {
      console.error('Error proxying Momence search', error);
      res.status(500).json({ message: 'Failed to proxy Momence search' });
    }
  });

  app.get('/api/momence/members/:id', async (req, res) => {
    try {
      const id = String(req.params.id || '').trim();
      if (!id) return res.status(400).json({ message: 'Missing member id' });

      const baseURL = process.env.MOMENCE_API_BASE_URL || process.env.VITE_MOMENCE_API_BASE_URL || 'https://api.momence.com/api/v2';
      const token = process.env.MOMENCE_AUTH_TOKEN || process.env.VITE_MOMENCE_AUTH_TOKEN || '';

      const url = `${baseURL}/host/members/${encodeURIComponent(id)}`;

      const doFetch = async (useBasic: boolean) => {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (useBasic) headers['Authorization'] = `Basic ${token}`;
        else headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { method: 'GET', headers });
      };

      let response = await doFetch(true);
      if (response.status === 401) response = await doFetch(false);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({ message: `Momence get member failed: ${text}` });
      }

      const json = await response.json().catch(() => null);
      res.json(json || {});
    } catch (error) {
      console.error('Error proxying Momence member fetch', error);
      res.status(500).json({ message: 'Failed to proxy Momence member fetch' });
    }
  });

  // Get all categories with their subcategories
  app.get('/api/categories', async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ message: 'Supabase client not initialized' });
      }
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, code, defaultPriority, sortOrder, isActive')
        .eq('isActive', true)
        .order('sortOrder', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Get subcategories for a specific category (accepts category name or ID)
  app.get('/api/categories/:categoryId/subcategories', async (req, res) => {
    try {
      const { categoryId } = req.params;

      if (!supabase) {
        return res.status(500).json({ message: 'Supabase client not initialized' });
      }

      // Try to find by name or code if it's not a UUID
      let actualCategoryId = categoryId;
      
      if (!categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .or(`name.eq.${categoryId},code.eq.${categoryId}`)
          .single();
        
        if (category) {
          actualCategoryId = category.id;
        } else {
          return res.json([]);
        }
      }

      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name, description, code, defaultPriority, sortOrder, isActive')
        .eq('categoryId', actualCategoryId)
        .eq('isActive', true)
        .order('sortOrder', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  });

  // Get dynamic fields for a category and subcategory (accepts category name or ID)
  app.get('/api/categories/:categoryId/fields', async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { subcategoryId } = req.query;

      if (!supabase) {
        return res.status(500).json({ message: 'Supabase client not initialized' });
      }

      // First, get the actual category ID if they passed a name/code
      let actualCategoryId = categoryId;
      
      // Try to find by name or code if it's not a UUID
      if (!categoryId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const { data: categories, error: catError } = await supabase
          .from('categories')
          .select('id, name, code')
          .or(`name.eq.${categoryId},code.eq.${categoryId}`);
        
        const category = categories?.[0];
        
        if (category) {
          actualCategoryId = category.id;
        } else {
          console.log(`Category not found for: ${categoryId}`);
          return res.json([]);
        }
      }

      // If no subcategoryId provided, return empty array - subcategory selection is required
      if (!subcategoryId) {
        return res.json([]);
      }

      // Validate that subcategoryId is a proper UUID
      if (!String(subcategoryId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.log(`Invalid subcategoryId format: ${subcategoryId}`);
        return res.status(400).json({ message: 'Invalid subcategory ID format' });
      }

      let query = supabase
        .from('dynamicFields')
        .select(`
          id,
          label,
          uniqueId,
          description,
          fieldType:fieldTypeId (id, name),
          options,
          validationRules,
          defaultValue,
          isRequired,
          isHidden,
          sortOrder,
          categoryId,
          subcategoryId
        `)
        .eq('categoryId', actualCategoryId)
        .eq('isActive', true)
        .or(`subcategoryId.eq.${subcategoryId},subcategoryId.is.null`);

      const { data, error } = await query.order('sortOrder', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error('Error fetching dynamic fields:', error);
      res.status(500).json({ message: 'Failed to fetch dynamic fields' });
    }
  });

  // Fallback: Get all fields mapping (for compatibility)
  app.get('/api/field-mapping', async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ message: 'Supabase client not initialized' });
      }
      const sb = supabase;
      const { data: categories, error: catError } = await sb
        .from('categories')
        .select('id, name')
        .eq('isActive', true);

      if (catError) throw catError;

      const mapping: Record<string, Record<string, any[]>> = {};

      for (const category of categories || []) {
        mapping[category.name] = {};

        // Get global fields for this category
        const { data: globalFields, error: globalError } = await sb
          .from('dynamicFields')
          .select(`id, label, uniqueId, description, fieldType:fieldTypeId (name), options, isRequired, isHidden, sortOrder`)
          .eq('categoryId', category.id)
          .is('subcategoryId', null)
          .eq('isActive', true)
          .order('sortOrder', { ascending: true });

        if (globalError) throw globalError;

        mapping[category.name]['Global'] = globalFields || [];

        // Get subcategories for this category
        const { data: subcategories, error: subError } = await sb
          .from('subcategories')
          .select('id, name')
          .eq('categoryId', category.id)
          .eq('isActive', true);

        if (subError) throw subError;

        // Get fields for each subcategory
        for (const sub of subcategories || []) {
          const { data: subFields, error: subFieldError } = await sb
            .from('dynamicFields')
            .select(`id, label, uniqueId, description, fieldType:fieldTypeId (name), options, isRequired, isHidden, sortOrder`)
            .eq('subcategoryId', sub.id)
            .eq('isActive', true)
            .order('sortOrder', { ascending: true });

          if (subFieldError) throw subFieldError;

          mapping[category.name][sub.name] = subFields || [];
        }
      }

      res.json(mapping);
    } catch (error) {
      console.error('Error reading field mapping:', error);
      res.status(500).json({ message: 'Failed to read field mapping' });
    }
  });

  // Momence Sessions endpoints
  app.get('/api/momence/sessions', async (req, res) => {
    try {
      const locationId = req.query.locationId ? String(req.query.locationId).trim() : undefined;
      const page = req.query.page ? parseInt(String(req.query.page)) : 0;
      const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize)) : 200;

      const baseURL = process.env.MOMENCE_API_BASE_URL || process.env.VITE_MOMENCE_API_BASE_URL || 'https://api.momence.com/api/v2';
      const token = process.env.MOMENCE_AUTH_TOKEN || process.env.VITE_MOMENCE_AUTH_TOKEN || '';

      // Build URL with optional locationId
      let url = `${baseURL}/host/sessions?page=${page}&pageSize=${pageSize}&sortOrder=DESC&sortBy=startsAt&includeCancelled=false`;
      
      if (locationId) {
        url += `&locationId=${encodeURIComponent(locationId)}`;
      }

      // Get today's date for startsBefore parameter
      const today = new Date();
      today.setDate(today.getDate() + 1);
      const startsBeforeParam = `${today.toISOString().split('.')[0]}Z`;
      url += `&startsBefore=${encodeURIComponent(startsBeforeParam)}`;

      const doFetch = async (useBasic: boolean) => {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (useBasic) headers['Authorization'] = `Basic ${token}`;
        else headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { method: 'GET', headers });
      };

      let response = await doFetch(true);
      if (response.status === 401) response = await doFetch(false);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({ message: `Momence sessions fetch failed: ${text}` });
      }

      const json = await response.json().catch(() => null);
      res.json(json || { payload: [] });
    } catch (error) {
      console.error('Error proxying Momence sessions', error);
      res.status(500).json({ message: 'Failed to proxy Momence sessions' });
    }
  });

  app.get('/api/momence/sessions/:id', async (req, res) => {
    try {
      const id = String(req.params.id || '').trim();
      if (!id) return res.status(400).json({ message: 'Missing session id' });

      const baseURL = process.env.MOMENCE_API_BASE_URL || process.env.VITE_MOMENCE_API_BASE_URL || 'https://api.momence.com/api/v2';
      const token = process.env.MOMENCE_AUTH_TOKEN || process.env.VITE_MOMENCE_AUTH_TOKEN || '';

      const url = `${baseURL}/host/sessions/${encodeURIComponent(id)}`;

      const doFetch = async (useBasic: boolean) => {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (useBasic) headers['Authorization'] = `Basic ${token}`;
        else headers['Authorization'] = `Bearer ${token}`;
        return fetch(url, { method: 'GET', headers });
      };

      let response = await doFetch(true);
      if (response.status === 401) response = await doFetch(false);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return res.status(response.status).json({ message: `Momence get session failed: ${text}` });
      }

      const json = await response.json().catch(() => null);
      res.json(json || {});
    } catch (error) {
      console.error('Error proxying Momence session fetch', error);
      res.status(500).json({ message: 'Failed to proxy Momence session fetch' });
    }
  });

  // Sentiment Analysis endpoint
  app.post('/api/analyze-sentiment', async (req, res) => {
    try {
      const { title, description, clientMood } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: 'Missing required fields: title and description' });
      }

      const { sentimentAnalyzer } = await import('./sentimentAnalyzer.js');

      if (!sentimentAnalyzer.isConfigured()) {
        return res.status(503).json({ 
          message: 'Sentiment analysis is not configured',
          sentiment: 'neutral',
          confidence: 0,
          tags: ['support', 'ticket'],
          summary: 'Support ticket'
        });
      }

      const result = await sentimentAnalyzer.analyzeSentiment(title, description, clientMood);
      res.json(result);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      res.status(500).json({ message: 'Failed to analyze sentiment' });
    }
  });

  // Add sample fields for testing (temporary endpoint)
  app.post('/api/admin/add-sample-fields', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ message: 'Supabase not configured' });

      // Get category and field types
      const { data: categories } = await supabase
        .from('categories')
        .select('id, code')
        .in('code', ['booking-tech', 'class-experience', 'customer-service']);

      const { data: fieldTypes } = await supabase
        .from('fieldTypes')
        .select('id, name');

      const categoryMap = Object.fromEntries(categories?.map((c: any) => [c.code, c.id]) || []);
      const fieldTypeMap = Object.fromEntries(fieldTypes?.map((f: any) => [f.name, f.id]) || []);

      // Sample fields for booking-tech
      const sampleFields = [
        {
          label: 'Issue Type',
          uniqueId: 'BT-ISSUE-TYPE',
          categoryId: categoryMap['booking-tech'],
          fieldTypeId: fieldTypeMap['Dropdown'],
          options: ['App Crash', 'Slow Loading', 'Login Problems', 'Feature Not Working', 'UI/UX Confusion'],
          isRequired: true,
          sortOrder: 1,
          description: 'Type of technical issue'
        },
        {
          label: 'Platform',
          uniqueId: 'BT-PLATFORM',
          categoryId: categoryMap['booking-tech'],
          fieldTypeId: fieldTypeMap['Dropdown'],
          options: ['iOS App', 'Android App', 'Website (Desktop)', 'Website (Mobile)'],
          isRequired: true,
          sortOrder: 2,
          description: 'Which platform had the issue'
        },
        {
          label: 'Browser/Device',
          uniqueId: 'BT-DEVICE',
          categoryId: categoryMap['booking-tech'],
          fieldTypeId: fieldTypeMap['Text'],
          isRequired: false,
          sortOrder: 3,
          description: 'Device model or browser used'
        }
      ];

      // Insert sample fields
      const { data, error } = await supabase
        .from('dynamicFields')
        .insert(sampleFields)
        .select();

      if (error) throw error;

      res.json({
        message: 'Sample fields added successfully',
        count: data?.length || 0
      });
    } catch (error) {
      console.error('Error adding sample fields:', error);
      res.status(500).json({ message: 'Failed to add sample fields', error: String(error) });
    }
  });

  // Migrate CSV fields to database (Run once)
  app.post('/api/admin/migrate-fields', async (req, res) => {
    try {
      // Ensure field types exist
      const fieldTypes = [
        { name: 'Dropdown' },
        { name: 'Text' },
        { name: 'Textarea' },
        { name: 'DateTime' },
        { name: 'Date' },
        { name: 'Email' },
        { name: 'Phone' },
        { name: 'Checkbox' },
        { name: 'File Upload' }
      ];

      if (!supabase) {
        return res.status(500).json({ message: 'Supabase client not initialized' });
      }
      const sb = supabase;

      for (const ft of fieldTypes) {
        await sb
          .from('fieldTypes')
          .upsert({ name: ft.name }, { onConflict: 'name' });
      }

      // Read and parse CSV
      const csvPath = path.resolve(process.cwd(), 'attached_assets', 'fields_1765795119065.csv');
      const content = await fs.readFile(csvPath, 'utf8');

      const parseCsv = (text: string) => {
        const rows: string[][] = [];
        let cur = '';
        let row: string[] = [];
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
            continue;
          }
          if (ch === ',' && !inQuotes) {
            row.push(cur);
            cur = '';
            continue;
          }
          if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(cur);
            cur = '';
            rows.push(row);
            row = [];
            continue;
          }
          cur += ch;
        }
        if (cur !== '' || row.length > 0) {
          row.push(cur);
          rows.push(row);
        }
        return rows.map(r => r.map(s => s.trim()));
      };

      const rows = parseCsv(content);
      if (rows.length < 2) {
        return res.json({ message: 'CSV is empty', count: 0 });
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(r => r.length >= 1 && r.some(c => c !== ''));

      let migrated = 0;

      for (const r of dataRows) {
        const obj: Record<string, string> = {};
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i] || `col${i}`] = (r[i] || '').trim();
        }

        const categoryName = obj['Category'] || 'Global';
        const subcategoryName = obj['Sub Category'] || null;
        const label = obj['Label'] || '';
        const fieldType = obj['Field Type'] || 'Text';
        const options = obj['Options/Other Details'] || '';
        const uniqueId = obj['Unique ID'] || label;

        if (!label) continue;

        // Get category ID
        let { data: categoryData, error: catError } = await sb
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .single();

        if (catError || !categoryData) {
          console.warn(`Category "${categoryName}" not found, creating it...`);
          const { data: newCat } = await sb
            .from('categories')
            .insert({
              name: categoryName,
              description: `Auto-imported from CSV`,
              code: categoryName.toLowerCase().replace(/\s+/g, '_'),
              isActive: true
            })
            .select()
            .single();
          categoryData = newCat;
        }

        let subcategoryId = null;
        if (subcategoryName && categoryData) {
          let { data: subcatData, error: subcatError } = await sb
            .from('subcategories')
            .select('id')
            .eq('categoryId', categoryData.id)
            .eq('name', subcategoryName)
            .single();

          if (subcatError || !subcatData) {
            const { data: newSubcat } = await sb
              .from('subcategories')
              .insert({
                categoryId: categoryData.id,
                name: subcategoryName,
                code: subcategoryName.toLowerCase().replace(/\s+/g, '_'),
                isActive: true
              })
              .select()
              .single();
            subcatData = newSubcat;
          }

          subcategoryId = subcatData?.id;
        }

        // Get field type ID
        const { data: fieldTypeData } = await sb
          .from('fieldTypes')
          .select('id')
          .eq('name', fieldType)
          .single();

        if (!fieldTypeData) {
          console.warn(`Field type "${fieldType}" not found, skipping...`);
          continue;
        }

        // Upsert dynamic field
        const optionsArray = options.split('|').map(o => o.trim()).filter(o => o.length > 0);
        
        await sb
          .from('dynamicFields')
          .upsert({
            label,
            uniqueId,
            fieldTypeId: fieldTypeData.id,
            categoryId: categoryData?.id,
            subcategoryId,
            options: optionsArray.length > 0 ? optionsArray : null,
            description: obj['Description'] || '',
            isRequired: (obj['Is Required'] || '').toLowerCase() === 'yes',
            isHidden: (obj['Is Hidden'] || '').toLowerCase() === 'yes',
            isActive: true
          }, { onConflict: 'uniqueId' });

        migrated++;
      }

      res.json({
        message: `Successfully migrated ${migrated} fields to database`,
        count: migrated
      });
    } catch (error) {
      console.error('Error migrating fields:', error);
      res.status(500).json({ message: 'Failed to migrate fields', error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
