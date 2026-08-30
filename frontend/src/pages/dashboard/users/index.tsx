import { useEffect, useState, useMemo } from "react";
import {
  Users, Search, UserCheck, UserX, RefreshCw, X, AlertCircle
} from "lucide-react";
import { api } from "../../../lib/api";
import type { User } from "../../../types/user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "./components/UserCard";
import { ResetPasswordModal, type ResetModalState } from "./components/ResetPasswordModal";

// ─── Types ────────────────────────────────────────────────────
type Role = "ALL" | "ADMIN" | "ORGANIZER" | "STAFF";

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
