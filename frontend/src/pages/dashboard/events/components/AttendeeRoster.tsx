import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Attendee {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const AttendeeRoster = ({
  attendees,
  capacity,
}: {
  attendees: Attendee[];
  capacity: number;
}) => {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground">Registered Attendees</h3>
            <div className="h-1 w-12 mt-2 rounded-full bg-gradient-to-r from-primary to-primary/40" />
          </div>
          <Badge variant="outline" className="px-3 py-1 font-semibold text-sm">
            {attendees.length} / {capacity} Filled
          </Badge>
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
                        {attendee.role}
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
