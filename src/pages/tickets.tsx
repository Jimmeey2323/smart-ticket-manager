import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  X,
  SlidersHorizontal,
  Ticket,
  Calendar,
  User,
  Building2,
  Clock,
  AlertTriangle,
  BarChart3,
  Eye,
  Edit3,
  Star,
  TrendingUp,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import { TicketCardSkeleton } from "@/components/loading-skeleton";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";
import { TrainerFeedbackModal } from "@/components/trainer-feedback-modal";
import { PRIORITIES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const STATUSES = {
  new: { label: "New", color: "bg-blue-500" },
  assigned: { label: "Assigned", color: "bg-blue-600" },
  in_progress: { label: "In Progress", color: "bg-amber-500" },
  pending_customer: { label: "Pending Customer", color: "bg-orange-500" },
  resolved: { label: "Resolved", color: "bg-emerald-500" },
  closed: { label: "Closed", color: "bg-slate-500" },
  reopened: { label: "Reopened", color: "bg-red-500" },
};

const SOURCES = {
  "in-person": "In Person",
  "phone": "Phone",
  "email": "Email",
  "app": "Mobile App",
  "website": "Website",
  "social": "Social Media",
};

export default function Tickets() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [studioFilter, setStudioFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"table" | "list" | "grid" | "compact" | "kanban">("table");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, code')
        .eq('isActive', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch studios from Supabase
  const { data: studios = [] } = useQuery({
    queryKey: ['studios-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studios')
        .select('id, name, code')
        .eq('isActive', true)
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch users for assignee filter
  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, firstName, lastName, displayName, email')
        .eq('isActive', true)
        .order('displayName');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch tickets from Supabase with filters
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['tickets', searchQuery, statusFilter, priorityFilter, categoryFilter, studioFilter, sourceFilter, assigneeFilter, dateRange, slaFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          category:categories(id, name, code, icon, color),
          subcategory:subcategories(id, name, code),
          studio:studios(id, name, code),
          assignedTo:users!tickets_assignedToUserId_fkey(id, firstName, lastName, displayName, email),
          reportedBy:users!tickets_reportedByUserId_fkey(id, firstName, lastName, displayName)
        `);

      // Apply filters
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== "all") {
        query = query.eq('priority', priorityFilter);
      }
      if (categoryFilter !== "all") {
        query = query.eq('categoryId', categoryFilter);
      }
      if (studioFilter !== "all") {
        query = query.eq('studioId', studioFilter);
      }
      if (sourceFilter !== "all") {
        query = query.eq('source', sourceFilter);
      }
      if (assigneeFilter !== "all") {
        if (assigneeFilter === "unassigned") {
          query = query.is('assignedToUserId', null);
        } else {
          query = query.eq('assignedToUserId', assigneeFilter);
        }
      }
      if (slaFilter === "breached") {
        query = query.eq('slaBreached', true);
      } else if (slaFilter === "at-risk") {
        query = query.eq('slaBreached', false).not('slaDueAt', 'is', null);
      }
      if (searchQuery) {
        query = query.or(`ticketNumber.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%,customerName.ilike.%${searchQuery}%,customerEmail.ilike.%${searchQuery}%`);
      }

      // Apply date range filter
      if (dateRange !== "all") {
        const now = new Date();
        let startDate: Date;
        switch (dateRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case "quarter":
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          default:
            startDate = new Date(0);
        }
        query = query.gte('createdAt', startDate.toISOString());
      }

      // Apply sorting
      switch (sortBy) {
        case "oldest":
          query = query.order('createdAt', { ascending: true });
          break;
        case "priority":
          query = query.order('priority', { ascending: false }).order('createdAt', { ascending: false });
          break;
        case "updated":
          query = query.order('updatedAt', { ascending: false });
          break;
        default:
          query = query.order('createdAt', { ascending: false });
      }

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const activeFiltersCount = [statusFilter, priorityFilter, categoryFilter, studioFilter, sourceFilter, assigneeFilter, dateRange, slaFilter]
    .filter(f => f !== "all").length;

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setStudioFilter("all");
    setSourceFilter("all");
    setAssigneeFilter("all");
    setDateRange("all");
    setSlaFilter("all");
    setSearchQuery("");
  };

  const toggleTicketSelection = (id: string) => {
    const newSelected = new Set(selectedTickets);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTickets(newSelected);
  };

  const selectAllVisible = () => {
    if (tickets) {
      setSelectedTickets(new Set(tickets.map((t: any) => t.id)));
    }
  };

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  // Calculate stats
  const stats = tickets ? {
    total: tickets.length,
    new: tickets.filter((t: any) => t.status === 'new').length,
    inProgress: tickets.filter((t: any) => ['assigned', 'in_progress'].includes(t.status)).length,
    resolved: tickets.filter((t: any) => ['resolved', 'closed'].includes(t.status)).length,
    overdue: tickets.filter((t: any) => t.slaBreached || (t.slaDueAt && new Date(t.slaDueAt) < new Date())).length,
    critical: tickets.filter((t: any) => t.priority === 'critical').length,
  } : { total: 0, new: 0, inProgress: 0, resolved: 0, overdue: 0, critical: 0 };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-accent">All Tickets</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track customer feedback and issues
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFeedbackModalOpen(true)}
            className="rounded-xl border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
          >
            <Star className="h-4 w-4 mr-2" />
            Trainer Feedback
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl border-border hover:bg-muted">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild className="rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30 font-semibold">
            <Link href="/tickets/new">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Ticket, color: "from-blue-500 to-cyan-500" },
          { label: "New", value: stats.new, icon: Plus, color: "from-emerald-500 to-teal-500" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "from-amber-500 to-orange-500" },
          { label: "Resolved", value: stats.resolved, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "from-red-500 to-rose-500" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "from-purple-500 to-pink-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br", stat.color)}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="glass-card border-0 shadow-xl">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            {/* Search and View Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket #, title, customer name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl border-border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 rounded-xl">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                  <SelectItem value="updated">Last Updated</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.entries(STATUSES).map(([value, config]) => (
                          <SelectItem key={value} value={value}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-36 rounded-xl">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {Object.entries(PRIORITIES).map(([value, config]) => (
                          <SelectItem key={value} value={value}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48 rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={studioFilter} onValueChange={setStudioFilter}>
                      <SelectTrigger className="w-44 rounded-xl">
                        <SelectValue placeholder="Studio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Studios</SelectItem>
                        {studios.map((studio: any) => (
                          <SelectItem key={studio.id} value={studio.id}>
                            {studio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                      <SelectTrigger className="w-36 rounded-xl">
                        <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        {Object.entries(SOURCES).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                      <SelectTrigger className="w-44 rounded-xl">
                        <SelectValue placeholder="Assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.displayName || user.firstName || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-36 rounded-xl">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">Last 30 Days</SelectItem>
                        <SelectItem value="quarter">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={slaFilter} onValueChange={setSlaFilter}>
                      <SelectTrigger className="w-36 rounded-xl">
                        <SelectValue placeholder="SLA Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All SLA</SelectItem>
                        <SelectItem value="breached">SLA Breached</SelectItem>
                        <SelectItem value="at-risk">At Risk</SelectItem>
                      </SelectContent>
                    </Select>

                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="rounded-xl text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear all
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filter Badges */}
            {activeFiltersCount > 0 && !showFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Status: {STATUSES[statusFilter as keyof typeof STATUSES]?.label || statusFilter}
                    <button onClick={() => setStatusFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {priorityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Priority: {PRIORITIES[priorityFilter as keyof typeof PRIORITIES]?.label || priorityFilter}
                    <button onClick={() => setPriorityFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Category: {categories.find((c: any) => c.id === categoryFilter)?.name || categoryFilter}
                    <button onClick={() => setCategoryFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {studioFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    Studio: {studios.find((s: any) => s.id === studioFilter)?.name || studioFilter}
                    <button onClick={() => setStudioFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedTickets.size > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">
                {selectedTickets.size} ticket{selectedTickets.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      Bulk Actions
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuItem>Change Priority</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Close Tickets</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTickets(new Set())}
                  className="rounded-xl"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Display */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      ) : tickets && tickets.length > 0 ? (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left p-3 text-xs font-medium">
                      <Checkbox
                        checked={selectedTickets.size === tickets.length}
                        onCheckedChange={(checked) => checked ? selectAllVisible() : setSelectedTickets(new Set())}
                      />
                    </th>
                    <th className="text-left p-3 text-xs font-medium">Title</th>
                    <th className="text-left p-3 text-xs font-medium">Status</th>
                    <th className="text-left p-3 text-xs font-medium">Priority</th>
                    <th className="text-left p-3 text-xs font-medium">Category</th>
                    <th className="text-left p-3 text-xs font-medium">Customer</th>
                    <th className="text-left p-3 text-xs font-medium">Studio</th>
                    <th className="text-left p-3 text-xs font-medium">Assigned</th>
                    <th className="text-left p-3 text-xs font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: any) => {
                    const isOverdue = ticket.slaBreached || (ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && 
                      !["resolved", "closed"].includes(ticket.status || ""));
                    return (
                      <motion.tr
                        key={ticket.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "border-b cursor-pointer hover:bg-muted/30 transition-colors",
                          isOverdue && "bg-red-500/5"
                        )}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedTickets.has(ticket.id)}
                            onCheckedChange={() => toggleTicketSelection(ticket.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-sm line-clamp-1">{ticket.title}</span>
                            <span className="text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                          </div>
                        </td>
                        <td className="p-3"><StatusBadge status={ticket.status || "new"} /></td>
                        <td className="p-3"><PriorityBadge priority={ticket.priority || "medium"} /></td>
                        <td className="p-3"><span className="text-sm">{ticket.category?.name || "—"}</span></td>
                        <td className="p-3"><span className="text-sm">{ticket.customerName || "—"}</span></td>
                        <td className="p-3"><span className="text-sm">{ticket.studio?.name || "—"}</span></td>
                        <td className="p-3"><span className="text-sm">{ticket.assignedTo?.displayName || "Unassigned"}</span></td>
                        <td className="p-3"><span className="text-xs text-muted-foreground">{ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {tickets.map((ticket: any) => {
                const isOverdue = ticket.slaBreached || (ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && 
                  !["resolved", "closed"].includes(ticket.status || ""));
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <Checkbox
                      checked={selectedTickets.has(ticket.id)}
                      onCheckedChange={() => toggleTicketSelection(ticket.id)}
                      className="mt-5"
                    />
                    <Card
                      className={cn(
                        "flex-1 glass-card cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                        "border-l-4",
                        ticket.priority === "critical" ? "border-l-red-500" :
                        ticket.priority === "high" ? "border-l-orange-500" :
                        ticket.priority === "medium" ? "border-l-yellow-500" : "border-l-green-500",
                        isOverdue && "ring-2 ring-red-500/50"
                      )}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm line-clamp-2 mb-1">{ticket.title}</h3>
                              <span className="font-mono text-xs text-muted-foreground">{ticket.ticketNumber}</span>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs gap-1 ml-2">
                                  <AlertTriangle className="h-3 w-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <StatusBadge status={ticket.status || "new"} />
                              <PriorityBadge priority={ticket.priority || "medium"} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {ticket.category && <Badge variant="outline" className="rounded-lg">{ticket.category.name}</Badge>}
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {ticket.customerName && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {ticket.customerName}
                                </span>
                              )}
                              {ticket.studio && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {ticket.studio.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          {ticket.assignedTo && (
                            <div className="flex items-center gap-2 pt-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px] bg-primary/20">
                                  {((ticket.assignedTo.displayName ?? ticket.assignedTo.firstName ?? "U") || "U").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                Assigned to {ticket.assignedTo.displayName || ticket.assignedTo.firstName || "User"}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickets.map((ticket: any) => {
                const isOverdue = ticket.slaBreached || (ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && 
                  !["resolved", "closed"].includes(ticket.status || ""));
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card
                      className={cn(
                        "glass-card cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                        "border-l-4 h-full",
                        ticket.priority === "critical" ? "border-l-red-500" :
                        ticket.priority === "high" ? "border-l-orange-500" :
                        ticket.priority === "medium" ? "border-l-yellow-500" : "border-l-green-500",
                        isOverdue && "ring-2 ring-red-500/50"
                      )}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-sm line-clamp-2 flex-1">{ticket.title}</h3>
                            <StatusBadge status={ticket.status || "new"} />
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={ticket.priority || "medium"} />
                            {ticket.category && <Badge variant="outline" className="text-xs">{ticket.category.name}</Badge>}
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {ticket.customerName && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.customerName}
                              </div>
                            )}
                            {ticket.studio && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {ticket.studio.name}
                              </div>
                            )}
                            {ticket.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.assignedTo.displayName || "Assigned"}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Compact View */}
          {viewMode === "compact" && (
            <Card className="overflow-hidden">
              <div className="divide-y">
                {tickets.map((ticket: any) => {
                  const isOverdue = ticket.slaBreached || (ticket.slaDueAt && new Date(ticket.slaDueAt) < new Date() && 
                    !["resolved", "closed"].includes(ticket.status || ""));
                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "p-3 cursor-pointer hover:bg-muted/30 transition-colors flex items-center gap-3",
                        isOverdue && "bg-red-500/5"
                      )}
                      onClick={() => handleTicketClick(ticket)}
                    >
                      <Checkbox
                        checked={selectedTickets.has(ticket.id)}
                        onCheckedChange={() => toggleTicketSelection(ticket.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">{ticket.title}</h4>
                          <p className="text-xs text-muted-foreground">{ticket.ticketNumber}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={ticket.status || "new"} />
                          <PriorityBadge priority={ticket.priority || "medium"} />
                          <span className="text-xs text-muted-foreground min-w-[100px] text-right">
                            {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(STATUSES).map(([statusKey, statusConfig]) => {
                const statusTickets = tickets.filter((t: any) => (t.status || "new") === statusKey);
                return (
                  <div key={statusKey} className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <h3 className="font-semibold text-sm">{statusConfig.label}</h3>
                      <Badge variant="secondary" className="text-xs">{statusTickets.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {statusTickets.map((ticket: any) => (
                        <Card
                          key={ticket.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleTicketClick(ticket)}
                        >
                          <CardContent className="p-3 space-y-2">
                            <h4 className="font-medium text-sm line-clamp-2">{ticket.title}</h4>
                            <div className="flex items-center gap-2">
                              <PriorityBadge priority={ticket.priority || "medium"} />
                              {ticket.category && (
                                <Badge variant="outline" className="text-xs">{ticket.category.name}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {ticket.assignedTo ? (
                                <>
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-[8px] bg-primary/20">
                                      {((ticket.assignedTo.displayName ?? ticket.assignedTo.firstName ?? "U") || "U").slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{ticket.assignedTo.displayName?.split(' ')[0] || "User"}</span>
                                </>
                              ) : (
                                <span>Unassigned</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {statusTickets.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No tickets
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
          <EmptyState
            title="No tickets found"
            description={
              activeFiltersCount > 0 || searchQuery
                ? "Try adjusting your filters or search query"
                : "Create your first ticket to get started"
            }
            action={
              activeFiltersCount > 0 || searchQuery
                ? { label: "Clear Filters", onClick: clearFilters }
                : { label: "Create Ticket", onClick: () => navigate("/tickets/new") }
            }
          />
        )}

      {tickets && tickets.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
          {tickets.length > 10 && (
            <Button variant="ghost" size="sm" onClick={selectAllVisible}>
              Select all visible
            </Button>
          )}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">
                    {selectedTicket.ticketNumber}
                  </span>
                  <StatusBadge status={selectedTicket.status || "new"} />
                  <PriorityBadge priority={selectedTicket.priority || "medium"} />
                </div>
                <DialogTitle className="text-xl">{selectedTicket.title}</DialogTitle>
                <DialogDescription>
                  Created {selectedTicket.createdAt && format(new Date(selectedTicket.createdAt), "PPpp")}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicket.description || "No description provided."}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Customer Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name</span>
                        <p className="font-medium">{selectedTicket.customerName || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email</span>
                        <p className="font-medium">{selectedTicket.customerEmail || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Phone</span>
                        <p className="font-medium">{selectedTicket.customerPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Membership ID</span>
                        <p className="font-medium">{selectedTicket.customerMembershipId || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status</span>
                        <p className="font-medium capitalize">{selectedTicket.customerStatus || "Not provided"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mood</span>
                        <p className="font-medium capitalize">{selectedTicket.clientMood || "Not recorded"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Meta */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Ticket Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category</span>
                        <p className="font-medium">{selectedTicket.category?.name || "Not set"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Subcategory</span>
                        <p className="font-medium">{selectedTicket.subcategory?.name || "Not set"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Studio</span>
                        <p className="font-medium">{selectedTicket.studio?.name || "Not set"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source</span>
                        <p className="font-medium capitalize">{selectedTicket.source || "Not set"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned To</span>
                        <p className="font-medium">
                          {selectedTicket.assignedTo?.displayName || selectedTicket.assignedTo?.firstName || "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported By</span>
                        <p className="font-medium">
                          {selectedTicket.reportedBy?.displayName || selectedTicket.reportedBy?.firstName || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">SLA Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Due Date</span>
                        <p className="font-medium">
                          {selectedTicket.slaDueAt 
                            ? format(new Date(selectedTicket.slaDueAt), "PPp")
                            : "Not set"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">SLA Status</span>
                        <p className={cn(
                          "font-medium",
                          selectedTicket.slaBreached && "text-destructive"
                        )}>
                          {selectedTicket.slaBreached ? "Breached" : "On Track"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTicket.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="rounded-xl">
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsDetailOpen(false);
                    navigate(`/tickets/${selectedTicket.id}`);
                  }}
                  className="rounded-xl"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Open Full View
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Trainer Feedback Modal */}
      <TrainerFeedbackModal 
        open={isFeedbackModalOpen} 
        onOpenChange={setIsFeedbackModalOpen} 
      />
    </div>
  );
}
