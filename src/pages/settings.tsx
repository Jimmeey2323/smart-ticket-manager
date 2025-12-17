import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Building2,
  Tag,
  Users,
  Loader2,
  ChevronRight,
  AlertCircle,
  Database,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { CATEGORIES, STUDIOS, PRIORITIES, STATUSES, DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SettingsState {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  notifications: {
    newAssignments: boolean;
    ticketUpdates: boolean;
    slaWarnings: boolean;
    dailyDigest: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  appearance: {
    theme: "light" | "dark" | "system";
    language: string;
    compactMode: boolean;
    animationsEnabled: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
    },
    notifications: {
      newAssignments: true,
      ticketUpdates: true,
      slaWarnings: true,
      dailyDigest: false,
      emailNotifications: true,
      pushNotifications: false,
    },
    appearance: {
      theme: (theme as "light" | "dark" | "system") || "system",
      language: "en",
      compactMode: false,
      animationsEnabled: true,
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
    },
  });

  // Custom entities state for CRUD
  const [customStudios, setCustomStudios] = useState(STUDIOS.map(s => ({ ...s, isCustom: false })));
  const [customCategories, setCustomCategories] = useState(CATEGORIES.map(c => ({ ...c, isCustom: false })));
  const [newStudioName, setNewStudioName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingStudio, setEditingStudio] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const handleSave = async (section: string) => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (section === "appearance") {
        setTheme(settings.appearance.theme);
      }
      
      toast({
        title: "Settings saved",
        description: `Your ${section} preferences have been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addStudio = () => {
    if (!newStudioName.trim()) return;
    
    const newStudio = {
      id: `custom-${Date.now()}`,
      name: newStudioName.trim(),
      city: "Custom",
      isCustom: true,
    };
    
    setCustomStudios(prev => [...prev, newStudio]);
    setNewStudioName("");
    toast({
      title: "Studio added",
      description: `${newStudio.name} has been added to the list.`,
    });
  };

  const removeStudio = (id: string) => {
    setCustomStudios(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Studio removed",
      description: "The studio has been removed from the list.",
    });
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory = {
      id: `custom-${Date.now()}`,
      code: newCategoryName.substring(0, 3).toUpperCase(),
      name: newCategoryName.trim(),
      icon: "Tag",
      defaultTeam: "Operations",
      defaultPriority: "medium",
      subcategories: [],
      isCustom: true,
    };
    
    setCustomCategories(prev => [...prev, newCategory]);
    setNewCategoryName("");
    toast({
      title: "Category added",
      description: `${newCategory.name} has been added to the list.`,
    });
  };

  const removeCategory = (id: string) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Category removed",
      description: "The category has been removed from the list.",
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <SettingsIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text-accent">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account, preferences, and application configuration
          </p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-1">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, firstName: e.target.value }
                    }))}
                    placeholder="Enter first name"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, lastName: e.target.value }
                    }))}
                    placeholder="Enter last name"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                  placeholder="Enter email"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, phone: e.target.value }
                  }))}
                  placeholder="Enter phone number"
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.role || "Staff"} disabled className="rounded-xl bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Input value={user?.teamId || "Not assigned"} disabled className="rounded-xl bg-muted" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("profile")} disabled={isSaving} className="rounded-xl">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "newAssignments", label: "New ticket assignments", description: "Get notified when a ticket is assigned to you" },
                { key: "ticketUpdates", label: "Ticket updates", description: "Get notified when tickets you're involved in are updated" },
                { key: "slaWarnings", label: "SLA warnings", description: "Get notified when SLA deadlines are approaching" },
                { key: "dailyDigest", label: "Daily digest", description: "Receive a daily summary of ticket activity" },
                { key: "emailNotifications", label: "Email notifications", description: "Receive notifications via email" },
                { key: "pushNotifications", label: "Push notifications", description: "Receive browser push notifications" },
              ].map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div className="space-y-0.5">
                    <Label className="font-medium">{item.label}</Label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [item.key]: checked }
                    }))}
                  />
                </motion.div>
              ))}
              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("notifications")} disabled={isSaving} className="rounded-xl">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance Settings
              </CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: "☀️" },
                    { value: "dark", label: "Dark", icon: "🌙" },
                    { value: "system", label: "System", icon: "💻" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        appearance: { ...prev.appearance, theme: option.value as "light" | "dark" | "system" }
                      }))}
                      className={cn(
                        "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
                        settings.appearance.theme === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, language: value }
                  }))}
                >
                  <SelectTrigger className="w-full md:w-64 rounded-xl">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact interface layout</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, compactMode: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animationsEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      appearance: { ...prev.appearance, animationsEnabled: checked }
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => handleSave("appearance")} disabled={isSaving} className="rounded-xl">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your security preferences and sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label>Two-factor authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" className="rounded-xl">
                  {settings.security.twoFactorEnabled ? "Manage" : "Enable"}
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Session Timeout</Label>
                <Select
                  value={settings.security.sessionTimeout.toString()}
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(value) }
                  }))}
                >
                  <SelectTrigger className="w-full md:w-64 rounded-xl">
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Automatically sign out after this period of inactivity
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Active Sessions</Label>
                <Card className="bg-muted/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Current Session</p>
                          <p className="text-xs text-muted-foreground">Browser • Active now</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-lg">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  Irreversible actions that affect your account
                </p>
                <div className="flex gap-3">
                  <Button variant="destructive" className="rounded-xl">
                    Sign Out All Devices
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management Tab */}
        <TabsContent value="data" className="space-y-6">
          {/* Studios Management */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Studios
                  </CardTitle>
                  <CardDescription>Manage studio locations</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Studio
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Studio</DialogTitle>
                      <DialogDescription>Add a new studio location to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Studio Name</Label>
                        <Input
                          value={newStudioName}
                          onChange={(e) => setNewStudioName(e.target.value)}
                          placeholder="Enter studio name"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addStudio} className="rounded-xl">Add Studio</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customStudios.map((studio, index) => (
                  <motion.div
                    key={studio.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{studio.name}</p>
                        <p className="text-xs text-muted-foreground">{studio.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {studio.isCustom && (
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                      )}
                      {studio.isCustom && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Studio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{studio.name}" from the system. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeStudio(studio.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Management */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Categories
                  </CardTitle>
                  <CardDescription>Manage ticket categories</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                      <DialogDescription>Add a new ticket category to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addCategory} className="rounded-xl">Add Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {customCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.subcategories?.length || 0} subcategories
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">{category.code}</Badge>
                      {category.isCustom && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove "{category.name}" from the system. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeCategory(category.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                System Configuration
              </CardTitle>
              <CardDescription>
                View and manage system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Priority Levels</h4>
                  <div className="space-y-2">
                    {Object.entries(PRIORITIES).map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-3 w-3 rounded-full",
                            key === "critical" && "bg-red-500",
                            key === "high" && "bg-orange-500",
                            key === "medium" && "bg-yellow-500",
                            key === "low" && "bg-green-500",
                          )} />
                          <span className="text-sm font-medium">{config.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          SLA: {config.slaHours}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Status Types</h4>
                  <div className="space-y-2">
                    {Object.entries(STATUSES).map(([key, config]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{config.label}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Departments</h4>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <Badge key={dept} variant="secondary" className="rounded-lg">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">System Configuration</p>
                  <p className="text-xs text-muted-foreground">
                    Priority, status, and department settings are managed at the system level.
                    Contact your administrator to make changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
