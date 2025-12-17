import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Ticket,
  Plus,
  Users,
  Building2,
  FolderKanban,
  Settings,
  Bell,
  BarChart3,
  Sparkles,
  FileText,
  Star,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "All Tickets", url: "/tickets", icon: Ticket },
  { title: "New Ticket", url: "/tickets/new", icon: Plus },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const managementItems = [
  { title: "Teams", url: "/teams", icon: Users },
  { title: "Studios", url: "/studios", icon: Building2 },
  { title: "Categories", url: "/categories", icon: FolderKanban },
];

const settingsItems = [
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  return (
    <Sidebar className="border-0 sidebar-premium">
      <SidebarHeader className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Physique 57" 
                className="h-11 w-11 object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm gradient-text-accent">Physique 57</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Ticket System
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-slide-in-right" style={{ animationDelay: `${index * 50}ms` }}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "group relative rounded-xl transition-all duration-300",
                      isActive(item.url) 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Link href={item.url} data-testid={`nav-${(item.title ?? '').toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                        isActive(item.url) 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {item.title === "New Ticket" && (
                        <Badge className="ml-auto text-[10px] px-1.5 py-0 bg-gradient-to-r from-primary to-secondary text-white border-0">
                          Quick
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-slide-in-right" style={{ animationDelay: `${(index + 4) * 50}ms` }}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "group relative rounded-xl transition-all duration-300",
                      isActive(item.url) 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Link href={item.url} data-testid={`nav-${(item.title ?? '').toLowerCase()}`}>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                        isActive(item.url) 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className="animate-slide-in-right" style={{ animationDelay: `${(index + 7) * 50}ms` }}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={cn(
                      "group relative rounded-xl transition-all duration-300",
                      isActive(item.url) 
                        ? "bg-primary/10 text-primary shadow-sm" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Link href={item.url} data-testid={`nav-${(item.title ?? '').toLowerCase()}`}>
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300",
                        isActive(item.url) 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                      )}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        {user ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-sidebar">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-semibold truncate">
                {user.firstName || (user.email ?? '').split("@")[0] || "User"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user.role || "Staff"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
