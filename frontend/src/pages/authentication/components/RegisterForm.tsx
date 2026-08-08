import React, { useState } from "react";
import { Mail, Lock, User, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api, getNetworkErrorMessage } from "../../../lib/api";

const inputCls = "block w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-all rounded-xl";
const inputStyle = {
  background: 'rgba(74,0,78,0.04)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: 'var(--plum)',
};
const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "ORGANIZER", Is2faEnabled: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); setSuccess("");
    try {
      await api.post("/users/create", formData);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      if (!err.response) setError(getNetworkErrorMessage(err));
      else setError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border"
          style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, borderColor: 'rgba(212,175,55,0.4)' }}>
          <Star className="w-7 h-7 text-white fill-white" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="font-luxury text-3xl font-bold mb-2" style={{ color: 'var(--plum)' }}>Create Account</h2>
        <div className="h-px w-16 mx-auto my-3" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
        <p className="text-gray-500 text-sm">Join Event-Management to start managing your premium events.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-sm text-center text-red-600"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      )}
      {success && (
        <div className="mb-5 p-3 rounded-xl text-sm text-center text-green-700"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>{success}</div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>Full Name</label>
          <div className="relative">
            <div className={iconCls}><User className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required
              className={inputCls} style={inputStyle} placeholder="John Doe"
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>Email Address</label>
          <div className="relative">
            <div className={iconCls}><Mail className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required
              className={inputCls} style={inputStyle} placeholder="admin@event-management.com"
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>Password</label>
          <div className="relative">
            <div className={iconCls}><Lock className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange}
              required minLength={8} className={inputCls} style={inputStyle} placeholder="Min. 8 characters"
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')} />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>Account Role</label>
          <div className="relative">
            <div className={iconCls}><ShieldCheck className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <select id="role" name="role" value={formData.role} onChange={handleChange}
              className={`${inputCls} appearance-none`} style={inputStyle}
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}>
              <option value="ORGANIZER">Organizer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* 2FA checkbox */}
        <label className="flex items-center gap-3 pt-2 cursor-pointer">
          <div className="relative">
            <input id="Is2faEnabled" name="Is2faEnabled" type="checkbox"
              checked={formData.Is2faEnabled} onChange={handleChange}
              className="h-4 w-4 rounded cursor-pointer" style={{ accentColor: 'var(--magenta)' }} />
          </div>
          <span className="text-sm" style={{ color: 'var(--plum)', opacity: 0.7 }}>
            Enable Two-Factor Authentication <span style={{ color: 'var(--gold)' }}>(Recommended)</span>
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
            boxShadow: '0 8px 20px rgba(189,3,166,0.35)',
            border: '1px solid rgba(212,175,55,0.35)'
          }}>
          {isLoading ? "Creating Account..." : "Create Account"}
          {!isLoading && <ArrowRight className="w-4 h-4" style={{ color: 'var(--gold-light)' }} />}
        </button>
      </form>

      <div className="mt-7 text-center text-sm" style={{ color: 'var(--plum)', opacity: 0.6 }}>
        Already have an account?{" "}
        <Link to="/auth/login" className="font-bold transition-colors" style={{ color: 'var(--magenta)', opacity: 1 }}>
          Sign in
        </Link>
      </div>
    </div>
  );
};
