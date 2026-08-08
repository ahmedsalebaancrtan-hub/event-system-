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
  Bell,
  LogOut,
  ChevronRight,
  Plus,
  Star,
  LayoutDashboard
} from "lucide-react";
import { useUserStore } from "../store/user-store";
import { useEventStore } from "../store/event-store";
import { api } from "../lib/api";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Registered Events", href: "/dashboard/registered", icon: Ticket },
  { name: "Event Directories", href: "/dashboard/directories", icon: FolderOpen },
  { name: "Profile Settings", href: "/dashboard/profile", icon: Settings },
  { name: "User & Staff", href: "/dashboard/users", icon: Users, adminOnly: true },
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
        navigate("/auth/login");
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

  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbs = pathnames.map((name, index) => {
    const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    return { name: name.charAt(0).toUpperCase() + name.slice(1), href: routeTo, isLast };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-4 animate-spin" style={{ borderColor: 'var(--magenta)' }}></div>
            <div className="absolute inset-2 rounded-full border-t-4 animate-spin animation-delay-150" style={{ borderColor: 'var(--gold)', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-4 rounded-full border-t-4 animate-spin" style={{ borderColor: 'var(--plum)' }}></div>
          </div>
          <p className="font-luxury text-2xl" style={{ color: 'var(--plum)' }}>Event-Management</p>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--ivory)' }}>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden transition-opacity"
          style={{ backgroundColor: 'rgba(54,1,58,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* LUXURY SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col text-white shadow-2xl transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isSidebarOpen ? "w-72" : "w-20 lg:w-20"}
        `}
        style={{
          background: `linear-gradient(180deg, var(--plum-dark) 0%, var(--plum) 60%, var(--plum-mid) 100%)`,
          borderRight: '1px solid rgba(212,175,55,0.2)'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
          <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 w-0"}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ background: `linear-gradient(135deg, var(--magenta), var(--gold))` }}>
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-luxury text-xl tracking-wide text-white">Event-Management</span>
              <div className="h-px w-full mt-0.5" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}></div>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg transition-colors hidden lg:block shrink-0"
            style={{ color: 'rgba(212,175,55,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.7)')}
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg transition-colors lg:hidden"
            style={{ color: 'rgba(212,175,55,0.7)' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map((item) => {
            const isActive = item.href === "/dashboard"
            ? location.pathname === "/dashboard"
            : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative"
                style={{
                  background: isActive
                    ? `linear-gradient(90deg, var(--magenta), var(--magenta-dark))`
                    : 'transparent',
                  borderLeft: isActive ? `3px solid var(--gold)` : '3px solid transparent',
                }}
                title={!isSidebarOpen ? item.name : undefined}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(189,3,166,0.15)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <item.icon
                  className="w-6 h-6 shrink-0 transition-colors"
                  style={{ color: isActive ? 'var(--gold)' : 'rgba(212,175,55,0.6)' }}
                />
                <span
                  className={`font-medium whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 hidden lg:block w-0"}`}
                  style={{ color: isActive ? 'white' : 'rgba(255,255,255,0.7)' }}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold)' }}></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Gold Divider */}
        <div className="mx-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}></div>

        {/* Sidebar Footer */}
        <div className="p-4 shrink-0">
          <div
            className={`flex items-center gap-3 rounded-2xl p-3 transition-all duration-300 ${!isSidebarOpen ? "justify-center" : ""}`}
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
              style={{
                background: `linear-gradient(135deg, var(--magenta), var(--plum-mid))`,
                borderColor: 'rgba(212,175,55,0.5)'
              }}>
              <span className="font-bold text-sm text-white">{profile?.name.charAt(0).toUpperCase()}</span>
            </div>

            <div className={`flex-1 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
              <p className="text-sm font-semibold truncate text-white">{profile?.name}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(212,175,55,0.2)', color: 'var(--gold-light)' }}>
                {profile?.role === "ADMIN" ? "Admin" : "Organizer"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors shrink-0 ${!isSidebarOpen ? "hidden" : "block"}`}
              style={{ color: 'rgba(212,175,55,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.5)')}
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {!isSidebarOpen && (
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex justify-center p-3 rounded-xl transition-colors"
              style={{ color: 'rgba(212,175,55,0.5)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.5)')}
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* LUXURY HEADER */}
        <header className="h-20 shrink-0 px-6 flex items-center justify-between z-30 shadow-sm"
          style={{
            background: 'rgba(250,249,246,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(212,175,55,0.2)'
          }}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium">
              <span style={{ color: 'var(--magenta)' }}>Home</span>
              {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.href}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span style={{ color: crumb.isLast ? 'var(--plum)' : '#9ca3af', fontWeight: crumb.isLast ? 600 : 400 }}>
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search */}
            <div className="hidden md:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors"
                style={{ color: '#9ca3af' }}>
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                onChange={handleSearch}
                placeholder="Search events..."
                className="w-64 pl-10 pr-4 py-2.5 text-sm rounded-full outline-none transition-all duration-300"
                style={{
                  background: 'rgba(74,0,78,0.04)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  color: 'var(--plum)',
                }}
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-full transition-colors text-gray-500 hover:bg-gray-100">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: 'var(--magenta)' }}></span>
            </button>

            {/* New Event CTA */}
            <Link
              to="/dashboard/directories/create"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-white rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                boxShadow: '0 4px 15px rgba(189,3,166,0.3)',
                border: '1px solid rgba(212,175,55,0.3)'
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 25px rgba(189,3,166,0.45)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(189,3,166,0.3)')}
            >
              <Plus className="w-4 h-4" style={{ color: 'var(--gold-light)' }} />
              <span>New Event</span>
            </Link>
          </div>
        </header>

        {/* Gold accent line below header */}
        <div className="h-px shrink-0" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), var(--magenta), var(--gold), transparent)' }}></div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
