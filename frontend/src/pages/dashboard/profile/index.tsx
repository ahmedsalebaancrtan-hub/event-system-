import { useUserStore } from "../../../store/user-store";
import { User as UserIcon, Mail, Shield, Key, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileSettings = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4" style={{ borderColor: 'var(--magenta)' }}></div>
      </div>
    );
  }

  const roleLabel =
    user.role === "ADMIN" ? "System Administrator" :
    user.role === "ORGANIZER" ? "Event Organizer" : "Staff Member";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-luxury text-4xl font-bold" style={{ color: 'var(--plum)' }}>Profile Settings</h1>
        <div className="h-0.5 w-16 mt-2 mb-1" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
        <p className="text-gray-500 text-sm mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white overflow-hidden flex flex-col items-center text-center"
            style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 4px 24px rgba(74,0,78,0.08)' }}>

            {/* Hero gradient banner */}
            <div className="w-full h-28 flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, var(--plum-dark), var(--magenta))' }}>
              {/* Gold shimmer line */}
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}></div>
              <Star className="w-8 h-8 fill-current" style={{ color: 'rgba(212,175,55,0.4)' }} />
            </div>

            {/* Avatar */}
            <div className="-mt-10 relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-xl"
              style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))` }}>
              <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            </div>

            <div className="px-6 pb-8 pt-3">
              <h2 className="font-luxury text-2xl font-bold" style={{ color: 'var(--plum)' }}>{user.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mt-2"
                style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--plum)', border: '1px solid rgba(212,175,55,0.35)' }}>
                <Shield className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                {roleLabel}
              </div>
              <p className="text-sm text-gray-500 mt-3">{user.email}</p>

              <div className="mt-6 pt-6 w-full" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all"
                  style={{ color: 'var(--magenta)', background: 'rgba(189,3,166,0.06)', border: '1px solid rgba(189,3,166,0.2)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(189,3,166,0.12)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(189,3,166,0.4)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(189,3,166,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(189,3,166,0.2)';
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Details & Security */}
        <div className="md:col-span-2 space-y-6">

          {/* Personal Info */}
          <div className="bg-white" style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 4px 24px rgba(74,0,78,0.08)' }}>
            <div className="h-1 rounded-t-[24px]" style={{ background: 'linear-gradient(90deg, var(--plum-dark), var(--magenta), var(--gold))' }}></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(74,0,78,0.07)' }}>
                  <UserIcon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Personal Information</h3>
                  <div className="h-px w-24 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}></div>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Full Name", value: user.name, icon: UserIcon },
                  { label: "Email Address", value: user.email, icon: Mail },
                  { label: "Account Role", value: roleLabel, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--plum)', opacity: 0.5 }}>
                      {label}
                    </label>
                    <div className="flex items-center w-full px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--plum)' }}>
                      <Icon className="w-4 h-4 mr-3 shrink-0" style={{ color: 'var(--gold)' }} />
                      <span className="font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white" style={{ borderRadius: '24px', border: '1px solid rgba(212,175,55,0.25)', boxShadow: '0 4px 24px rgba(74,0,78,0.08)' }}>
            <div className="h-1 rounded-t-[24px]" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta), var(--plum-dark))' }}></div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(74,0,78,0.07)' }}>
                  <Key className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                </div>
                <div>
                  <h3 className="font-luxury text-xl font-bold" style={{ color: 'var(--plum)' }}>Security Settings</h3>
                  <div className="h-px w-24 mt-1" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}></div>
                </div>
              </div>

              {[
                { title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account." },
                { title: "Password Management", desc: "Update your account password for enhanced security." }
              ].map(({ title, desc }) => (
                <div key={title} className="flex items-center justify-between p-4 rounded-xl mb-4 last:mb-0"
                  style={{ background: 'rgba(74,0,78,0.03)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--plum)' }}>{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <button
                    disabled
                    className="px-5 py-2 rounded-full font-medium text-sm cursor-not-allowed"
                    style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(74,0,78,0.4)', border: '1px solid rgba(212,175,55,0.2)' }}
                    title="Feature coming soon"
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
