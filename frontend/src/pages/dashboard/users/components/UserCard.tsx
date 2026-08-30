import { useState } from "react";
import { Shield, Mail, Calendar, MoreVertical, Key } from "lucide-react";
import type { User } from "@/types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const RoleBadge = ({ role }: { role: string }) => {
  let variant: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" = "default";
  
  if (role === "ADMIN") variant = "default"; // or whatever matches your theme
  else if (role === "ORGANIZER") variant = "warning";
  else if (role === "STAFF") variant = "secondary";
  
  return (
    <Badge variant={variant} className="text-[10px] font-bold uppercase tracking-wider gap-1">
      <Shield className="w-3 h-3" />
      {role}
    </Badge>
  );
};

export const UserCard = ({
  user,
  onReset,
}: {
  user: User;
  onReset: (u: User) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Card className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <Avatar className="w-12 h-12 border shadow-sm shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-semibold text-sm text-foreground">{user.name}</p>
            <RoleBadge role={user.role} />
            {user.Is2faenabled && (
              <Badge variant="success" className="text-[10px] gap-1">
                <Shield className="w-3 h-3" /> 2FA
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Joined {user.Createdat ? new Date(user.Createdat).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(v => !v)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-44 bg-card rounded-md border shadow-md py-1">
                <button
                  onClick={() => { onReset(user); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted text-foreground transition-colors text-left"
                >
                  <Key className="w-4 h-4 text-primary" />
                  Reset Password
                </button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
