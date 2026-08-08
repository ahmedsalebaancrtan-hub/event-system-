import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Star } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { api, getNetworkErrorMessage } from "../../../lib/api";

const inputWrapCls = "relative";
const inputCls = "block w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-all rounded-xl";
const inputStyle = {
  background: 'rgba(74,0,78,0.04)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: 'var(--plum)',
};
const iconCls = "absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none";

export const LoginForm = () => {
  const { login, setRequires2FA } = useUserStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post<any>("/users/login", { email, password });
      if (response.data.message === "2FA_REQUIRED") {
        setRequires2FA(true, email);
        return;
      }
      login(response.data);
    } catch (err: any) {
      if (err.response?.data?.message === "2FA_REQUIRED") {
        setRequires2FA(true, email);
      } else if (!err.response) {
        setError(getNetworkErrorMessage(err));
      } else {
        setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
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
      <div className="text-center mb-8">
        <h2 className="font-luxury text-3xl font-bold mb-2" style={{ color: 'var(--plum)' }}>Welcome Back</h2>
        <div className="h-px w-16 mx-auto my-3" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
        <p className="text-gray-500 text-sm">Sign in to continue managing your events.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-sm text-center text-red-600"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>
            Email Address
          </label>
          <div className={inputWrapCls}>
            <div className={iconCls}><Mail className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <input id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className={inputCls} style={inputStyle}
              placeholder="admin@event-management.com"
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>
            Password
          </label>
          <div className={inputWrapCls}>
            <div className={iconCls}><Lock className="h-5 w-5" style={{ color: 'var(--gold)' }} /></div>
            <input id="password" type={showPassword ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className={`${inputCls} pr-11`} style={inputStyle}
              placeholder="••••••••"
              onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
              onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
              style={{ color: 'rgba(212,175,55,0.6)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--magenta)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.6)')}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--plum)', opacity: 0.6 }}>
            <input id="remember-me" type="checkbox" className="h-4 w-4 rounded cursor-pointer"
              style={{ accentColor: 'var(--magenta)' }} />
            Remember me
          </label>
          <Link to="/auth/forgot-password"
            className="font-semibold text-sm transition-colors"
            style={{ color: 'var(--magenta)' }}>
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
            boxShadow: '0 8px 20px rgba(189,3,166,0.35)',
            border: '1px solid rgba(212,175,55,0.35)'
          }}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* OR divider */}
      <div className="my-7 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }}></div>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(74,0,78,0.4)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.2)' }}></div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Google",
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )
          },
          {
            label: "Microsoft",
            icon: (
              <svg className="h-5 w-5" viewBox="0 0 21 21">
                <path fill="#f25022" d="M0 0h10v10H0z" />
                <path fill="#7fba00" d="M11 0h10v10H11z" />
                <path fill="#00a4ef" d="M0 11h10v10H0z" />
                <path fill="#ffb900" d="M11 11h10v10H11z" />
              </svg>
            )
          }
        ].map(({ label, icon }) => (
          <button key={label}
            className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all duration-300"
            style={{
              background: 'rgba(74,0,78,0.03)',
              border: '1px solid rgba(212,175,55,0.25)',
              color: 'var(--plum)'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(74,0,78,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.25)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(74,0,78,0.03)';
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="mt-7 text-center text-sm" style={{ color: 'var(--plum)', opacity: 0.6 }}>
        Don't have an account?{" "}
        <Link to="/auth/register" className="font-bold transition-colors" style={{ color: 'var(--magenta)', opacity: 1 }}>
          Create one
        </Link>
      </div>
    </div>
  );
};
