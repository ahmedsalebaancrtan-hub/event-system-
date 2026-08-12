import { useEffect, useState, useMemo } from "react";
import {
  Users, Search, Shield, Mail, Calendar,
  MoreVertical, UserCheck, UserX, Key, RefreshCw, X, CheckCircle, AlertCircle
} from "lucide-react";
import { api } from "../../../lib/api";
import type { User } from "../../../types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────
type Role = "ALL" | "ADMIN" | "ORGANIZER" | "STAFF";

interface ResetModalState {
  open: boolean;
  user: User | null;
}

// ─── Helpers ──────────────────────────────────────────────────
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

const Skeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded-lg bg-muted" />
        <div className="h-3 w-1/2 rounded-lg bg-muted" />
      </div>
    </CardContent>
  </Card>
);

// ─── Reset Password Modal ────────────────────────────────────
const ResetPasswordModal = ({
  state,
  onClose,
}: {
  state: ResetModalState;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (state.user) setEmail(state.user.email);
    setStatus("idle"); setMsg(""); setOtp(""); setNewPassword("");
  }, [state.user]);

  if (!state.user) return null;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setMsg("Password must be at least 6 characters."); setStatus("error"); return; }
    setStatus("loading"); setMsg("");
    try {
      await api.post("/users/reset-password", { email, otp, new_password: newPassword });
      setStatus("success"); setMsg("Password reset successfully!");
    } catch (err: any) {
      setStatus("error"); setMsg(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <Dialog open={state.open} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Resetting password for <span className="font-semibold text-foreground">{state.user.name}</span>
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/10">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="font-semibold text-foreground">Password Reset Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">The user can now log in with the new password.</p>
            <Button onClick={onClose} className="mt-6">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {/* Email (locked) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground border border-input cursor-not-allowed">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{state.user.email}</span>
              </div>
            </div>

            {/* OTP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin OTP / Override Code</label>
              <Input 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                required 
                placeholder="Enter your admin OTP"
              />
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
              <Input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
                minLength={6} 
                placeholder="Min. 6 characters" 
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0" /> {msg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={status === "loading"} className="flex-1">
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ─── User Row Card ────────────────────────────────────────────
const UserCard = ({
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

// ─── Main Page ────────────────────────────────────────────────
export const UsersAndStaff = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role>("ALL");
  const [resetModal, setResetModal] = useState<ResetModalState>({ open: false, user: null });

  const fetchUsers = async () => {
    setIsLoading(true); setError("");
    try {
      const res = await api.get("/users/allusers");
      setUsers(res.data.data || res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() =>
    users.filter(u => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRole && matchSearch;
    }),
    [users, search, roleFilter]
  );

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    organizers: users.filter(u => u.role === "ORGANIZER").length,
    staff: users.filter(u => u.role === "STAFF").length,
    twoFA: users.filter(u => u.Is2faenabled).length,
  }), [users]);

  const ROLE_FILTERS: Role[] = ["ALL", "ADMIN", "ORGANIZER", "STAFF"];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users & Staff</h1>
            <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
            <p className="text-muted-foreground text-sm">Manage all registered users and team members across the system.</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, color: "text-foreground", bg: "bg-muted" },
            { label: "Admins", value: stats.admins, color: "text-primary", bg: "bg-primary/10" },
            { label: "Organizers", value: stats.organizers, color: "text-warning", bg: "bg-warning/10" },
            { label: "Staff Members", value: stats.staff, color: "text-secondary-foreground", bg: "bg-secondary" },
          ].map(({ label, value, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-5 flex flex-col gap-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${bg}`}>
                  <Users className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <Card>
          <CardContent className="flex flex-col sm:flex-row gap-3 p-4">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {ROLE_FILTERS.map(role => (
                <Button 
                  key={role} 
                  variant={roleFilter === role ? "default" : "outline"}
                  onClick={() => setRoleFilter(role)}
                  className="rounded-full text-xs h-9"
                >
                  {role === "ALL" ? `All (${stats.total})` :
                   role === "ADMIN" ? `Admin (${stats.admins})` :
                   role === "ORGANIZER" ? `Organizer (${stats.organizers})` :
                   `Staff (${stats.staff})`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2FA info bar */}
        {!isLoading && stats.twoFA > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-success/10 border border-success/20">
            <UserCheck className="w-5 h-5 text-success shrink-0" />
            <p className="text-sm text-success font-medium">
              <span className="font-bold">{stats.twoFA}</span> of {stats.total} users have Two-Factor Authentication enabled.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/30">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(6).fill(null).map((_, i) => <Skeleton key={i} />)
          ) : filtered.length === 0 ? (
            <Card className="text-center py-20 border-dashed">
              <CardContent>
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-muted">
                  <UserX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No users found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {search ? `No results for "${search}" in ${roleFilter === "ALL" ? "any role" : roleFilter}.` : "No users registered yet."}
                </p>
                {search && (
                  <Button onClick={() => { setSearch(""); setRoleFilter("ALL"); }} className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-muted-foreground">
                Showing {filtered.length} of {users.length} users
              </p>
              {filtered.map(u => (
                <UserCard key={u.id} user={u} onReset={(u) => setResetModal({ open: true, user: u })} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordModal state={resetModal} onClose={() => setResetModal({ open: false, user: null })} />
    </>
  );
};
