import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, Star, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/#events" },
  { name: "About", href: "/#about" },
];

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-lg shrink-0 transition-transform group-hover:scale-105">
                <Star className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold text-lg tracking-tight text-foreground">
                  Event-Management
                </span>
                <div className="h-px w-full mt-0.5 bg-gradient-to-r from-primary/60 to-transparent" />
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.name}
                </a>
              ))}
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to="/auth/login">Staff Login</Link>
              </Button>
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              id="mobile-menu-toggle"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 border-t border-border/40",
            mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 pb-4 pt-3 space-y-3 bg-background">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Button asChild className="w-full rounded-full" size="sm">
              <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                Staff Login
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Gradient divider */}
      <div className="h-px shrink-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-primary/70">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-semibold text-white">Event-Management</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Discover and register for premium seminars, workshops, and conferences — all in one elegant portal.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/#events" className="hover:text-white transition-colors">Browse Events</a></li>
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Staff Login</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0 text-primary/80" />
                  support@eventmanagement.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0 text-primary/80" />
                  +252633306376
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0 text-primary/80" />
                  Hargeisa, Somaliland
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 text-center text-xs text-slate-500 border-t border-slate-800">
            © {new Date().getFullYear()} Event-Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
