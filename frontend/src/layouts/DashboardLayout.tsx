import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Calendar,
  Ticket,
  FolderOpen,
  Settings,
  Users,
  Menu,
  X,
  Search,
  LogOut,
  ChevronRight,
  Plus,
  Star,
  LayoutDashboard,
  ChevronDown,
  BarChart3
} from "lucide-react";
import { useUserStore } from "../store/user-store";
import { useEventStore } from "../store/event-store";
import { api, hasAuthTokens } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  staffOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Registration Review", href: "/dashboard/registered", icon: Ticket, staffOnly: true },
  { name: "Event Directories", href: "/dashboard/directories", icon: FolderOpen },
  { name: "Profile Settings", href: "/dashboard/profile", icon: Settings },
  { name: "User & Staff", href: "/dashboard/users", icon: Users, adminOnly: true },
  { name: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3, staffOnly: true },
];

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUserStore();
  const { searchEvents, fetchEvents } = useEventStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    if (!hasAuthTokens()) {
      logout();
      navigate("/auth/login", { replace: true });
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await api.get("/users/whoami");
        setProfile({
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role,
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Session expired or unauthorized", err);
        logout();
        navigate("/auth/login", { replace: true });
      }
    };
    fetchSession();
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.trim()) {
      searchEvents(query);
      if (location.pathname !== "/dashboard/directories") {
        navigate("/dashboard/directories");
      }
    } else {
      fetchEvents();
    }
  };

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbs = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
    const isLast = index === pathnames.length - 1;
    return { name: name.charAt(0).toUpperCase() + name.slice(1), href: routeTo, isLast };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" />
          </div>
          <p className="text-2xl font-semibold text-foreground">Event-Management</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "ADMIN";
  const isStaff = profile?.role === "STAFF";

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-card transition-all duration-300 ease-in-out border-r border-border",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isSidebarOpen ? "w-64" : "w-16 lg:w-16"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-14 px-3 shrink-0 border-b border-border">
          <div className={cn("flex items-center gap-2 overflow-hidden transition-all duration-300", isSidebarOpen ? "opacity-100" : "opacity-0 w-0")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary shrink-0">
              <Star className="w-4 h-4 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight truncate">Event-Management</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:flex shrink-0"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAV_ITEMS.filter((item) => {
            if (item.adminOnly && !isAdmin) return false;
            if (item.staffOnly && !isAdmin && !isStaff) return false;
            return true;
          }).map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.href);
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={cn(
                  "w-full justify-start overflow-hidden",
                  !isSidebarOpen && "justify-center px-0"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                <Link to={item.href}>
                  <item.icon className={cn("w-4 h-4 shrink-0", isSidebarOpen ? "mr-2" : "m-0")} />
                  {isSidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Sidebar Footer - User Profile Dropdown */}
        <div className="p-2 border-t border-border shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-auto p-2 flex items-center",
                  !isSidebarOpen ? "justify-center" : "justify-start gap-2"
                )}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {profile?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isSidebarOpen && (
                  <div className="flex flex-1 items-center justify-between overflow-hidden">
                    <div className="flex flex-col items-start truncate">
                      <span className="text-sm font-medium truncate w-32 text-left">{profile?.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {profile?.role.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 mb-1">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-14 shrink-0 px-4 md:px-6 flex items-center justify-between z-30 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
              <span className="font-medium">Home</span>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <ChevronRight className="w-4 h-4" />
                  <span className={cn(crumb.isLast && "font-semibold text-foreground")}>
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                onChange={handleSearch}
                placeholder="Search events..."
                className="w-64 pl-9 rounded-md bg-muted"
              />
            </div>

            {/* Mode Toggle */}
            <ModeToggle />

            {/* New Event CTA */}
            <Button asChild size="sm" className="hidden sm:flex gap-2">
              <Link to="/dashboard/directories/create">
                <Plus className="w-4 h-4" />
                New Event
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
