import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useEventStore } from "../../../store/event-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const CalendarView = () => {
  const { events, isLoading, error, fetchEvents } = useEventStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  const isToday = (date: Date) => {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  };

  const getEventsForDate = (date: Date) => events.filter(event => {
    const d = new Date(event.startTime);
    return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
  });

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events Calendar</h1>
          <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          <p className="text-muted-foreground text-sm mt-1">Discover and track upcoming events.</p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-2 py-1.5">
            <Button onClick={goToday} variant="secondary" size="sm" className="rounded-xl">
              Today
            </Button>
            <div className="h-6 w-px bg-border" />
            <Button onClick={prevMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="w-36 text-center font-bold tracking-wide text-foreground">
              {monthNames[month]} {year}
            </span>
            <Button onClick={nextMonth} variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/30 shrink-0">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Calendar */}
      <Card className="flex-1 overflow-hidden flex flex-col min-h-0 relative shadow-sm border-border/60">
        {/* Day headers */}
        <div className="grid grid-cols-7 shrink-0 border-b border-border/60 bg-muted/30">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 bg-card">
          {calendarDays.map((dayObj, index) => {
            const dayEvents = getEventsForDate(dayObj.date);
            const isLastRow = index >= 35;
            const isLastCol = index % 7 === 6;
            return (
              <div
                key={index}
                className={`min-h-0 p-2 flex flex-col transition-colors ${!isLastCol ? 'border-r border-border/40' : ''} ${!isLastRow ? 'border-b border-border/40' : ''} ${!dayObj.isCurrentMonth ? 'bg-muted/10' : ''}`}
              >
                <div className="shrink-0">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday(dayObj.date) ? 'bg-primary text-primary-foreground shadow-sm' : !dayObj.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                    {dayObj.date.getDate()}
                  </span>
                </div>

                <div className="mt-1 flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                  {dayEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/dashboard/directories/${event.id}`}
                      className={`block px-2 py-1 text-xs font-semibold rounded-md truncate transition-transform hover:scale-[1.03] border ${
                        event.status === 'approved' ? 'bg-blue-500/10 text-blue-700 border-blue-500/30' :
                        event.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
                        'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                      title={event.title}
                    >
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {event.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
          </div>
        )}
      </Card>
    </div>
  );
};
