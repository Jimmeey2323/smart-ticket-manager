import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Star,
  Sparkles,
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Settings,
  Package,
  Headphones,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TICKET_TEMPLATES, type TicketTemplate as BaseTicketTemplate } from "@/components/ticket-templates";

interface TicketTemplate extends BaseTicketTemplate {
  isCustom?: boolean;
  usageCount?: number;
  lastUsed?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  CreditCard,
  Users,
  AlertTriangle,
  Smartphone,
  MessageSquare,
  Settings,
  Package,
  Headphones,
  Star,
  FileText,
};

// Convert shared templates to page templates with usage stats
const DEFAULT_TEMPLATES: TicketTemplate[] = TICKET_TEMPLATES.map((template, index) => ({
  ...template,
  usageCount: Math.floor(Math.random() * 200) + 10,
  lastUsed: index < 3 ? "Today" : index < 6 ? "Yesterday" : `${index} days ago`,
}));

// Add additional critical templates not in the shared component
const ADDITIONAL_TEMPLATES: TicketTemplate[] = [
  // CRITICAL TEMPLATES - Safety & Security
  {
    id: "medical-emergency",
    name: "Medical Emergency",
    description: "Report urgent medical incident requiring immediate attention",
    icon: AlertTriangle,
    category: "Health & Safety",
    subcategory: "Injury During Class",
    priority: "critical",
    suggestedTitle: "🚨 MEDICAL EMERGENCY - [Studio Location] - [Date/Time]",
    suggestedDescription: `⚠️ URGENT MEDICAL INCIDENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 INCIDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date & Time: [REQUIRED]
• Studio Location: [REQUIRED]
• Client Name: [REQUIRED]
• Client Contact: [phone/email]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 EMERGENCY DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nature of emergency: [describe medical situation]
• Symptoms observed: [list symptoms]
• Was client conscious? [Yes/No]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚑 IMMEDIATE ACTIONS TAKEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• First aid administered: [Yes/No - describe]
• Emergency services called: [Yes/No - time]
• Ambulance dispatched: [Yes/No]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 CURRENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Client current condition: [stable/critical/transported]
• Family notified: [Yes/No]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 WITNESSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Staff present: [names]
• Other members: [count]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 FOLLOW-UP REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Incident report filed
□ Insurance notification
□ Follow-up call to client`,
    tags: ["emergency", "medical", "urgent", "safety"],
    color: "from-red-600 to-rose-600",
    usageCount: 8,
    lastUsed: "1 week ago",
  },
  {
    id: "theft-report",
    name: "Theft at Studio",
    description: "Report theft or suspected theft incident",
    icon: AlertTriangle,
    category: "Health & Safety",
    subcategory: "Equipment Safety",
    priority: "critical",
    suggestedTitle: "🔒 THEFT REPORT - [Studio] - [Item(s)] - [Date]",
    suggestedDescription: `⚠️ THEFT INCIDENT REPORT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DISCOVERY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date & Time of Discovery: [REQUIRED]
• Studio Location: [REQUIRED]
• Reported By: [staff name]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 ITEMS MISSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Item: [description]
   Estimated Value: ₹[amount]
2. [Additional items...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LOCATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Specific area: [locker room/reception/studio floor]
• Last known secure time: [time]
• Access during period: [who had access]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📹 EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ CCTV Review Required
• CCTV footage available: [Yes/No]
• Time range to review: [from - to]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 VICTIM DETAILS (if member property)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Member Name: [name]
• Membership ID: [ID]
• Contact: [phone/email]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚔 POLICE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Filed: [Yes/No]
• FIR Number: [if filed]
• Officer Name: [if applicable]`,
    tags: ["theft", "security", "urgent", "police"],
    color: "from-slate-700 to-slate-900",
    usageCount: 3,
    lastUsed: "2 weeks ago",
  },
  {
    id: "staff-misconduct",
    name: "Staff Misconduct",
    description: "Report internal staff conduct or policy violations",
    icon: Users,
    category: "Community & Culture",
    subcategory: "Discrimination",
    priority: "high",
    suggestedTitle: "⚠️ Staff Conduct Issue - [Nature] - [Studio] - Confidential",
    suggestedDescription: `🔒 CONFIDENTIAL STAFF MISCONDUCT REPORT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 INCIDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date of Incident: [REQUIRED]
• Studio Location: [REQUIRED]
• Reporting Person: [Your Name - Optional for anonymous]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 STAFF MEMBER INVOLVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: [staff name]
• Role: [trainer/front desk/manager]
• Employment ID: [if known]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NATURE OF MISCONDUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Policy Violation
□ Inappropriate Behavior
□ Harassment
□ Discrimination
□ Safety Protocol Breach
□ Other: [specify]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DETAILED DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Provide factual account of what occurred]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 WITNESSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• [Name 1 - Role]
• [Name 2 - Role]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📎 EVIDENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Written statements
□ CCTV footage
□ Messages/emails
□ Photos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Affected parties: [members/staff]
• Severity: [Minor/Moderate/Severe]

🔒 This report will be handled confidentially by HR.`,
    tags: ["hr", "misconduct", "confidential", "internal"],
    color: "from-amber-600 to-orange-600",
    usageCount: 5,
    lastUsed: "3 days ago",
  },
  {
    id: "pricing-error",
    name: "Pricing Error Investigation",
    description: "Investigate pricing discrepancies or billing errors",
    icon: CreditCard,
    category: "Retail Management",
    subcategory: "Pricing",
    priority: "high",
    suggestedTitle: "Pricing Investigation - [Type] - [Member/Transaction ID]",
    suggestedDescription: `💰 PRICING ERROR INVESTIGATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 REPORT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Date Reported: [REQUIRED]
• Reported By: [staff/member name]
• Studio Location: [REQUIRED]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 AFFECTED MEMBER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: [member name]
• Membership ID: [ID]
• Contact: [email/phone]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 ERROR DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type of error:
□ Incorrect package price
□ Promo code not applied
□ Double charge
□ Wrong membership tier
□ Retail item mispriced
□ Other: [specify]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💳 TRANSACTION INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Transaction ID: [ID]
• Transaction Date: [date]
• Amount Charged: ₹[charged]
• Expected Amount: ₹[expected]
• Difference: ₹[difference]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Detailed explanation of the pricing error]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INVESTIGATION NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Review POS records
□ Check promo validity
□ Verify membership pricing
□ Review system settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RESOLUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Refund required: ₹[amount]
□ Credit to account: ₹[amount]
□ System correction needed
□ Price update required

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 MEMBER COMMUNICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Member notified: [Yes/No]
• Resolution timeline communicated: [Yes/No]`,
    tags: ["pricing", "finance", "billing", "refund"],
    color: "from-emerald-500 to-teal-500",
    usageCount: 34,
    lastUsed: "2 hours ago",
  },
];

// Combine all templates - shared templates plus additional critical ones
const ALL_TEMPLATES: TicketTemplate[] = [...DEFAULT_TEMPLATES, ...ADDITIONAL_TEMPLATES];

export default function Templates() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<TicketTemplate[]>(ALL_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    priority: "medium",
    suggestedTitle: "",
    suggestedDescription: "",
    tags: "",
  });

  const categories = [...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      (template.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.tags ?? []).some(tag => (tag ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || template.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const handleUseTemplate = (template: TicketTemplate) => {
    navigate(`/tickets/new?template=${template.id}`);
    toast({
      title: "Template selected",
      description: `Using "${template.name}" template`,
    });
  };

  const handleCreateTemplate = () => {
    const id = `custom-${Date.now()}`;
    const newTemplateData: TicketTemplate = {
      id,
      name: newTemplate.name,
      description: newTemplate.description,
      icon: FileText,
      category: newTemplate.category || "Custom",
      priority: newTemplate.priority,
      suggestedTitle: newTemplate.suggestedTitle,
      suggestedDescription: newTemplate.suggestedDescription,
      tags: (newTemplate.tags ?? '').split(",").map(t => t.trim()).filter(Boolean),
      color: "from-slate-500 to-gray-500",
      isCustom: true,
      usageCount: 0,
    };
    setTemplates([newTemplateData, ...templates]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      category: "",
      priority: "medium",
      suggestedTitle: "",
      suggestedDescription: "",
      tags: "",
    });
    toast({
      title: "Template created",
      description: `"${newTemplate.name}" has been added to your templates`,
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "The template has been removed",
    });
  };

  const handleDuplicateTemplate = (template: TicketTemplate) => {
    const newId = `${template.id}-copy-${Date.now()}`;
    const duplicated: TicketTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      isCustom: true,
      usageCount: 0,
    };
    setTemplates([duplicated, ...templates]);
    toast({
      title: "Template duplicated",
      description: `Created a copy of "${template.name}"`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text-accent">Ticket Templates</h1>
            <p className="text-sm text-muted-foreground">
              Quick-start templates for common ticket types
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a reusable template for common ticket types
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Refund Request"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    placeholder="e.g., Billing"
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of when to use this template"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Priority</Label>
                  <Select
                    value={newTemplate.priority}
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, priority: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="refund, billing, urgent"
                    value={newTemplate.tags}
                    onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Suggested Title</Label>
                <Input
                  placeholder="Default ticket title"
                  value={newTemplate.suggestedTitle}
                  onChange={(e) => setNewTemplate({ ...newTemplate, suggestedTitle: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Suggested Description</Label>
                <Textarea
                  placeholder="Default ticket description with placeholders like [customer name]"
                  value={newTemplate.suggestedDescription}
                  onChange={(e) => setNewTemplate({ ...newTemplate, suggestedDescription: e.target.value })}
                  className="rounded-xl min-h-32"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!newTemplate.name} className="rounded-xl">
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 rounded-xl">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36 rounded-xl">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-xl overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          : "space-y-4"
      )}>
        <AnimatePresence>
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "glass-card group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden",
                  viewMode === "list" && "flex"
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                    template.color
                  )} />
                  
                  <CardContent className={cn(
                    "p-5 relative",
                    viewMode === "list" && "flex items-center gap-4 flex-1"
                  )}>
                    <div className={cn(
                      viewMode === "grid" ? "space-y-4" : "flex items-center gap-4 flex-1"
                    )}>
                      {/* Icon & Title */}
                      <div className={cn(
                        "flex items-start gap-3",
                        viewMode === "list" && "flex-1"
                      )}>
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                          "bg-gradient-to-br shadow-lg",
                          template.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{template.name}</h3>
                            {template.isCustom && (
                              <Badge variant="outline" className="text-xs">Custom</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Tags & Meta */}
                      {viewMode === "grid" && (
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={
                            template.priority === "critical" ? "destructive" :
                            template.priority === "high" ? "default" : "secondary"
                          }>
                            {template.priority}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      )}

                      {/* Stats */}
                      {viewMode === "grid" && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <span>{template.usageCount || 0} uses</span>
                          {template.lastUsed && <span>Last: {template.lastUsed}</span>}
                        </div>
                      )}

                      {/* List view badges */}
                      {viewMode === "list" && (
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            template.priority === "critical" ? "destructive" :
                            template.priority === "high" ? "default" : "secondary"
                          }>
                            {template.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {template.usageCount || 0} uses
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={cn(
                      "flex gap-2",
                      viewMode === "grid" 
                        ? "pt-4 border-t border-border/50" 
                        : "shrink-0"
                    )}>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="rounded-lg flex-1"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                        className="rounded-lg"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {template.isCustom && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="rounded-lg text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setPriorityFilter("all"); }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
