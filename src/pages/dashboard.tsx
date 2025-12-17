import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Activity,
  Target,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/ticket-card";
import { EmptyState } from "@/components/empty-state";
import { DashboardSkeleton, TicketCardSkeleton } from "@/components/loading-skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DashboardStats {
  totalOpen: number;
  totalNew: number;
  resolvedToday: number;
  slaBreached: number;
  byStatus: { name: string; value: number; color: string }[];
  byPriority: { name: string; value: number; color: string }[];
  weeklyTrend: { date: string; created: number; resolved: number }[];
}

const statusColors: Record<string, string> = {
  new: "hsl(var(--chart-1))",
  assigned: "hsl(var(--chart-4))",
  in_progress: "hsl(var(--chart-3))",
  pending_customer: "hsl(30, 100%, 50%)",
  resolved: "hsl(var(--chart-2))",
  closed: "hsl(220, 15%, 55%)",
  reopened: "hsl(var(--chart-5))",
};

const priorityColors: Record<string, string> = {
  critical: "hsl(var(--chart-5))",
  high: "hsl(30, 100%, 50%)",
  medium: "hsl(var(--chart-3))",
  low: "hsl(var(--chart-2))",
};

export default function Dashboard() {
  // Fetch dashboard stats from Supabase
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      // Fetch all tickets for stats
      const { data: allTickets, error } = await supabase
        .from('tickets')
        .select('id, status, priority, createdAt, resolvedAt, slaBreached');

      if (error) throw error;

      const tickets = allTickets || [];

      // Calculate stats
      const openStatuses = ['new', 'assigned', 'in_progress', 'pending_customer', 'reopened'];
      const totalOpen = tickets.filter(t => openStatuses.includes(t.status || '')).length;
      const totalNew = tickets.filter(t => t.status === 'new').length;
      const resolvedToday = tickets.filter(t => 
        t.resolvedAt && t.resolvedAt >= startOfToday && t.resolvedAt <= endOfToday
      ).length;
      const slaBreached = tickets.filter(t => t.slaBreached).length;

      // Group by status
      const statusCounts: Record<string, number> = {};
      tickets.forEach(t => {
        const status = t.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const byStatus = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || "hsl(220, 15%, 55%)",
      }));

      // Group by priority
      const priorityCounts: Record<string, number> = {};
      tickets.forEach(t => {
        const priority = t.priority || 'medium';
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });
      const byPriority = Object.entries(priorityCounts).map(([name, value]) => ({
        name,
        value,
        color: priorityColors[name] || "hsl(var(--chart-3))",
      }));

      // Weekly trend (last 7 days)
      const weeklyTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayStart = startOfDay(date).toISOString();
        const dayEnd = endOfDay(date).toISOString();
        
        const created = tickets.filter(t => 
          t.createdAt && t.createdAt >= dayStart && t.createdAt <= dayEnd
        ).length;
        const resolved = tickets.filter(t => 
          t.resolvedAt && t.resolvedAt >= dayStart && t.resolvedAt <= dayEnd
        ).length;

        weeklyTrend.push({
          date: format(date, 'EEE'),
          created,
          resolved,
        });
      }

      return {
        totalOpen,
        totalNew,
        resolvedToday,
        slaBreached,
        byStatus,
        byPriority,
        weeklyTrend,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent tickets
  const { data: recentTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['recent-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, code, icon, color),
          subcategory:subcategories(id, name, code),
          studio:studios(id, name, code)
        `)
        .order('createdAt', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch urgent tickets
  const { data: urgentTickets, isLoading: urgentLoading } = useQuery({
    queryKey: ['urgent-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, code, icon, color),
          subcategory:subcategories(id, name, code),
          studio:studios(id, name, code)
        `)
        .in('priority', ['critical', 'high'])
        .in('status', ['new', 'assigned', 'in_progress'])
        .order('createdAt', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  const displayStats: DashboardStats = stats || {
    totalOpen: 0,
    totalNew: 0,
    resolvedToday: 0,
    slaBreached: 0,
    byStatus: [],
    byPriority: [],
    weeklyTrend: [],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time ticket activity and performance metrics
              </p>
            </div>
          </div>
        </div>
        <Button 
          asChild 
          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/30 font-semibold" 
        >
          <Link href="/tickets/new">
            <Plus className="h-5 w-5 mr-2" />
            New Ticket
          </Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {[
          { title: "Open Tickets", value: displayStats.totalOpen, subtitle: "Across all studios", icon: Ticket, gradient: "from-primary to-secondary" },
          { title: "New Today", value: displayStats.totalNew, subtitle: "Awaiting assignment", icon: Clock, gradient: "from-amber-500 to-orange-500" },
          { title: "Resolved Today", value: displayStats.resolvedToday, subtitle: "Successfully closed", icon: CheckCircle, gradient: "from-emerald-500 to-teal-500" },
          { title: "SLA Breached", value: displayStats.slaBreached, subtitle: "Requires attention", icon: AlertTriangle, gradient: "from-rose-500 to-red-600", warning: displayStats.slaBreached > 0 },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className={cn(
                "glass-card relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0",
                stat.warning && "ring-2 ring-destructive/30"
              )}>
                <div className={cn(
                  "absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-all duration-500 group-hover:scale-110",
                  stat.gradient
                )} />
                <CardContent className="pt-6 pb-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-xl",
                      stat.gradient
                    )}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-sm font-medium text-foreground mt-1">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary-foreground" />
                </div>
                Weekly Ticket Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayStats.weeklyTrend.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayStats.weeklyTrend}>
                      <defs>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="created"
                        name="Created"
                        stroke="hsl(var(--primary))"
                        fill="url(#colorCreated)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        name="Resolved"
                        stroke="hsl(var(--chart-2))"
                        fill="url(#colorResolved)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card border-0 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary-foreground" />
                </div>
                By Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayStats.byStatus.length > 0 ? (
                <>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayStats.byStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          strokeWidth={0}
                        >
                          {displayStats.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--popover))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {displayStats.byStatus.slice(0, 6).map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-xs group cursor-default">
                        <div
                          className="h-3 w-3 rounded-full shadow-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground capitalize truncate">{item.name.replace("_", " ")}</span>
                        <span className="font-bold ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-0 h-full">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-primary-foreground" />
                </div>
                Recent Tickets
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-primary/10">
                <Link href="/tickets" className="flex items-center gap-1 text-primary font-medium">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticketsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <TicketCardSkeleton key={i} />
                  ))}
                </>
              ) : recentTickets && recentTickets.length > 0 ? (
                recentTickets.map((ticket: any, index: number) => (
                  <motion.div 
                    key={ticket.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TicketCard ticket={ticket} />
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={Ticket}
                  title="No tickets yet"
                  description="Create your first ticket to get started"
                  action={{
                    label: "Create Ticket",
                    onClick: () => window.location.href = "/tickets/new",
                  }}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Urgent Tickets + Priority Distribution */}
        <div className="space-y-6">
          {/* Urgent Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white animate-pulse" />
                  </div>
                  Urgent Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {urgentLoading ? (
                  <TicketCardSkeleton />
                ) : urgentTickets && urgentTickets.length > 0 ? (
                  urgentTickets.slice(0, 3).map((ticket: any, index: number) => (
                    <motion.div 
                      key={ticket.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TicketCard ticket={ticket} compact />
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <CheckCircle className="h-10 w-10 mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium">No urgent tickets!</p>
                    <p className="text-xs">All high priority items are resolved</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary-foreground" />
                  </div>
                  By Priority
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayStats.byPriority.length > 0 ? (
                  <div className="space-y-4">
                    {displayStats.byPriority.map((item, index) => {
                      const maxValue = Math.max(...displayStats.byPriority.map(p => p.value));
                      const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                      return (
                        <motion.div 
                          key={item.name} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="flex items-center gap-3 group"
                        >
                          <div
                            className="h-4 w-4 rounded-full shadow-md"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm capitalize flex-1 font-medium">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{item.value}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
