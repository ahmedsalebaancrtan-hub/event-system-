import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, CheckCircle, Clock, MapPin, Activity,
  ChevronLeft, ChevronRight, FolderOpen
} from "lucide-react";
import { useUserStore } from "../../store/user-store";
import { useEventStore } from "../../store/event-store";
import { useRegisterStore } from "../../store/register-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================
// Skeleton Loader
// ============================================================
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-muted", className)} />
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

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-sm">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setView(new Date(year, month - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setView(new Date(year, month + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day ? (
              <button
                onClick={() => onSelect(new Date(year, month, day))}
                className={cn(
                  "w-8 h-8 flex flex-col items-center justify-center rounded-md text-xs relative transition-all",
                  isSelected(day) && "bg-primary text-primary-foreground font-medium",
                  isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground font-medium",
                  !isSelected(day) && !isToday(day) && "hover:bg-muted"
                )}
              >
                {day}
                {eventDays.has(day) && !isSelected(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
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
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="20" />
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
              style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "all 0.6s ease" }}
            />
          ))}
          <text x={cx} y={cy - 6} textAnchor="middle" fill="currentColor" fontSize="22" fontWeight="bold">
            {total}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">
            Events
          </text>
        </svg>
      </div>
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <p className="text-sm font-medium">{s.label}</p>
            </div>
            <p className="text-sm text-muted-foreground">{s.value}</p>
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

  useEffect(() => {
    fetchEvents();
    if (user?.id) fetchMyRegisteredEvents(user.id);
  }, [fetchEvents, fetchMyRegisteredEvents, user?.id]);

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

  const upcomingEvents = useMemo(() =>
    [...events]
      .filter(e => new Date(e.startTime) >= new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 6),
    [events]
  );

  const eventsOnDay = useMemo(() =>
    events.filter(e => {
      const d = new Date(e.startTime);
      return d.toDateString() === selectedDate.toDateString();
    }),
    [events, selectedDate]
  );

  const donutData = [
    { label: "Conference", value: stats.conferences, color: "hsl(var(--foreground))" },
    { label: "Workshop", value: stats.workshops, color: "hsl(var(--muted-foreground))" },
    { label: "Seminar", value: stats.seminars, color: "hsl(var(--border))" },
  ];

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">Approved</Badge>;
    if (status === "pending") return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">Pending</Badge>;
    return <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">Rejected</Badge>;
  };

  return (
    <div className="flex-1 space-y-4">
      {/* ─── HEADER ─── */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your event management metrics.
        </p>
      </div>

      {/* ─── STAT CARDS ROW ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {eventsLoading ? (
          Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          <>
            {/* Total Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            {/* Approved Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            {/* Pending / Registrations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {isAdmin ? "Pending Events" : "My Registrations"}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isAdmin ? stats.pending : stats.registrations}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Requires review" : "Active enrollments"}
                </p>
              </CardContent>
            </Card>

            {/* Total Capacity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Seats Available</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCapacity.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last week
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ─── MAIN TWO-COLUMN CONTENT ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* ─── LEFT PANEL (4 cols) ─── */}
        <div className="col-span-4 space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-4">{Array(4).fill(null).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No upcoming events.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <Link to={`/dashboard/directories/${e.id}`} className="font-medium hover:underline">
                          {e.title}
                        </Link>
                        <div className="flex items-center text-xs text-muted-foreground gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {e.location}
                          </span>
                        </div>
                      </div>
                      <div>{statusBadge(e.status)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT PANEL (3 cols) ─── */}
        <div className="col-span-3 space-y-4">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniCalendar events={events} selectedDate={selectedDate} onSelect={setSelectedDate} />
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-3">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                {eventsOnDay.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events on this date.</p>
                ) : (
                  <div className="space-y-3">
                    {eventsOnDay.map(e => (
                      <div key={e.id} className="flex flex-col space-y-1">
                        <Link to={`/dashboard/directories/${e.id}`} className="text-sm font-medium hover:underline truncate">
                          {e.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Categories Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Event Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex justify-center"><Skeleton className="h-32 w-32 rounded-full" /></div>
              ) : (
                <div className="flex justify-center py-2">
                  <DonutChart data={donutData} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
