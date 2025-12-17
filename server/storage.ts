import {
  users,
  teams,
  studios,
  categories,
  subcategories,
  tickets,
  ticketComments,
  ticketAttachments,
  ticketHistory,
  notifications,
  type User,
  type UpsertUser,
  type Team,
  type InsertTeam,
  type Studio,
  type InsertStudio,
  type Category,
  type InsertCategory,
  type Subcategory,
  type Ticket,
  type InsertTicket,
  type TicketComment,
  type InsertTicketComment,
  type TicketAttachment,
  type InsertTicketAttachment,
  type TicketHistory,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql, count, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  
  getStudios(): Promise<Studio[]>;
  getStudio(id: string): Promise<Studio | undefined>;
  createStudio(studio: InsertStudio): Promise<Studio>;
  updateStudio(id: string, studio: Partial<InsertStudio>): Promise<Studio | undefined>;
  
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  getSubcategories(categoryId?: string): Promise<Subcategory[]>;
  getSubcategory(id: string): Promise<Subcategory | undefined>;
  
  getTickets(filters?: TicketFilters): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  
  getTicketAttachments(ticketId: string): Promise<TicketAttachment[]>;
  createTicketAttachment(attachment: InsertTicketAttachment): Promise<TicketAttachment>;
  
  getTicketHistory(ticketId: string): Promise<TicketHistory[]>;
  createTicketHistory(history: { ticketId: string; changedByUserId?: string; action: string; fieldChanged?: string; oldValue?: string; newValue?: string }): Promise<TicketHistory>;
  
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;
  
  getDashboardStats(): Promise<DashboardStats>;
  getAnalyticsData(): Promise<AnalyticsData>;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  studioId?: string;
  assignedToUserId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DashboardStats {
  totalOpen: number;
  totalNew: number;
  resolvedToday: number;
  slaBreached: number;
  avgResolutionHours: number;
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  byCategory: { name: string; count: number }[];
}

export interface AnalyticsData {
  ticketsByCategory: { category: string; count: number }[];
  ticketsByStudio: { studio: string; count: number }[];
  ticketsByTeam: { team: string; count: number }[];
  ticketTrend: { date: string; count: number }[];
  resolutionTimeByPriority: { priority: string; avgHours: number }[];
  topCategories: { category: string; count: number }[];
}

function generateTicketNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TKT-${year}${month}-${random}`;
}

function requireDb() {
  if (!db) {
    throw new Error("Database not configured. Set DATABASE_URL environment variable.");
  }
  return db;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const database = requireDb();
    const [user] = await database.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const database = requireDb();
    const [user] = await database
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    const database = requireDb();
    return await database.select().from(users).where(eq(users.isActive, true));
  }

  async getTeams(): Promise<Team[]> {
    const database = requireDb();
    return await database.select().from(teams).where(eq(teams.isActive, true));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const database = requireDb();
    const [team] = await database.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const database = requireDb();
    const [newTeam] = await database.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined> {
    const database = requireDb();
    const [updated] = await database.update(teams).set(team).where(eq(teams.id, id)).returning();
    return updated;
  }

  async getStudios(): Promise<Studio[]> {
    const database = requireDb();
    return await database.select().from(studios).where(eq(studios.isActive, true));
  }

  async getStudio(id: string): Promise<Studio | undefined> {
    const database = requireDb();
    const [studio] = await database.select().from(studios).where(eq(studios.id, id));
    return studio;
  }

  async createStudio(studio: InsertStudio): Promise<Studio> {
    const database = requireDb();
    const [newStudio] = await database.insert(studios).values(studio).returning();
    return newStudio;
  }

  async updateStudio(id: string, studio: Partial<InsertStudio>): Promise<Studio | undefined> {
    const database = requireDb();
    const [updated] = await database.update(studios).set(studio).where(eq(studios.id, id)).returning();
    return updated;
  }

  async getCategories(): Promise<Category[]> {
    const database = requireDb();
    return await database.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const database = requireDb();
    const [category] = await database.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const database = requireDb();
    const [newCategory] = await database.insert(categories).values(category).returning();
    return newCategory;
  }

  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    const database = requireDb();
    if (categoryId) {
      return await database.select().from(subcategories).where(and(eq(subcategories.categoryId, categoryId), eq(subcategories.isActive, true))).orderBy(subcategories.sortOrder);
    }
    return await database.select().from(subcategories).where(eq(subcategories.isActive, true)).orderBy(subcategories.sortOrder);
  }

  async getSubcategory(id: string): Promise<Subcategory | undefined> {
    const database = requireDb();
    const [subcategory] = await database.select().from(subcategories).where(eq(subcategories.id, id));
    return subcategory;
  }

  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    const database = requireDb();
    const conditions: any[] = [];

    if (filters?.status) {
      const statusValues = filters.status.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (statusValues.length === 1) {
        conditions.push(eq(tickets.status, statusValues[0]));
      } else if (statusValues.length > 1) {
        conditions.push(inArray(tickets.status, statusValues));
      }
    }
    if (filters?.priority) {
      const priorityValues = filters.priority.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (priorityValues.length === 1) {
        conditions.push(eq(tickets.priority, priorityValues[0]));
      } else if (priorityValues.length > 1) {
        conditions.push(inArray(tickets.priority, priorityValues));
      }
    }
    if (filters?.category) {
      conditions.push(eq(tickets.categoryId, filters.category));
    }
    if (filters?.studioId) {
      conditions.push(eq(tickets.studioId, filters.studioId));
    }
    if (filters?.assignedToUserId) {
      conditions.push(eq(tickets.assignedToUserId, filters.assignedToUserId));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(tickets.title, `%${filters.search}%`),
          ilike(tickets.ticketNumber, `%${filters.search}%`),
          ilike(tickets.customerName, `%${filters.search}%`)
        )
      );
    }

    let query = database.select().from(tickets);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(tickets.createdAt)) as any;
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const database = requireDb();
    const [ticket] = await database.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketByNumber(ticketNumber: string): Promise<Ticket | undefined> {
    const database = requireDb();
    const [ticket] = await database.select().from(tickets).where(eq(tickets.ticketNumber, ticketNumber));
    return ticket;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const database = requireDb();
    const ticketNumber = generateTicketNumber();
    const [newTicket] = await database.insert(tickets).values({ ...ticket, ticketNumber }).returning();
    return newTicket;
  }

  async updateTicket(id: string, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const database = requireDb();
    const [updated] = await database.update(tickets).set({ ...ticket, updatedAt: new Date() }).where(eq(tickets.id, id)).returning();
    return updated;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const database = requireDb();
    await database.delete(tickets).where(eq(tickets.id, id));
    return true;
  }

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    const database = requireDb();
    return await database.select().from(ticketComments).where(eq(ticketComments.ticketId, ticketId)).orderBy(desc(ticketComments.createdAt));
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const database = requireDb();
    const [newComment] = await database.insert(ticketComments).values(comment).returning();
    return newComment;
  }

  async getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
    const database = requireDb();
    return await database.select().from(ticketAttachments).where(eq(ticketAttachments.ticketId, ticketId));
  }

  async createTicketAttachment(attachment: InsertTicketAttachment): Promise<TicketAttachment> {
    const database = requireDb();
    const [newAttachment] = await database.insert(ticketAttachments).values(attachment).returning();
    return newAttachment;
  }

  async getTicketHistory(ticketId: string): Promise<TicketHistory[]> {
    const database = requireDb();
    return await database.select().from(ticketHistory).where(eq(ticketHistory.ticketId, ticketId)).orderBy(desc(ticketHistory.createdAt));
  }

  async createTicketHistory(history: { ticketId: string; changedByUserId?: string; action: string; fieldChanged?: string; oldValue?: string; newValue?: string }): Promise<TicketHistory> {
    const database = requireDb();
    const [newHistory] = await database.insert(ticketHistory).values(history).returning();
    return newHistory;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const database = requireDb();
    return await database.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const database = requireDb();
    const [newNotification] = await database.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const database = requireDb();
    const [updated] = await database.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return updated;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const database = requireDb();
    await database.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const database = requireDb();
    const allTickets = await database.select().from(tickets);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openStatuses = ['new', 'assigned', 'in_progress', 'pending_customer', 'reopened'];
    const openTickets = allTickets.filter(t => openStatuses.includes(t.status || ''));
    const newTickets = allTickets.filter(t => t.status === 'new');
    const resolvedToday = allTickets.filter(t => t.resolvedAt && new Date(t.resolvedAt) >= today);
    const slaBreached = allTickets.filter(t => t.slaBreached);

    const statusColors: Record<string, string> = {
      new: "#3b82f6",
      assigned: "#8b5cf6",
      in_progress: "#eab308",
      pending_customer: "#f97316",
      resolved: "#22c55e",
      closed: "#6b7280",
      reopened: "#ef4444",
    };

    const priorityColors: Record<string, string> = {
      critical: "#ef4444",
      high: "#f97316",
      medium: "#eab308",
      low: "#22c55e",
    };

    const byStatus = ['new', 'assigned', 'in_progress', 'pending_customer', 'resolved', 'closed', 'reopened']
      .map(status => ({
        name: status,
        value: allTickets.filter(t => t.status === status).length,
        color: statusColors[status] || "#6b7280"
      }))
      .filter(s => s.value > 0);

    const byPriority = ['critical', 'high', 'medium', 'low']
      .map(priority => ({
        name: priority,
        value: allTickets.filter(t => t.priority === priority).length,
        color: priorityColors[priority] || "#6b7280"
      }))
      .filter(p => p.value > 0);

    const categoryCount: Record<string, number> = {};
    allTickets.forEach(t => {
      if (t.categoryId) {
        categoryCount[t.categoryId] = (categoryCount[t.categoryId] || 0) + 1;
      }
    });
    const byCategory = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const resolvedTickets = allTickets.filter(t => t.resolvedAt && t.createdAt);
    const avgResolutionHours = resolvedTickets.length > 0
      ? resolvedTickets.reduce((acc, t) => {
          const created = new Date(t.createdAt!).getTime();
          const resolved = new Date(t.resolvedAt!).getTime();
          return acc + (resolved - created) / (1000 * 60 * 60);
        }, 0) / resolvedTickets.length
      : 0;

    return {
      totalOpen: openTickets.length,
      totalNew: newTickets.length,
      resolvedToday: resolvedToday.length,
      slaBreached: slaBreached.length,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      byStatus,
      byPriority,
      byCategory
    };
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    const database = requireDb();
    const allTickets = await database.select().from(tickets);
    const allStudios = await this.getStudios();
    const allTeams = await this.getTeams();

    const categoryCount: Record<string, number> = {};
    const studioCount: Record<string, number> = {};
    const teamCount: Record<string, number> = {};

    allTickets.forEach(t => {
      if (t.categoryId) {
        categoryCount[t.categoryId] = (categoryCount[t.categoryId] || 0) + 1;
      }
      if (t.studioId) {
        const studio = allStudios.find(s => s.id === t.studioId);
        const studioName = studio?.name || 'Unknown';
        studioCount[studioName] = (studioCount[studioName] || 0) + 1;
      }
      if (t.assignedTeamId) {
        const team = allTeams.find(tm => tm.id === t.assignedTeamId);
        const teamName = team?.name || 'Unknown';
        teamCount[teamName] = (teamCount[teamName] || 0) + 1;
      }
    });

    const ticketsByCategory = Object.entries(categoryCount).map(([category, count]) => ({ category, count }));
    const ticketsByStudio = Object.entries(studioCount).map(([studio, count]) => ({ studio, count }));
    const ticketsByTeam = Object.entries(teamCount).map(([team, count]) => ({ team, count }));

    const last30Days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTickets = allTickets.filter(t => {
        const created = new Date(t.createdAt!);
        return created >= date && created < nextDate;
      });

      last30Days.push({
        date: date.toISOString().split('T')[0],
        count: dayTickets.length
      });
    }

    const priorities = ['low', 'medium', 'high', 'critical'];
    const resolutionTimeByPriority = priorities.map(priority => {
      const priorityTickets = allTickets.filter(t => t.priority === priority && t.resolvedAt && t.createdAt);
      const avgHours = priorityTickets.length > 0
        ? priorityTickets.reduce((acc, t) => {
            const created = new Date(t.createdAt!).getTime();
            const resolved = new Date(t.resolvedAt!).getTime();
            return acc + (resolved - created) / (1000 * 60 * 60);
          }, 0) / priorityTickets.length
        : 0;
      return { priority, avgHours: Math.round(avgHours * 10) / 10 };
    });

    const topCategories = ticketsByCategory
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      ticketsByCategory,
      ticketsByStudio,
      ticketsByTeam,
      ticketTrend: last30Days,
      resolutionTimeByPriority,
      topCategories
    };
  }
}

export const storage = new DatabaseStorage();
