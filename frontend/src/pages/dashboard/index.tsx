import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock, MapPin,
  TrendingUp, TrendingDown, Download
} from "lucide-react";
import { useUserStore } from "../../store/user-store";
import { useEventStore } from "../../store/event-store";
import { useRegisterStore } from "../../store/register-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MiniCalendar } from "./components/MiniCalendar";
import { DonutChart } from "./components/DonutChart";
import { downloadCSV, downloadPDF, isoDate, titleCase, capitalize, slugify } from "../../lib/export-utils";



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

  const exportSummaryCSV = () => {
    const headers = ["Title", "Event Type", "Status", "Total Capacity", "Location", "Start Date", "End Date"];
    const rows = events.map((e) => [
      e.title,
      titleCase(e.type),
      capitalize(e.status),
      e.capacity,
      e.location,
      new Date(e.startTime).toLocaleDateString("en-GB"),
      new Date(e.endTime).toLocaleDateString("en-GB"),
    ]);
    downloadCSV(headers, rows, `Event_Report_${isoDate()}.csv`);
  };

  const exportSummaryPDF = () => {
    downloadPDF({
      title: "Event Summary Report",
      subtitle: `All events as of ${new Date().toLocaleDateString("en-GB")}`,
      generatedBy: user?.name,
      summaryItems: [
        { label: "Total Events", value: stats.total },
        { label: "Approved", value: stats.approved },
        { label: "Pending Review", value: stats.pending },
        { label: "Total Capacity", value: stats.totalCapacity },
      ],
      columns: [
        { header: "Title",         dataKey: "title" },
        { header: "Event Type",    dataKey: "type" },
        { header: "Status",        dataKey: "status" },
        { header: "Capacity",      dataKey: "capacity" },
        { header: "Location",      dataKey: "location" },
        { header: "Start Date",    dataKey: "startDate" },
        { header: "End Date",      dataKey: "endDate" },
      ],
      rows: events.map((e) => ({
        title:     e.title,
        type:      titleCase(e.type),
        status:    capitalize(e.status),
        capacity:  e.capacity,
        location:  e.location,
        startDate: new Date(e.startTime).toLocaleDateString("en-GB"),
        endDate:   new Date(e.endTime).toLocaleDateString("en-GB"),
      })),
      filename: `Event_Report_${isoDate()}.pdf`,
    });
  };

  return (
    <div className="flex-1 space-y-4">
      {/* ─── HEADER ─── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your event management metrics.
          </p>
        </div>
        {isAdmin && events.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="export-summary-csv-btn"
              onClick={exportSummaryCSV}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors text-foreground"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              id="export-summary-pdf-btn"
              onClick={exportSummaryPDF}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        )}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 text-foreground border-border/50">
                  <TrendingUp className="h-3 w-3" /> +20.1%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{stats.total}</div>
                <div className="mt-4 text-sm font-medium text-foreground flex items-center gap-2">
                  Trending up this month <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total active event records
                </p>
              </CardContent>
            </Card>

            {/* Approved Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approved Events</CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 text-foreground border-border/50">
                  <TrendingUp className="h-3 w-3" /> +15.0%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{stats.approved}</div>
                <div className="mt-4 text-sm font-medium text-foreground flex items-center gap-2">
                  Fast approval rate <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully reviewed events
                </p>
              </CardContent>
            </Card>

            {/* Pending / Registrations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {isAdmin ? "Pending Events" : "My Registrations"}
                </CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 text-foreground border-border/50">
                  <TrendingDown className="h-3 w-3" /> -5.2%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">
                  {isAdmin ? stats.pending : stats.registrations}
                </div>
                <div className="mt-4 text-sm font-medium text-foreground flex items-center gap-2">
                  {isAdmin ? "Fewer pending than usual" : "Consistent enrollments"} <TrendingDown className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin ? "Requires review" : "Active enrollments"}
                </p>
              </CardContent>
            </Card>

            {/* Total Capacity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Seats Available</CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1 text-foreground border-border/50">
                  <TrendingUp className="h-3 w-3" /> +12.5%
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold tracking-tight text-foreground">{stats.totalCapacity.toLocaleString()}</div>
                <div className="mt-4 text-sm font-medium text-foreground flex items-center gap-2">
                  Capacity expanding <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
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
