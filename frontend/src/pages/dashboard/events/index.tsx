import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Calendar as CalendarIcon, Users, AlertCircle } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const EventList = () => {
  const { user } = useUserStore();
  const { events, isLoading, error, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const canCreate = user?.role === "ADMIN" || user?.role === "ORGANIZER";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Directories</h1>
          <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground text-sm mt-1">Browse and manage all registered events in the system.</p>
        </div>

        {canCreate && (
          <Button id="create-event-btn" asChild className="gap-2 rounded-xl">
            <Link to="/dashboard/directories/create">
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && !error ? (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/8 bg-muted/60">
              <CalendarIcon className="w-10 h-10 text-primary/60" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">No events found</h3>
            <p className="text-muted-foreground mt-2">There are currently no events registered in the system.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/dashboard/directories/${event.id}`}
              className="group bg-card overflow-hidden rounded-2xl border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full relative"
            >
              {/* Image / Fallback Header */}
              <div className="relative h-56 w-full overflow-hidden shrink-0">
                {event.imgUrl ? (
                  <>
                    <img
                      src={event.imgUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700">
                    <div className="absolute w-40 h-40 rounded-full border border-white/10 -top-10 -right-10" />
                    <div className="absolute w-60 h-60 rounded-full border border-white/5 -bottom-20 -left-20" />
                    <CalendarIcon className="w-14 h-14 relative z-10 drop-shadow-lg text-primary/70" />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-4 right-4 z-20">
                  <Badge
                    variant={
                      event.status === "approved" ? "success" :
                      event.status === "rejected" ? "destructive" : "warning"
                    }
                    className="text-[10px] uppercase tracking-wide backdrop-blur-sm"
                  >
                    {event.status}
                  </Badge>
                </div>

                {/* Type badge */}
                <div className="absolute top-4 left-4 z-20">
                  <Badge variant="secondary" className="backdrop-blur-md bg-black/60 text-yellow-300 border-0 text-[10px] font-bold">
                    {event.type}
                  </Badge>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 z-20 bg-gradient-to-r from-primary to-primary/50" />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4 line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <CalendarIcon className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <MapPin className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                    <Users className="w-4 h-4 mr-3 text-primary/60 shrink-0" />
                    {event.capacity} Attendees
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
