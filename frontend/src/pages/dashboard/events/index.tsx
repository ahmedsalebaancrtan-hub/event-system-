import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin, Calendar as CalendarIcon, Users } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: 'var(--magenta)' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-luxury text-4xl font-bold" style={{ color: 'var(--plum)' }}>Event Directories</h1>
          <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
          <p className="text-gray-500 text-sm mt-1">Browse and manage all registered events in the system.</p>
        </div>

        {canCreate && (
          <Link
            to="/dashboard/directories/create"
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
              boxShadow: '0 4px 15px rgba(189,3,166,0.3)',
              border: '1px solid rgba(212,175,55,0.3)'
            }}
          >
            <Plus className="w-5 h-5" style={{ color: 'var(--gold-light)' }} />
            Create Event
          </Link>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-600" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && !error ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(212,175,55,0.25)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(74,0,78,0.05)' }}>
            <CalendarIcon className="w-10 h-10" style={{ color: 'var(--magenta)' }} />
          </div>
          <h3 className="font-luxury text-2xl font-semibold" style={{ color: 'var(--plum)' }}>No events found</h3>
          <p className="text-gray-500 mt-2">There are currently no events registered in the system.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              to={`/dashboard/directories/${event.id}`}
              className="group bg-white overflow-hidden transition-all duration-500 transform hover:-translate-y-1.5 flex flex-col h-full relative"
              style={{
                borderRadius: '24px',
                border: '1px solid rgba(212,175,55,0.2)',
                boxShadow: '0 8px 32px rgba(74,0,78,0.06)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(189,3,166,0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(74,0,78,0.06)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.2)';
              }}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(54,1,58,0.8)] to-transparent opacity-80" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--plum-dark), var(--magenta))' }}>
                    {/* Decorative rings */}
                    <div className="absolute w-40 h-40 rounded-full border border-white/10 -top-10 -right-10" />
                    <div className="absolute w-60 h-60 rounded-full border border-white/5 -bottom-20 -left-20" />
                    <CalendarIcon className="w-14 h-14 relative z-10 drop-shadow-lg" style={{ color: 'var(--gold)' }} />
                  </div>
                )}

                {/* Status badge */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg text-white border border-white/20"
                    style={{
                      background: event.status === "approved" ? 'rgba(16,185,129,0.8)' :
                        event.status === "rejected" ? 'rgba(239,68,68,0.8)' :
                        `rgba(212,175,55,0.9)`,
                      color: event.status === "pending" ? 'var(--plum)' : 'white'
                    }}>
                    {event.status}
                  </span>
                </div>

                {/* Type badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/10"
                    style={{ background: 'rgba(54,1,58,0.6)', color: 'var(--gold)' }}>
                    {event.type}
                  </span>
                </div>

                {/* Gold separator line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 z-20" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                <h3 className="font-luxury text-2xl font-bold mb-4 line-clamp-1 transition-colors"
                  style={{ color: 'var(--plum)' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--magenta)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--plum)')}>
                  {event.title}
                </h3>

                <div className="space-y-3 mt-auto">
                  <div className="flex items-center text-sm text-gray-600 font-medium bg-[rgba(74,0,78,0.03)] p-2.5 rounded-xl border border-[rgba(212,175,55,0.15)]">
                    <CalendarIcon className="w-4 h-4 mr-3" style={{ color: 'var(--magenta)' }} />
                    {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-medium bg-[rgba(74,0,78,0.03)] p-2.5 rounded-xl border border-[rgba(212,175,55,0.15)]">
                    <MapPin className="w-4 h-4 mr-3" style={{ color: 'var(--magenta)' }} />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 font-medium bg-[rgba(74,0,78,0.03)] p-2.5 rounded-xl border border-[rgba(212,175,55,0.15)]">
                    <Users className="w-4 h-4 mr-3" style={{ color: 'var(--magenta)' }} />
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
