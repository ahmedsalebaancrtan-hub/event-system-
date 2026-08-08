import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEventStore } from "../../../store/event-store";

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
          <h1 className="font-luxury text-4xl font-bold" style={{ color: 'var(--plum)' }}>Events Calendar</h1>
          <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
          <p className="text-gray-500 text-sm mt-1">Discover and track upcoming events.</p>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-2xl"
          style={{ background: 'white', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 2px 12px rgba(74,0,78,0.07)' }}>
          <button onClick={goToday}
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
            style={{ color: 'var(--magenta)', background: 'rgba(189,3,166,0.08)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(189,3,166,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(189,3,166,0.08)')}
          >
            Today
          </button>
          <div className="h-6 w-px" style={{ background: 'rgba(212,175,55,0.3)' }}></div>
          <button onClick={prevMonth} className="p-2 rounded-xl transition-colors text-gray-500 hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="w-44 text-center font-bold tracking-wide" style={{ color: 'var(--plum)' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-xl transition-colors text-gray-500 hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl text-red-600 shrink-0" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Calendar */}
      <div className="flex-1 bg-white overflow-hidden flex flex-col min-h-0 relative"
        style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 2px 16px rgba(74,0,78,0.08)' }}>

        {/* Gold top accent */}
        <div className="h-1 shrink-0" style={{ background: 'linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))' }}></div>

        {/* Day headers */}
        <div className="grid grid-cols-7 shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)', background: 'rgba(74,0,78,0.03)' }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--plum)', opacity: 0.6 }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0">
          {calendarDays.map((dayObj, index) => {
            const dayEvents = getEventsForDate(dayObj.date);
            const isLast = index >= 35;
            return (
              <div
                key={index}
                className="min-h-0 p-2 flex flex-col transition-colors"
                style={{
                  borderRight: index % 7 !== 6 ? '1px solid rgba(212,175,55,0.1)' : 'none',
                  borderBottom: !isLast ? '1px solid rgba(212,175,55,0.1)' : 'none',
                  background: !dayObj.isCurrentMonth ? 'rgba(74,0,78,0.015)' : 'transparent'
                }}
              >
                <div className="shrink-0">
                  <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold`}
                    style={isToday(dayObj.date) ? {
                      background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(189,3,166,0.4)'
                    } : {
                      color: !dayObj.isCurrentMonth ? '#d1d5db' : 'var(--plum)',
                    }}>
                    {dayObj.date.getDate()}
                  </span>
                </div>

                <div className="mt-1 flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                  {dayEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/dashboard/directories/${event.id}`}
                      className="block px-2 py-1 text-xs font-semibold rounded-md truncate transition-transform hover:scale-[1.03]"
                      style={{
                        background: event.status === 'approved' ? 'rgba(59,130,246,0.12)' :
                          event.status === 'pending' ? 'rgba(212,175,55,0.15)' :
                          'rgba(239,68,68,0.1)',
                        color: event.status === 'approved' ? '#1d4ed8' :
                          event.status === 'pending' ? 'var(--plum)' :
                          '#dc2626',
                        border: event.status === 'approved' ? '1px solid rgba(59,130,246,0.35)' :
                          event.status === 'pending' ? '1px solid rgba(212,175,55,0.35)' :
                          '1px solid rgba(239,68,68,0.25)'
                      }}
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
          <div className="absolute inset-0 flex items-center justify-center rounded-[24px]"
            style={{ background: 'rgba(250,249,246,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: 'var(--magenta)' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};
