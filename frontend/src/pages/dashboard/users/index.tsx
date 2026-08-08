import { useEffect, useState, useMemo } from "react";
import {
  Users, Search, Shield, Mail, Calendar,
  MoreVertical, UserCheck, UserX, Key, RefreshCw, X, CheckCircle, AlertCircle
} from "lucide-react";
import { api } from "../../../lib/api";
import type { User } from "../../../types/user";

// ─── Types ────────────────────────────────────────────────────
type Role = "ALL" | "ADMIN" | "ORGANIZER" | "STAFF";

interface ResetModalState {
  open: boolean;
  user: User | null;
}

// ─── Helpers ──────────────────────────────────────────────────
const roleBadge = (role: string) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    ADMIN: { bg: "rgba(189,3,166,0.1)", color: "var(--magenta)", border: "rgba(189,3,166,0.3)" },
    ORGANIZER: { bg: "rgba(212,175,55,0.12)", color: "var(--plum)", border: "rgba(212,175,55,0.4)" },
    STAFF: { bg: "rgba(59,130,246,0.1)", color: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
  };
  const s = map[role] ?? { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <Shield className="w-3 h-3" />
      {role}
    </span>
  );
};

const Skeleton = () => (
  <div className="animate-pulse p-5 rounded-2xl" style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full" style={{ background: 'rgba(74,0,78,0.08)' }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded-lg" style={{ background: 'rgba(74,0,78,0.08)' }} />
        <div className="h-3 w-1/2 rounded-lg" style={{ background: 'rgba(74,0,78,0.05)' }} />
      </div>
    </div>
  </div>
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

  if (!state.open || !state.user) return null;

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

  const inputStyle = {
    background: 'rgba(74,0,78,0.03)',
    border: '1px solid rgba(212,175,55,0.3)',
    color: 'var(--plum)',
    outline: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(54,1,58,0.55)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md bg-white relative overflow-hidden"
        style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.3)', boxShadow: '0 24px 64px rgba(74,0,78,0.25)' }}>
        {/* Gold top bar */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))' }} />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Reset Password</h3>
              <p className="text-sm mt-1 text-gray-500">
                Resetting password for <span className="font-semibold" style={{ color: 'var(--magenta)' }}>{state.user.name}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {status === "success" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(16,185,129,0.1)' }}>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold" style={{ color: 'var(--plum)' }}>Password Reset Successfully!</p>
              <p className="text-sm text-gray-500 mt-1">The user can now log in with the new password.</p>
              <button onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl text-white font-medium"
                style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))` }}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {/* Email (locked) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--plum)', opacity: 0.55 }}>
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ ...inputStyle, background: 'rgba(74,0,78,0.06)', cursor: 'not-allowed' }}>
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--plum)' }}>{state.user.email}</span>
                </div>
              </div>

              {/* OTP */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--plum)', opacity: 0.55 }}>
                  Admin OTP / Override Code
                </label>
                <input value={otp} onChange={e => setOtp(e.target.value)} required
                  placeholder="Enter your admin OTP"
                  className="block w-full px-4 py-3 text-sm rounded-xl"
                  style={inputStyle}
                  onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
                />
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--plum)', opacity: 0.55 }}>
                  New Password
                </label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                  placeholder="Min. 6 characters"
                  className="block w-full px-4 py-3 text-sm rounded-xl"
                  style={inputStyle}
                  onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                  onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-red-600 text-sm"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" /> {msg}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                  style={{ background: 'rgba(74,0,78,0.05)', color: 'var(--plum)', border: '1px solid rgba(74,0,78,0.12)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={status === "loading"}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white hover:scale-[1.02] transition-all disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, boxShadow: '0 4px 15px rgba(189,3,166,0.3)' }}>
                  {status === "loading" ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
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

  const avatarGradient =
    user.role === "ADMIN" ? "linear-gradient(135deg, var(--plum-dark), var(--magenta))" :
    user.role === "ORGANIZER" ? "linear-gradient(135deg, #92400e, var(--gold))" :
    "linear-gradient(135deg, #1e40af, #3b82f6)";

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-2xl transition-all duration-300 hover:-translate-y-0.5 relative"
      style={{ border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 2px 12px rgba(74,0,78,0.05)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.45)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(74,0,78,0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.2)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(74,0,78,0.05)';
      }}>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0"
        style={{ background: avatarGradient, boxShadow: '0 4px 12px rgba(74,0,78,0.2)' }}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-semibold text-sm" style={{ color: 'var(--plum)' }}>{user.name}</p>
          {roleBadge(user.role)}
          {user.Is2faenabled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
              <Shield className="w-3 h-3" /> 2FA
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Mail className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            {user.email}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            Joined {user.Createdat ? new Date(user.Createdat).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
          style={{ color: 'rgba(74,0,78,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,0,78,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-10 z-20 w-44 bg-white rounded-2xl py-1 shadow-xl"
              style={{ border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 12px 40px rgba(74,0,78,0.15)' }}>
              <button
                onClick={() => { onReset(user); setMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left"
                style={{ color: 'var(--plum)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,0,78,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Key className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                Reset Password
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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

  const cardStyle = {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid rgba(212,175,55,0.22)',
    boxShadow: '0 2px 16px rgba(74,0,78,0.07)',
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-luxury text-4xl font-bold" style={{ color: 'var(--plum)' }}>Users & Staff</h1>
            <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }} />
            <p className="text-gray-500 text-sm">Manage all registered users and team members across the system.</p>
          </div>
          <button onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-105"
            style={{ background: 'white', color: 'var(--plum)', border: '1px solid rgba(212,175,55,0.35)' }}>
            <RefreshCw className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.total, color: 'var(--plum)', bg: 'rgba(74,0,78,0.06)' },
            { label: "Admins", value: stats.admins, color: 'var(--magenta)', bg: 'rgba(189,3,166,0.07)' },
            { label: "Organizers", value: stats.organizers, color: '#92400e', bg: 'rgba(212,175,55,0.1)' },
            { label: "Staff Members", value: stats.staff, color: '#1d4ed8', bg: 'rgba(59,130,246,0.07)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="p-5 flex flex-col gap-1" style={cardStyle}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                style={{ background: bg }}>
                <Users className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-2xl font-bold font-luxury" style={{ color: 'var(--plum)' }}>{isLoading ? "—" : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white rounded-2xl"
          style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: 'var(--plum)' }}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {ROLE_FILTERS.map(role => (
              <button key={role} onClick={() => setRoleFilter(role)}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                style={roleFilter === role ? {
                  background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(189,3,166,0.25)',
                } : {
                  background: 'rgba(74,0,78,0.04)',
                  color: 'rgba(74,0,78,0.5)',
                  border: '1px solid rgba(212,175,55,0.2)'
                }}>
                {role === "ALL" ? `All (${stats.total})` :
                 role === "ADMIN" ? `Admin (${stats.admins})` :
                 role === "ORGANIZER" ? `Organizer (${stats.organizers})` :
                 `Staff (${stats.staff})`}
              </button>
            ))}
          </div>
        </div>

        {/* 2FA info bar */}
        {!isLoading && stats.twoFA > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <UserCheck className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              <span className="font-bold">{stats.twoFA}</span> of {stats.total} users have Two-Factor Authentication enabled.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-red-600"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* Users List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(6).fill(null).map((_, i) => <Skeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl"
              style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(74,0,78,0.05)' }}>
                <UserX className="w-10 h-10" style={{ color: 'var(--magenta)', opacity: 0.5 }} />
              </div>
              <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>No users found</h3>
              <p className="text-gray-500 mt-2 text-sm">
                {search ? `No results for "${search}" in ${roleFilter === "ALL" ? "any role" : roleFilter}.` : "No users registered yet."}
              </p>
              {search && (
                <button onClick={() => { setSearch(""); setRoleFilter("ALL"); }}
                  className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))` }}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(74,0,78,0.4)' }}>
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
