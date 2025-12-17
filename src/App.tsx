import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Menu, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tickets from "@/pages/tickets";
import NewTicket from "@/pages/ticket-new";
import TicketDetail from "@/pages/ticket-detail";
import Analytics from "@/pages/analytics";
import Teams from "@/pages/teams";
import Studios from "@/pages/studios";
import Categories from "@/pages/categories";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Templates from "@/pages/templates";

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/tickets/new" component={NewTicket} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/templates" component={Templates} />
      <Route path="/teams" component={Teams} />
      <Route path="/studios" component={Studios} />
      <Route path="/categories" component={Categories} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-lg font-semibold gradient-text-accent">Loading</p>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Premium Header */}
          <header className="relative flex items-center justify-between gap-4 px-6 py-4 border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none" />
            
            <div className="relative flex items-center gap-3">
              <SidebarTrigger 
                className="h-9 w-9 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200" 
                data-testid="button-sidebar-toggle"
              >
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
            </div>
            
            <div className="relative flex items-center gap-3">
              <ThemeToggle />
              {user && (
                <div className="flex items-center gap-4 pl-4 ml-1 border-l border-border/50">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold">{user.firstName || user.email || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                    onClick={() => signOut()}
                    data-testid="button-signout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8 animate-fade-in">
              <AuthenticatedRoutes />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="physique57-theme">
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
