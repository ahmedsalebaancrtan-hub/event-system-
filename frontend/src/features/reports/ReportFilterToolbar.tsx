import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ReportFilterState,
  ReportType,
  BasicEvent,
} from "../../types/report";

interface ReportFilterToolbarProps {
  filters: ReportFilterState;
  eventList: BasicEvent[];
  isLoading: boolean;
  onFilterChange: (key: keyof ReportFilterState, value: string) => void;
  onGenerate: () => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: new Date(2000, i).toLocaleString("default", { month: "long" }),
}));

export function ReportFilterToolbar({
  filters,
  eventList,
  isLoading,
  onFilterChange,
  onGenerate,
}: ReportFilterToolbarProps) {
  const isDetails = filters.type === "details";
  const isPerformance = filters.type === "performance";
  const hasDateRange = !!filters.startDate || !!filters.endDate;

  const canGenerate =
    !isLoading && !(isDetails && filters.eventId === "0");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          Report Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Row 1: Primary Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Report Type
              </label>
              <Select
                value={filters.type}
                onValueChange={(v: ReportType) => onFilterChange("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Event Performance</SelectItem>
                  <SelectItem value="trends">Registration Trends</SelectItem>
                  <SelectItem value="details">Event Registration Details</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* DETAILS: Event Selector */}
            {isDetails && (
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Event
                </label>
                <Select
                  value={filters.eventId}
                  onValueChange={(v) => onFilterChange("eventId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Select an event...</SelectItem>
                    {eventList.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PERFORMANCE & TRENDS: Category */}
            {!isDetails && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(v) => onFilterChange("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="WORKSHOP">Workshop</SelectItem>
                    <SelectItem value="SEMINAR">Seminar</SelectItem>
                    <SelectItem value="CONFERENCE">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PERFORMANCE & TRENDS: Year */}
            {!isDetails && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Year
                </label>
                <Select
                  value={filters.year}
                  onValueChange={(v) => onFilterChange("year", v)}
                  disabled={hasDateRange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Years</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PERFORMANCE & TRENDS: Month */}
            {!isDetails && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Month
                </label>
                <Select
                  value={filters.month}
                  onValueChange={(v) => onFilterChange("month", v)}
                  disabled={hasDateRange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Months</SelectItem>
                    {MONTHS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* PERFORMANCE: Sort By */}
            {isPerformance && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(v) => onFilterChange("sortBy", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most_registered">Most Registered</SelectItem>
                    <SelectItem value="highest_fill_rate">Highest Fill Rate</SelectItem>
                    <SelectItem value="lowest_fill_rate">Lowest Fill Rate</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Row 2: Custom Date Range + Generate Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => onFilterChange("startDate", e.target.value)}
                  className="w-[160px] text-xs"
                />
              </div>
              <span className="text-sm text-muted-foreground self-end pb-2">
                to
              </span>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => onFilterChange("endDate", e.target.value)}
                  className="w-[160px] text-xs"
                />
              </div>
            </div>

            <Button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="sm:ml-auto w-full sm:w-auto h-10 px-6"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
