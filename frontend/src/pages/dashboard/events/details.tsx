import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, Clock, Edit, XCircle } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { useEventStore } from "../../../store/event-store";
import { useRegisterStore } from "../../../store/register-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendeeRoster } from "./components/AttendeeRoster";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Card className="text-center py-20 border-dashed">
        <CardContent>
          <p className="text-lg font-semibold text-destructive">{error || "Event not found"}</p>
          <div className="mt-4">
            <Link to="/dashboard/directories" className="text-primary hover:underline">Go back to directories</Link>
          </div>
        </CardContent>
      </Card>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <Link to="/dashboard/directories" className="gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          {canEdit && (
            <Button variant="outline" asChild className="gap-2">
              <Link to={`/dashboard/directories/${eventId}/edit`}>
                <Edit className="w-4 h-4" />
                Edit Event
              </Link>
            </Button>
          )}

          {isAdmin && isPending && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isRejecting || isApproving}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                {isRejecting ? "Rejecting..." : "Reject Event"}
              </Button>
              <Button
                variant="success"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isApproving ? "Approving..." : "Approve Event"}
              </Button>
            </>
          )}

          {event.status === "approved" && (
            <Button
              variant={isRegistered ? "destructive" : "default"}
              onClick={handleRegisterToggle}
              disabled={isRegistering}
              className="gap-2"
            >
              {isRegistering ? "Processing..." : isRegistered ? "Cancel Registration" : "Register Now"}
            </Button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-md h-80 md:h-[400px]">
        {event.imgUrl ? (
          <img src={event.imgUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-primary/80 hover:bg-primary/90 text-white backdrop-blur-md border-0">
              {event.type}
            </Badge>
            <Badge
              variant={
                event.status === "approved" ? "success" :
                event.status === "rejected" ? "destructive" : "warning"
              }
              className="uppercase tracking-wider backdrop-blur-md"
            >
              {event.status}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{event.title}</h1>
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
          <Card key={label} className="overflow-hidden">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
                <p className="font-semibold text-foreground">{primary}</p>
                {secondary && <p className="text-muted-foreground text-sm mt-1">{secondary}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Description */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-2 text-foreground">About This Event</h3>
          <div className="h-1 w-12 mb-6 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {event.description || "No description provided for this event."}
          </div>
          <div className="mt-10 pt-6 flex items-center text-sm text-muted-foreground gap-1 border-t border-border/40">
            <Clock className="w-4 h-4" />
            Created on {new Date(event.createdAt).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      {/* Attendee Roster (Admin/Organizer) */}
      {canEdit && (
        <AttendeeRoster attendees={attendees} capacity={event.capacity} />
      )}
    </div>
  );
};
