import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  FolderKanban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from "recharts";
import { STUDIOS } from "@/lib/constants";
import { ExportDialog } from "@/components/export-dialog";
import { AIInsightsPanel } from "@/components/ai-insights-panel";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  ticketsByCategory: { category: string; count: number }[];
  ticketsByStudio: { studio: string; count: number }[];
  ticketsByTeam: { team: string; count: number }[];
  ticketTrend: { date: string; count: number }[];
  resolutionTimeByPriority: { priority: string; avgHours: number }[];
  topCategories: { category: string; count: number }[];
}

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [studioFilter, setStudioFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", { timeRange, studio: studioFilter }],
    queryFn: async () => {
      try {
        // Fetch all tickets from Supabase
        const { data: tickets, error } = await supabase
          .from('tickets')
          .select('*');
        
        if (error) throw error;
        if (!tickets || tickets.length === 0) {
          return {
            ticketsByCategory: [],
            ticketsByStudio: [],
            ticketsByTeam: [],
            ticketTrend: [],
            resolutionTimeByPriority: [],
            topCategories: [],
          };
        }

        // Compute analytics from actual data
        const categoryCount: Record<string, number> = {};
        const studioCount: Record<string, number> = {};
        const teamCount: Record<string, number> = {};
        
        tickets.forEach(t => {
          if (t.categoryId) {
            categoryCount[t.categoryId] = (categoryCount[t.categoryId] || 0) + 1;
          }
          if (t.studioId) {
            studioCount[t.studioId] = (studioCount[t.studioId] || 0) + 1;
          }
          if (t.assignedTo) {
            teamCount[t.assignedTo] = (teamCount[t.assignedTo] || 0) + 1;
          }
        });

        const ticketsByCategory = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        const ticketsByStudio = Object.entries(studioCount)
          .map(([studio, count]) => ({ studio, count }))
          .sort((a, b) => b.count - a.count);

        const ticketsByTeam = Object.entries(teamCount)
          .map(([team, count]) => ({ team, count }))
          .sort((a, b) => b.count - a.count);

        // Compute trends over time
        const last30Days: { date: string; count: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayTickets = tickets.filter(t => {
            const created = t.createdAt ? new Date(t.createdAt) : null;
            return created && created >= date && created < nextDate;
          });

          last30Days.push({
            date: date.toISOString().split('T')[0],
            count: dayTickets.length
          });
        }

        // Resolution times by priority
        const priorities = ['low', 'medium', 'high', 'critical'];
        const resolutionTimeByPriority = priorities.map(priority => {
          const priorityTickets = tickets.filter(t => 
            t.priority === priority && t.resolvedAt && t.createdAt
          );
          const avgHours = priorityTickets.length > 0
            ? priorityTickets.reduce((acc, t) => {
                const created = new Date(t.createdAt).getTime();
                const resolved = new Date(t.resolvedAt).getTime();
                return acc + (resolved - created) / (1000 * 60 * 60);
              }, 0) / priorityTickets.length
            : 0;
          return { priority, avgHours: Math.round(avgHours * 10) / 10 };
        });

        const topCategories = ticketsByCategory.slice(0, 5);

        return {
          ticketsByCategory,
          ticketsByStudio,
          ticketsByTeam,
          ticketTrend: last30Days,
          resolutionTimeByPriority,
          topCategories
        };
      } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
          ticketsByCategory: [],
          ticketsByStudio: [],
          ticketsByTeam: [],
          ticketTrend: [],
          resolutionTimeByPriority: [],
          topCategories: [],
        };
      }
    }
  });

  const computedMetrics = useMemo(() => {
    if (!analytics) return null;

    const allTickets = analytics.ticketsByCategory.reduce((sum, item) => sum + item.count, 0);
    const avgResolutionTime = analytics.resolutionTimeByPriority.length > 0
      ? (analytics.resolutionTimeByPriority.reduce((sum, item) => sum + item.avgHours, 0) / analytics.resolutionTimeByPriority.length).toFixed(1)
      : 0;

    return {
      totalTickets: allTickets,
      avgResolutionTime
    };
  }, [analytics]);

  const data = analytics;

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!data || data.ticketsByCategory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No Analytics Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Analytics data will appear here once tickets are created and processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text-accent">Analytics & Reports</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive performance metrics and insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 rounded-xl">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Select value={studioFilter} onValueChange={setStudioFilter}>
            <SelectTrigger className="w-48 rounded-xl">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All studios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Studios</SelectItem>
              {STUDIOS.map((studio) => (
                <SelectItem key={studio.id} value={studio.id}>
                  {studio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="ghost" size="icon" onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {[
          { title: "Total Tickets", value: computedMetrics?.totalTickets || 0, icon: BarChart3, color: "from-blue-500 to-cyan-500" },
          { title: "Categories", value: data?.ticketsByCategory.length || 0, icon: FolderKanban, color: "from-purple-500 to-pink-500" },
          { title: "Studios", value: data?.ticketsByStudio.length || 0, icon: Building2, color: "from-emerald-500 to-teal-500" },
          { title: "Avg Resolution", value: `${computedMetrics?.avgResolutionTime || 0}h`, icon: Target, color: "from-blue-600 to-blue-500" },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card relative overflow-hidden group hover:shadow-lg transition-all">
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br opacity-10 -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity",
                  metric.color
                )} />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br",
                      metric.color
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Ticket Trends (30 Days)
                </CardTitle>
                <CardDescription>Daily ticket creation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.ticketTrend || []}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        cursor={{ fill: "hsl(var(--primary)/ 0.1)" }}
                      />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  By Category
                </CardTitle>
                <CardDescription>Ticket distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ticketsByCategory} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        width={100}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resolution Time by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.resolutionTimeByPriority || []}>
                      <XAxis dataKey="priority" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="avgHours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  By Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.ticketsByStudio || []}>
                      <XAxis dataKey="studio" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="count" name="Tickets" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
                <CardDescription>Distribution of tickets by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.ticketsByCategory.map((cat, index) => {
                    const total = data.ticketsByCategory.reduce((sum, c) => sum + c.count, 0);
                    const percentage = Math.round((cat.count / total) * 100);
                    return (
                      <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "100%" }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{cat.category}</span>
                          <span className="text-muted-foreground">{cat.count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Team Distribution</CardTitle>
                <CardDescription>Tickets assigned by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.ticketsByTeam.slice(0, 6).map((team, index) => {
                    const total = data.ticketsByTeam.reduce((sum, t) => sum + t.count, 0);
                    const percentage = Math.round((team.count / total) * 100);
                    return (
                      <motion.div
                        key={team.team}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{team.team}</span>
                          <span className="text-muted-foreground">{team.count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AIInsightsPanel />
            </div>
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="text-sm font-medium">Active Tickets</p>
                      <p className="text-xs text-muted-foreground">Open status</p>
                    </div>
                    <Badge variant="default">
                      {data.ticketsByCategory.reduce((sum, c) => sum + c.count, 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="text-sm font-medium">Categories</p>
                      <p className="text-xs text-muted-foreground">In use</p>
                    </div>
                    <Badge variant="secondary">
                      {data.ticketsByCategory.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="text-sm font-medium">Studios</p>
                      <p className="text-xs text-muted-foreground">Locations</p>
                    </div>
                    <Badge variant="secondary">
                      {data.ticketsByStudio.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Avg Resolution</p>
                      <p className="text-xs text-muted-foreground">Time to close</p>
                    </div>
                    <Badge variant="default">
                      {computedMetrics?.avgResolutionTime || 0}h
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-9 w-9 rounded-xl mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}
