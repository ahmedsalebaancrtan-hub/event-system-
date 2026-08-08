import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Users, TrendingUp, CheckCircle, Clock, MapPin,
  Plus, ArrowRight, BarChart3, Star, Activity, Zap,
  ChevronLeft, ChevronRight, FolderOpen
} from "lucide-react";
import { useUserStore } from "../../store/user-store";
import { useEventStore } from "../../store/event-store";
import { useRegisterStore } from "../../store/register-store";

// ============================================================
// Skeleton Loader
// ============================================================
const Skeleton = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: 'linear-gradient(90deg, rgba(74,0,78,0.06), rgba(189,3,166,0.05), rgba(74,0,78,0.06))', backgroundSize: '200% 100%', ...style }}
  />
);

// ============================================================
// Tiny Mini-Calendar Widget
// ============================================================
const MiniCalendar = ({
  events,
  selectedDate,
  onSelect,
}: {
  events: { startTime: string }[];
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) => {
  const [view, setView] = useState(new Date());
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDays = new Set(
    events
      .filter((e) => {
        const d = new Date(e.startTime);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.startTime).getDate())
  );

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setView(new Date(year, month - 1))} className="p-1 rounded-lg transition-colors hover:bg-purple-50">
          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--plum)' }} />
        </button>
        <span className="font-semibold text-sm" style={{ color: 'var(--plum)' }}>
          {monthNames[month]} {year}
        </span>
        <button onClick={() => setView(new Date(year, month + 1))} className="p-1 rounded-lg transition-colors hover:bg-purple-50">
          <ChevronRight className="w-4 h-4" style={{ color: 'var(--plum)' }} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold" style={{ color: 'rgba(74,0,78,0.35)' }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day ? (
              <button
                onClick={() => onSelect(new Date(year, month, day))}
                className="w-8 h-8 flex flex-col items-center justify-center rounded-full text-xs font-semibold relative transition-all duration-200"
                style={isSelected(day) ? {
                  background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                  color: 'white',
                  boxShadow: '0 4px 10px rgba(189,3,166,0.35)'
                } : isToday(day) ? {
                  background: 'rgba(212,175,55,0.15)',
                  color: 'var(--plum)',
                  border: '1px solid rgba(212,175,55,0.4)'
                } : { color: 'var(--plum)' }}
              >
                {day}
                {eventDays.has(day) && !isSelected(day) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--magenta)' }} />
                )}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Donut Chart (Pure SVG)
// ============================================================
const DonutChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  const segments = data.map((d) => {
    const pct = d.value / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -cumulative * circumference;
    cumulative += pct;
    return { ...d, dashArray, dashOffset, pct };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(74,0,78,0.06)" strokeWidth="20" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.6s ease' }}
            />
          ))}
          {/* Center label */}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--plum)" fontSize="22" fontWeight="bold" fontFamily="Playfair Display, serif">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(74,0,78,0.45)" fontSize="9" fontFamily="Poppins, sans-serif">
            TOTAL
          </text>
        </svg>
      </div>
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }}></div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--plum)' }}>{s.label}</p>
              <p className="text-xs" style={{ color: 'rgba(74,0,78,0.5)' }}>
                {s.value} ({Math.round(s.pct * 100)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Main Dashboard Component
// ============================================================
export const Dashboard = () => {
  const { user } = useUserStore();
  const { events, isLoading: eventsLoading, fetchEvents } = useEventStore();
  const { myRegisteredEvents, fetchMyRegisteredEvents } = useRegisterStore();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const isAdmin = user?.role === "ADMIN";
  const isOrganizer = user?.role === "ORGANIZER";

  useEffect(() => {
    fetchEvents();
    if (user?.id) fetchMyRegisteredEvents(user.id);
  }, [fetchEvents, fetchMyRegisteredEvents, user?.id]);

  // Derived analytics
  const stats = useMemo(() => ({
    total: events.length,
    approved: events.filter(e => e.status === "approved").length,
    pending: events.filter(e => e.status === "pending").length,
    rejected: events.filter(e => e.status === "rejected").length,
    totalCapacity: events.reduce((s, e) => s + e.capacity, 0),
    conferences: events.filter(e => e.type === "CONFERENCE").length,
    workshops: events.filter(e => e.type === "WORKSHOP").length,
    seminars: events.filter(e => e.type === "SEMINAR").length,
    registrations: myRegisteredEvents.length,
  }), [events, myRegisteredEvents]);

  // Upcoming events sorted by date (next 5)
  const upcomingEvents = useMemo(() =>
    [...events]
      .filter(e => new Date(e.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6),
    [events]
  );

  // Events on selected calendar date
  const eventsOnDay = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.startTime);
      return d.toDateString() === selectedDate.toDateString();
    }),
    [events, selectedDate]
  );

  const donutData = [
    { label: "Conference", value: stats.conferences, color: 'var(--magenta)' },
    { label: "Workshop", value: stats.workshops, color: 'var(--gold)' },
    { label: "Seminar", value: stats.seminars, color: 'var(--plum)' },
  ];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good Morning" : greetingHour < 18 ? "Good Afternoon" : "Good Evening";

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid rgba(212,175,55,0.22)',
    boxShadow: '0 2px 16px rgba(74,0,78,0.07)',
  };

  return (
    <div className="space-y-8">

      {/* ─── GREETING BANNER ─── */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white"
        style={{ background: `linear-gradient(135deg, var(--plum-dark) 0%, var(--plum) 50%, var(--magenta-dark) 100%)` }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(212,175,55,0.1)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'rgba(189,3,166,0.2)', transform: 'translate(-50%, 50%)' }} />
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 fill-current" style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold-light)' }}>
                Event-Management Dashboard
              </span>
            </div>
            <h1 className="font-luxury text-3xl md:text-4xl font-bold text-white">
              {greeting}, {user?.name?.split(" ")[0] ?? "there"}!
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending</p>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(189,3,166,0.2)', border: '1px solid rgba(189,3,166,0.3)' }}>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Approved</p>
            </div>
            <div className="px-4 py-2 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── STAT CARDS ROW ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {eventsLoading ? (
          Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            {/* Total Events */}
            <Link to="/dashboard/directories"
              className="group p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ ...cardStyle }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(189,3,166,0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(74,0,78,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.22)';
              }}>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(74,0,78,0.1), rgba(189,3,166,0.08))' }}>
                  <FolderOpen className="w-6 h-6" style={{ color: 'var(--magenta)' }} />
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--magenta)' }} />
              </div>
              <div>
                <p className="text-3xl font-bold font-luxury" style={{ color: 'var(--plum)' }}>{stats.total}</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(74,0,78,0.5)' }}>Total Events</p>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'linear-gradient(90deg, var(--plum), var(--magenta))', width: `${Math.min(stats.approved / Math.max(stats.total, 1) * 100, 100)}%` }} />
            </Link>

            {/* Total Capacity / Registrations */}
            <div className="p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ ...cardStyle }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(212,175,55,0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(74,0,78,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.22)';
              }}>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(229,169,60,0.1))' }}>
                  <Users className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                  Capacity
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold font-luxury" style={{ color: 'var(--plum)' }}>{stats.totalCapacity.toLocaleString()}</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(74,0,78,0.5)' }}>Total Seats Available</p>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.12)' }}>
                <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-bright))', width: '72%' }} />
              </div>
            </div>

            {/* Registrations */}
            <div className="p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ ...cardStyle }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(189,3,166,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(189,3,166,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(74,0,78,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.22)';
              }}>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(189,3,166,0.1), rgba(189,3,166,0.06))' }}>
                  <Activity className="w-6 h-6" style={{ color: 'var(--magenta)' }} />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(189,3,166,0.08)', color: 'var(--magenta)' }}>
                  {isAdmin ? "System" : "Yours"}
                </span>
              </div>
              <div>
                <p className="text-3xl font-bold font-luxury" style={{ color: 'var(--plum)' }}>
                  {isAdmin ? stats.approved : stats.registrations}
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(74,0,78,0.5)' }}>
                  {isAdmin ? "Approved Events" : "My Registrations"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
                <span className="text-xs font-medium" style={{ color: '#10b981' }}>Active & Running</span>
              </div>
            </div>

            {/* Revenue (Admin) or Quick Stat (Others) */}
            {isAdmin ? (
              <div className="p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
                style={{ ...cardStyle, background: `linear-gradient(135deg, var(--plum-dark), var(--plum))` }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(74,0,78,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(74,0,78,0.07)'}>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <BarChart3 className="w-6 h-6" style={{ color: 'var(--gold-light)' }} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.2)', color: 'var(--gold-light)' }}>
                    Admin
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold font-luxury text-white">{stats.pending}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Awaiting Your Review</p>
                </div>
                <Link to="/dashboard/directories" className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--gold-light)' }}>
                  <Zap className="w-3.5 h-3.5" />
                  Review Pending Events
                </Link>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
                style={{ ...cardStyle }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold font-luxury" style={{ color: 'var(--plum)' }}>{upcomingEvents.length}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(74,0,78,0.5)' }}>Upcoming Events</p>
                </div>
                <Link to="/dashboard/calendar" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--magenta)' }}>
                  View Calendar <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── MAIN TWO-COLUMN CONTENT ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* ─── LEFT PANEL (3 cols) ─── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Mini Calendar + Day Events */}
          <div className="p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Event Calendar</h3>
                <div className="h-0.5 w-10 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
              </div>
              <Link to="/dashboard/calendar" className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: 'var(--magenta)' }}>
                Full View <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <MiniCalendar events={events} selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* Events on selected day */}
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(74,0,78,0.4)' }}>
                {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </p>
              {eventsOnDay.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs" style={{ color: 'rgba(74,0,78,0.35)' }}>No events on this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventsOnDay.map(e => (
                    <Link key={e.id} to={`/dashboard/directories/${e.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200"
                      style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(189,3,166,0.04)'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(74,0,78,0.03)'}>
                      <div className="w-2 h-8 rounded-full shrink-0"
                        style={{ background: e.status === 'approved' ? 'var(--gold)' : e.status === 'pending' ? 'var(--magenta)' : '#ef4444' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--plum)' }}>{e.title}</p>
                        <p className="text-xs" style={{ color: 'rgba(74,0,78,0.5)' }}>
                          {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Table */}
          <div className="p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Upcoming Events</h3>
                <div className="h-0.5 w-10 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
              </div>
              <Link to="/dashboard/directories" className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--magenta)' }}>
                See all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-3">{Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gold)', opacity: 0.4 }} />
                <p className="text-sm" style={{ color: 'rgba(74,0,78,0.4)' }}>No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((e) => (
                  <Link key={e.id} to={`/dashboard/directories/${e.id}`}
                    className="flex items-center gap-4 p-3.5 rounded-xl group transition-all duration-200"
                    style={{ border: '1px solid rgba(212,175,55,0.12)' }}
                    onMouseEnter={ev => {
                      (ev.currentTarget as HTMLElement).style.background = 'rgba(74,0,78,0.03)';
                      (ev.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)';
                    }}
                    onMouseLeave={ev => {
                      (ev.currentTarget as HTMLElement).style.background = 'transparent';
                      (ev.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.12)';
                    }}
                  >
                    {/* Date block */}
                    <div className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold"
                      style={{ background: 'linear-gradient(135deg, rgba(74,0,78,0.08), rgba(189,3,166,0.06))' }}>
                      <span className="text-lg leading-none" style={{ color: 'var(--plum)' }}>
                        {new Date(e.startTime).getDate()}
                      </span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--magenta)' }}>
                        {new Date(e.startTime).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate transition-colors"
                        style={{ color: 'var(--plum)' }}>{e.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(74,0,78,0.5)' }}>
                          <MapPin className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                          {e.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(74,0,78,0.5)' }}>
                          <Clock className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                          {new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
                      style={e.status === 'approved' ? {
                        background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)'
                      } : e.status === 'pending' ? {
                        background: 'rgba(212,175,55,0.12)', color: 'var(--plum)', border: '1px solid rgba(212,175,55,0.3)'
                      } : {
                        background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)'
                      }}>
                      {e.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL (2 cols) ─── */}
        <div className="xl:col-span-2 space-y-6">

          {/* Donut Chart */}
          <div className="p-6" style={cardStyle}>
            <div className="mb-5">
              <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Event Categories</h3>
              <div className="h-0.5 w-10 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
            </div>
            {eventsLoading ? (
              <div className="flex items-center gap-6">
                <Skeleton className="w-36 h-36 rounded-full" style={{ borderRadius: '50%' }} />
                <div className="space-y-3 flex-1">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-6" />)}
                </div>
              </div>
            ) : (
              <DonutChart data={donutData} />
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-6" style={cardStyle}>
            <div className="mb-5">
              <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Quick Actions</h3>
              <div className="h-0.5 w-10 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
            </div>

            <div className="space-y-3">
              {(isAdmin || isOrganizer) && (
                <Link to="/dashboard/directories/create"
                  className="flex items-center gap-4 p-4 rounded-xl w-full transition-all duration-300 hover:-translate-y-0.5 group"
                  style={{
                    background: `linear-gradient(135deg, var(--plum-dark), var(--magenta-dark))`,
                    boxShadow: '0 4px 15px rgba(189,3,166,0.25)',
                    border: '1px solid rgba(212,175,55,0.25)'
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,175,55,0.2)' }}>
                    <Plus className="w-5 h-5" style={{ color: 'var(--gold-light)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-white">Create New Event</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>Set up a new event in the system</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              )}

              <Link to="/dashboard/calendar"
                className="flex items-center gap-4 p-4 rounded-xl w-full transition-all duration-300 hover:-translate-y-0.5 group"
                style={{
                  background: 'rgba(74,0,78,0.03)',
                  border: '1px solid rgba(212,175,55,0.2)'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.2)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <Calendar className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--plum)' }}>Events Calendar</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(74,0,78,0.45)' }}>View monthly schedule</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--magenta)' }} />
              </Link>

              <Link to="/dashboard/registered"
                className="flex items-center gap-4 p-4 rounded-xl w-full transition-all duration-300 hover:-translate-y-0.5 group"
                style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.2)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(189,3,166,0.08)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: 'var(--magenta)' }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--plum)' }}>My Registrations</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(74,0,78,0.45)' }}>{stats.registrations} events joined</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--magenta)' }} />
              </Link>

              <Link to="/dashboard/profile"
                className="flex items-center gap-4 p-4 rounded-xl w-full transition-all duration-300 hover:-translate-y-0.5 group"
                style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.2)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.2)'}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <Star className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--plum)' }}>Profile Settings</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(74,0,78,0.45)' }}>Manage your account</p>
                </div>
                <ArrowRight className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: 'var(--magenta)' }} />
              </Link>
            </div>
          </div>

          {/* Role Badge Card */}
          <div className="p-6 text-center" style={{ ...cardStyle, background: `linear-gradient(135deg, rgba(74,0,78,0.04), rgba(189,3,166,0.03))` }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, boxShadow: '0 6px 20px rgba(189,3,166,0.3)' }}>
              <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <p className="font-luxury text-lg font-bold" style={{ color: 'var(--plum)' }}>{user?.name}</p>
            <span className="inline-block mt-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
              style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--plum)', border: '1px solid rgba(212,175,55,0.3)' }}>
              {user?.role === "ADMIN" ? "System Administrator" : user?.role === "ORGANIZER" ? "Event Organizer" : "Staff Member"}
            </span>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs" style={{ color: 'rgba(74,0,78,0.5)' }}>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }}></div>
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
