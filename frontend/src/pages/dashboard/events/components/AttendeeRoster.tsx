import { useState } from "react";
import { Users, Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { downloadCSV, downloadPDF, isoDate, slugify } from "../../../../lib/export-utils";

interface Attendee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const AttendeeRoster = ({
  attendees,
  capacity,
  eventTitle = "Event",
}: {
  attendees: Attendee[];
  capacity: number;
  eventTitle?: string;
}) => {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Role", "Status"];
    const rows = attendees.map((a) => [
      a.name,
      a.email,
      a.role.charAt(0).toUpperCase() + a.role.slice(1).toLowerCase(),
      "Approved",
    ]);
    downloadCSV(
      headers,
      rows,
      `Attendee_Roster_${slugify(eventTitle)}_${isoDate()}.csv`
    );
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDF({
        title: "Attendee Roster",
        subtitle: `Event: ${eventTitle}`,
        summaryItems: [
          { label: "Total Capacity", value: capacity },
          { label: "Registered Attendees", value: attendees.length },
          { label: "Remaining Seats", value: Math.max(0, capacity - attendees.length) },
          { label: "Fill Rate", value: `${Math.round((attendees.length / capacity) * 100)}%` },
        ],
        columns: [
          { header: "Name",   dataKey: "name" },
          { header: "Email",  dataKey: "email" },
          { header: "Role",   dataKey: "role" },
          { header: "Status", dataKey: "status" },
        ],
        rows: attendees.map((a) => ({
          name:   a.name,
          email:  a.email,
          role:   a.role.charAt(0).toUpperCase() + a.role.slice(1).toLowerCase(),
          status: "Approved",
        })),
        filename: `Attendee_Roster_${slugify(eventTitle)}_${isoDate()}.pdf`,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Registered Attendees</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          </div>
          <div className="flex items-center gap-3">
            {attendees.length > 0 && (
              <>
                <Button
                  id="export-attendees-csv-btn"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  id="export-attendees-pdf-btn"
                  variant="default"
                  onClick={handleExportPDF}
                  disabled={pdfLoading}
                  className="gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  {pdfLoading ? "Generating..." : "Export PDF"}
                </Button>
              </>
            )}
            <Badge variant="outline" className="px-3 py-1 font-semibold text-sm">
              {attendees.length} / {capacity} Filled
            </Badge>
          </div>
        </div>

        {attendees.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-muted/40 border border-dashed border-border/60">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No attendees registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {attendee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{attendee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{attendee.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {attendee.role.charAt(0).toUpperCase() + attendee.role.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="text-xs">
                        Registered
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
