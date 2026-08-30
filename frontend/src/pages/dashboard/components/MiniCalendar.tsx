import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MiniCalendar = ({
  events,
  selectedDate,
  onSelect,
}: {
  events: { startTime: string }[];
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) => {
  const [view, setView] = useState(new Date());
  const year = view.getFullYear();
  const month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDays = new Set(
    events
      .filter((e) => {
        const d = new Date(e.startTime);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.startTime).getDate())
  );

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-sm">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setView(new Date(year, month - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => setView(new Date(year, month + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
          <div key={i} className="text-center text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center h-8">
            {day ? (
              <button
                onClick={() => onSelect(new Date(year, month, day))}
                className={cn(
                  "w-8 h-8 flex flex-col items-center justify-center rounded-md text-xs relative transition-all",
                  isSelected(day) && "bg-primary text-primary-foreground font-medium",
                  isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground font-medium",
                  !isSelected(day) && !isToday(day) && "hover:bg-muted"
                )}
              >
                {day}
                {eventDays.has(day) && !isSelected(day) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
