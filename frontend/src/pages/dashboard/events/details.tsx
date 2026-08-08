import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, Clock, Edit, XCircle } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";
import { useRegisterStore } from "../../../store/register-store";

export const EventDetails = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const { user } = useUserStore();
  const { selectedEvent: event, isLoading, error, fetchEventDetails, approveEvent, rejectEvent } = useEventStore();
  const {
    myRegisteredEvents, registerToEvent, cancelRegistration, fetchMyRegisteredEvents,
    attendees, fetchEventAttendees
  } = useRegisterStore();

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
      fetchEventAttendees(Number(eventId));
    }
  }, [eventId, fetchEventDetails, fetchEventAttendees]);

  useEffect(() => {
    if (user?.id) {
      fetchMyRegisteredEvents(user.id);
    }
  }, [user?.id, fetchMyRegisteredEvents]);

  const handleApprove = async () => {
    if (!eventId) return;
    setIsApproving(true);
    try {
      await approveEvent(eventId);
    } catch (err: any) {
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!eventId) return;
    setIsRejecting(true);
    try {
      await rejectEvent(eventId);
    } catch (err: any) {
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: 'var(--magenta)' }}></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(212,175,55,0.25)' }}>
        <p style={{ color: 'var(--magenta)' }} className="text-lg font-semibold">{error || "Event not found"}</p>
        <div className="mt-4">
          <Link to="/dashboard/directories" style={{ color: 'var(--plum)' }} className="hover:underline">Go back to directories</Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "ADMIN";
  const canEdit = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const isPending = event.status === "pending";
  const isRegistered = myRegisteredEvents.some(e => e.id === Number(eventId));

  const handleRegisterToggle = async () => {
    if (!eventId) return;
    setIsRegistering(true);
    try {
      if (isRegistered) {
        await cancelRegistration(Number(eventId));
      } else {
        await registerToEvent(Number(eventId));
        if (user?.id) fetchMyRegisteredEvents(user.id);
        fetchEventAttendees(Number(eventId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/directories"
          className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
          style={{ color: 'var(--plum)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Link
              to={`/dashboard/directories/${eventId}/edit`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300"
              style={{
                background: 'white',
                color: 'var(--plum)',
                border: '1px solid rgba(212,175,55,0.4)'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
                (e.currentTarget as HTMLElement).style.color = 'var(--magenta)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.4)';
                (e.currentTarget as HTMLElement).style.color = 'var(--plum)';
              }}
            >
              <Edit className="w-5 h-5" />
              Edit Event
            </Link>
          )}

          {isAdmin && isPending && (
            <>
              <button
                onClick={handleReject}
                disabled={isRejecting || isApproving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 disabled:opacity-70 hover:scale-105"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: '#dc2626',
                  border: '1px solid rgba(239,68,68,0.3)'
                }}
              >
                <XCircle className="w-5 h-5" />
                {isRejecting ? "Rejecting..." : "Reject Event"}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white hover:scale-105 transition-all duration-300 disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 14px rgba(16,185,129,0.35)' }}
              >
                <CheckCircle className="w-5 h-5" />
                {isApproving ? "Approving..." : "Approve Event"}
              </button>
            </>
          )}

          {event.status === "approved" && (
            <button
              onClick={handleRegisterToggle}
              disabled={isRegistering}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium hover:scale-105 transition-all duration-300 disabled:opacity-70"
              style={isRegistered ? {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              } : {
                background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                color: 'white',
                boxShadow: '0 4px 15px rgba(189,3,166,0.3)',
                border: '1px solid rgba(212,175,55,0.3)'
              }}
            >
              {isRegistering ? "Processing..." : isRegistered ? "Cancel Registration" : "Register Now"}
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[400px]">
        {event.imgUrl ? (
          <img src={event.imgUrl} alt={event.title} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, var(--plum-dark), var(--magenta))` }}></div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(54,1,58,0.95), rgba(74,0,78,0.4), transparent)' }}></div>

        {/* Gold bottom line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}></div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white backdrop-blur-md"
              style={{ background: 'rgba(189,3,166,0.75)', border: '1px solid rgba(212,175,55,0.4)' }}>
              {event.type}
            </span>
            <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-md"
              style={{
                background: event.status === "approved" ? 'rgba(16,185,129,0.8)' :
                  event.status === "rejected" ? 'rgba(239,68,68,0.8)' : `rgba(212,175,55,0.85)`,
                color: event.status === "pending" ? 'var(--plum)' : 'white'
              }}>
              {event.status}
            </span>
          </div>
          <h1 className="font-luxury text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{event.title}</h1>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Calendar, label: "Date & Time",
            primary: new Date(event.startTime).toLocaleString(),
            secondary: `to ${new Date(event.endTime).toLocaleString()}`
          },
          { icon: MapPin, label: "Location", primary: event.location },
          { icon: Users, label: "Capacity", primary: `${event.capacity} Attendees` }
        ].map(({ icon: Icon, label, primary, secondary }) => (
          <div key={label} className="p-6 flex items-start gap-4 bg-white"
            style={{ borderRadius: '20px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 12px rgba(74,0,78,0.06)' }}>
            <div className="p-3 rounded-xl shrink-0" style={{ background: 'rgba(74,0,78,0.07)' }}>
              <Icon className="w-6 h-6" style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
              <p className="font-semibold" style={{ color: 'var(--plum)' }}>{primary}</p>
              {secondary && <p className="text-gray-500 text-sm mt-1">{secondary}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="bg-white p-8" style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 12px rgba(74,0,78,0.06)' }}>
        <h3 className="font-luxury text-2xl font-bold mb-2" style={{ color: 'var(--plum)' }}>About This Event</h3>
        <div className="h-0.5 w-12 mb-6" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
        <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
          {event.description || "No description provided for this event."}
        </div>
        <div className="mt-10 pt-6 flex items-center text-sm text-gray-400 gap-1"
          style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <Clock className="w-4 h-4" />
          Created on {new Date(event.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Attendee Roster (Admin/Organizer) */}
      {canEdit && (
        <div className="bg-white p-8" style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 12px rgba(74,0,78,0.06)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-luxury text-2xl font-bold" style={{ color: 'var(--plum)' }}>Registered Attendees</h3>
            <span className="px-3 py-1 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(74,0,78,0.07)', color: 'var(--plum)', border: '1px solid rgba(74,0,78,0.15)' }}>
              {attendees.length} / {event.capacity} Filled
            </span>
          </div>
          <div className="h-0.5 w-12 mb-6" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>

          {attendees.length === 0 ? (
            <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(74,0,78,0.03)', border: '1px dashed rgba(212,175,55,0.3)' }}>
              <Users className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--gold)', opacity: 0.5 }} />
              <p className="font-medium" style={{ color: 'var(--plum)', opacity: 0.5 }}>No attendees registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--plum)', opacity: 0.5 }}>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-t transition-colors"
                      style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))` }}>
                            {attendee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: 'var(--plum)' }}>{attendee.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">{attendee.email}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--plum)', border: '1px solid rgba(212,175,55,0.3)' }}>
                          {attendee.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
                          Registered
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
