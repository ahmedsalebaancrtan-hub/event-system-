import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, Star, Mail, MapPin, Phone } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/#events" },
  { name: "About", href: "/#about" },
];

export const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory)" }}>
      <header
        className="sticky top-0 z-50 shadow-sm"
        style={{
          background: "rgba(250,249,246,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0 transition-transform group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, var(--magenta), var(--gold))",
                  border: "1px solid rgba(212,175,55,0.4)",
                }}
              >
                <Star className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="font-luxury text-xl tracking-wide" style={{ color: "var(--plum)" }}>
                  Event-Management
                </span>
                <div
                  className="h-px w-full mt-0.5"
                  style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
                />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--plum)" }}
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/auth/login"
                className="px-5 py-2.5 text-white rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--plum), var(--magenta))",
                  boxShadow: "0 4px 15px rgba(189,3,166,0.25)",
                  border: "1px solid rgba(212,175,55,0.3)",
                }}
              >
                Staff Login
              </Link>
            </nav>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg"
              style={{ color: "var(--plum)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden px-4 pb-4 space-y-3"
            style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-sm font-medium"
                style={{ color: "var(--plum)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/auth/login"
              className="block text-center px-5 py-2.5 text-white rounded-full text-sm font-medium"
              style={{ background: "linear-gradient(135deg, var(--plum), var(--magenta))" }}
              onClick={() => setMobileOpen(false)}
            >
              Staff Login
            </Link>
          </div>
        )}
      </header>

      <div
        className="h-px shrink-0"
        style={{
          background: "linear-gradient(90deg, transparent, var(--gold), var(--magenta), var(--gold), transparent)",
        }}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer
        style={{
          background: "linear-gradient(180deg, var(--plum-dark) 0%, var(--plum) 100%)",
          borderTop: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--magenta), var(--gold))" }}
                >
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-luxury text-lg text-white">Event-Management</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                Discover and register for premium seminars, workshops, and conferences — all in one elegant portal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/#events" className="hover:text-white transition-colors">Browse Events</a></li>
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Staff Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--gold-light)" }} />
                  support@eventmanagement.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--gold-light)" }} />
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--gold-light)" }} />
                  Nairobi, Kenya
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-10 pt-6 text-center text-xs"
            style={{ borderTop: "1px solid rgba(212,175,55,0.2)", color: "rgba(255,255,255,0.45)" }}
          >
            © {new Date().getFullYear()} Event-Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
