import { useEffect, useState } from "react";
import { Calendar, MapPin, Sparkles, AlertCircle } from "lucide-react";
import { publicApi } from "../../lib/api";
import { RegistrationModal } from "../../components/RegistrationModal";
import type { AppEvent } from "../../types/event";

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
      <section
        id="about"
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, var(--plum-dark) 0%, var(--plum) 45%, var(--magenta-dark) 100%)" }}
      >
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: "rgba(189,3,166,0.18)" }} />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"
          style={{ background: "rgba(212,175,55,0.08)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4" style={{ color: "var(--gold-light)" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--gold-light)" }}>
                Premium Event Portal
              </span>
            </div>
            <h1 className="font-luxury text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Discover Events Worth <span style={{ color: "var(--gold-light)" }}>Attending</span>
            </h1>
            <p className="text-base md:text-lg leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.7)" }}>
              Browse approved seminars, workshops, and conferences. Register in seconds — our team will review your application and notify you by email.
            </p>
          </div>
        </div>
      </section>

      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="mb-10">
          <h2 className="font-luxury text-3xl md:text-4xl font-bold" style={{ color: "var(--plum)" }}>
            Upcoming Events
          </h2>
          <div className="h-0.5 w-16 mt-2" style={{ background: "linear-gradient(90deg, var(--gold), var(--magenta))" }} />
          <p className="text-gray-500 mt-3">All events listed here are open for public registration.</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: "var(--magenta)" }} />
          </div>
        )}

        {error && !isLoading && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div
            className="text-center py-20 bg-white rounded-2xl"
            style={{ border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 2px 12px rgba(74,0,78,0.07)" }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--magenta)", opacity: 0.6 }} />
            <h3 className="font-luxury text-2xl font-semibold" style={{ color: "var(--plum)" }}>
              No events available
            </h3>
            <p className="text-gray-500 mt-2">Check back soon for new seminars, workshops, and conferences.</p>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <article
                key={event.id}
                className="group bg-white overflow-hidden transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col h-full"
                style={{
                  borderRadius: "24px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  boxShadow: "0 8px 32px rgba(74,0,78,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 16px 48px rgba(189,3,166,0.15)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(74,0,78,0.06)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)";
                }}
              >
                <div className="relative h-56 w-full overflow-hidden shrink-0">
                  {event.imgUrl ? (
                    <>
                      <img
                        src={event.imgUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(54,1,58,0.8)] to-transparent opacity-80" />
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--plum-dark), var(--magenta))" }}
                    >
                      <Calendar className="w-14 h-14" style={{ color: "var(--gold)" }} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm"
                      style={{ background: "rgba(54,1,58,0.82)", color: "var(--gold-light)" }}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-luxury text-xl font-bold mb-3 line-clamp-2" style={{ color: "var(--plum)" }}>
                    {event.title}
                  </h3>

                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 shrink-0" style={{ color: "var(--gold)" }} />
                      {new Date(event.startTime).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 shrink-0" style={{ color: "var(--gold)" }} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(212,175,55,0.2)" }}>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, var(--plum), var(--magenta))",
                        boxShadow: "0 4px 15px rgba(189,3,166,0.25)",
                      }}
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
};
