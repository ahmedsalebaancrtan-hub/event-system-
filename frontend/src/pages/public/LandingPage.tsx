import { useEffect, useState } from "react";
import { Calendar, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { publicApi } from "../../lib/api";
import { RegistrationModal } from "../../components/RegistrationModal";
import type { AppEvent } from "../../types/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const EventCard = ({ event, onRegister }: { event: AppEvent; onRegister: () => void }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <CardHeader className="p-0 relative">
        <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-muted">
          {event.imgUrl && !imgError ? (
            <img
              src={event.imgUrl}
              alt={event.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
              <Calendar className="w-10 h-10 text-primary/40" />
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/60 text-foreground rounded-md text-xs font-semibold border border-border">
              {event.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col">
        <CardTitle className="font-semibold text-lg line-clamp-2 mb-3">
          {event.title}
        </CardTitle>
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
            {new Date(event.startTime).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 shrink-0 text-muted-foreground" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto">
        <Button
          id={`register-event-${event.id}`}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md py-2"
          onClick={onRegister}
        >
          Register Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export const LandingPage = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await publicApi.get("/public/events");
        setEvents(response.data.data ?? []);
      } catch {
        setError("Unable to load events right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        id="about"
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-primary/20" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none bg-primary/10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                Premium Event Portal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Discover Events Worth{" "}
              <span className="text-primary">Attending</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl text-slate-300">
              Browse approved seminars, workshops, and conferences. Register in seconds — our team will review your application and notify you by email.
            </p>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Upcoming Events
          </h2>
          <div className="h-1 w-16 mt-2 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground mt-3">All events listed here are open for public registration.</p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && events.length === 0 && (
          <Card className="text-center py-20 border-dashed">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-2xl font-semibold text-foreground">
                No events available
              </h3>
              <p className="text-muted-foreground mt-2">
                Check back soon for new seminars, workshops, and conferences.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Event Grid */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onRegister={() => setSelectedEvent(event)} />
            ))}
          </div>
        )}
      </section>

      <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
};
