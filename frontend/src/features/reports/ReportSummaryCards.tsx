import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar as CalendarIcon,
  CheckCircle,
  Percent,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FilterContext, BasicEvent } from "../../types/report";

interface ReportSummaryCardsProps {
  filterContext: FilterContext;
  eventList: BasicEvent[];
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
}

function StatCard({ label, value, icon: Icon }: StatCard) {
  return (
    <Card className="bg-card">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportSummaryCards({
  filterContext,
  eventList,
}: ReportSummaryCardsProps) {
  let items: StatCard[] = [];

  if (filterContext.type === "performance") {
    items = [
      {
        label: "Total Events",
        value: filterContext.total_events ?? 0,
        icon: CalendarIcon,
      },
      {
        label: "Registrations",
        value: filterContext.total_registrations ?? 0,
        icon: Users,
      },
      {
        label: "Avg Fill Rate",
        value: `${(filterContext.average_fill_rate ?? 0).toFixed(1)}%`,
        icon: Percent,
      },
      {
        label: "Near Capacity",
        value: filterContext.events_near_capacity ?? 0,
        icon: AlertCircle,
      },
    ];
  } else if (filterContext.type === "trends") {
    items = [
      {
        label: "Total Registrations",
        value: filterContext.total_registrations ?? 0,
        icon: Users,
      },
      {
        label: "Total Events",
        value: filterContext.total_events ?? 0,
        icon: CalendarIcon,
      },
      {
        label: "Avg Regs/Event",
        value: (filterContext.avg_reg_per_event ?? 0).toFixed(1),
        icon: Activity,
      },
      {
        label: "Peak Period",
        value: filterContext.most_popular_event ?? "N/A",
        icon: BarChart3,
      },
    ];
  } else if (filterContext.type === "details") {
    const selectedEvent = eventList.find((e) => e.id === filterContext.event_id);
    const capacity = selectedEvent?.capacity ?? 0;
    const regs = filterContext.total_registrations ?? 0;
    const avail = Math.max(0, capacity - regs);
    const fill = capacity > 0 ? ((regs / capacity) * 100).toFixed(1) : "0.0";

    items = [
      { label: "Capacity", value: capacity, icon: Users },
      { label: "Registrations", value: regs, icon: CheckCircle },
      { label: "Available Seats", value: avail, icon: AlertCircle },
      { label: "Fill Rate", value: `${fill}%`, icon: Percent },
    ];
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
}
