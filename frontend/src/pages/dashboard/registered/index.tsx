import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Calendar as CalendarIcon, Users, Ticket } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useRegisterStore } from "../../../store/register-store";

export const RegisteredEvents = () => {
  const { user } = useUserStore();
  const { myRegisteredEvents, isLoading, error, fetchMyRegisteredEvents, cancelRegistration } = useRegisterStore();

  useEffect(() => {
    if (user?.id) {
      fetchMyRegisteredEvents(user.id);
    }
  }, [user?.id, fetchMyRegisteredEvents]);

  const handleCancel = async (e: React.MouseEvent, eventId: number) => {
    e.preventDefault();
    try {
      await cancelRegistration(eventId);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading && myRegisteredEvents.length === 0) {
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
          <h1 className="font-luxury text-4xl font-bold" style={{ color: 'var(--plum)' }}>Registered Events</h1>
          <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
          <p className="text-gray-500 text-sm mt-1">Manage all the events you are currently attending.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-red-600" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {myRegisteredEvents.length === 0 && !error && !isLoading ? (
        <div className="text-center py-20 bg-white rounded-2xl"
          style={{ border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 12px rgba(74,0,78,0.07)' }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(74,0,78,0.06)' }}>
            <Ticket className="w-10 h-10" style={{ color: 'var(--magenta)', opacity: 0.7 }} />
          </div>
          <h3 className="font-luxury text-2xl font-semibold" style={{ color: 'var(--plum)' }}>No registrations found</h3>
          <p className="text-gray-500 mt-2">You haven't registered for any upcoming events yet.</p>
          <Link
            to="/dashboard/directories"
            className="mt-6 inline-block px-6 py-2.5 text-white rounded-full font-medium hover:shadow-lg transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, boxShadow: '0 4px 15px rgba(189,3,166,0.25)' }}
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myRegisteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/dashboard/directories/${event.id}`}
              className="group bg-white overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
              style={{ borderRadius: '20px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 12px rgba(74,0,78,0.07)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(189,3,166,0.18)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(74,0,78,0.07)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.25)';
              }}
            >
              <div className="relative h-48 w-full overflow-hidden shrink-0" style={{ background: '#f3f0f8' }}>
                {event.imgUrl ? (
                  <img src={event.imgUrl} alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(74,0,78,0.12), rgba(189,3,166,0.12))' }}>
                    <CalendarIcon className="w-12 h-12" style={{ color: 'var(--magenta)', opacity: 0.5 }} />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm"
                    style={{ background: 'rgba(54,1,58,0.82)', color: 'var(--gold-light)' }}>
                    {event.type}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-luxury text-xl font-bold mb-3 line-clamp-1" style={{ color: 'var(--plum)' }}>{event.title}</h3>

                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4 mr-2" style={{ color: 'var(--gold)' }} />
                    {new Date(event.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" style={{ color: 'var(--gold)' }} />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" style={{ color: 'var(--gold)' }} />
                    {event.capacity} Attendees
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                  <button
                    onClick={(e) => handleCancel(e, event.id)}
                    className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
                    style={{ color: 'var(--magenta)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(189,3,166,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Cancel Registration
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
