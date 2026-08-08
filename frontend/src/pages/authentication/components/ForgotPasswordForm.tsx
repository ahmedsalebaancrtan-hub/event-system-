import React, { useState, useRef } from "react";
import { Mail, KeyRound, ArrowRight, ArrowLeft, Star, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getNetworkErrorMessage } from "../../../lib/api";

const inputCls = "block w-full pl-11 pr-4 py-3.5 text-sm outline-none transition-all rounded-xl";
const inputStyle = {
  background: 'rgba(74,0,78,0.04)',
  border: '1px solid rgba(212,175,55,0.3)',
  color: 'var(--plum)',
};

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError("");
    try {
      await api.post("/users/forget-password", { email });
      setSuccessMsg("If this email exists, an OTP has been sent.");
      setStep(2);
    } catch (err: any) {
      if (!err.response) setError(getNetworkErrorMessage(err));
      else setError(err.response?.data?.message || err.response?.data?.error || "Failed to request OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...code];
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < pastedData.length; i++) {
        if (index + i < 6) newCode[index + i] = pastedData[i];
      }
      setCode(newCode);
      const nextEmpty = newCode.findIndex((c) => c === "");
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value !== "" && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) { setError("Please enter the complete 6-digit OTP."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setIsLoading(true); setError(""); setSuccessMsg("");
    try {
      await api.post("/users/reset", { email, otp: fullCode, new_password: newPassword });
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      if (!err.response) setError(getNetworkErrorMessage(err));
      else setError(err.response?.data?.message || err.response?.data?.error || "Failed to reset password.");
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

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={step >= s ? {
                background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
                color: 'white',
                boxShadow: '0 4px 12px rgba(189,3,166,0.35)'
              } : {
                background: 'rgba(74,0,78,0.06)',
                color: 'rgba(74,0,78,0.4)',
                border: '1px solid rgba(212,175,55,0.2)'
              }}>
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 2 && <div className="w-12 h-px transition-all duration-300"
              style={{ background: step > s ? 'var(--magenta)' : 'rgba(212,175,55,0.2)' }}></div>}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="text-center mb-7">
        <h2 className="font-luxury text-3xl font-bold mb-2" style={{ color: 'var(--plum)' }}>
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>
        <div className="h-px w-16 mx-auto my-3" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
        <p className="text-gray-500 text-sm">
          {step === 1 ? "Enter your email to receive a reset code." : `Enter the code sent to ${email} and your new password.`}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl text-sm text-center text-red-600"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      )}
      {successMsg && (
        <div className="mb-5 p-3 rounded-xl text-sm text-center text-green-700"
          style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>{successMsg}</div>
      )}

      {/* Step 1 */}
      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              </div>
              <input id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className={inputCls} style={inputStyle}
                placeholder="admin@event-management.com"
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
              boxShadow: '0 8px 20px rgba(189,3,166,0.35)',
              border: '1px solid rgba(212,175,55,0.35)'
            }}>
            {isLoading ? "Sending Code..." : "Send Reset Code"}
            {!isLoading && <ArrowRight className="w-4 h-4" style={{ color: 'var(--gold-light)' }} />}
          </button>
        </form>
      ) : (
        /* Step 2 */
        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* OTP Boxes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--plum)', opacity: 0.6 }}>
              6-Digit Verification Code
            </label>
            <div className="flex justify-between gap-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text" inputMode="numeric" maxLength={6}
                  value={digit}
                  onChange={(e) => handleCodeChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold outline-none transition-all duration-300"
                  style={{
                    borderRadius: '14px',
                    background: digit ? 'rgba(189,3,166,0.06)' : 'rgba(74,0,78,0.03)',
                    border: digit ? '2px solid var(--magenta)' : '1px solid rgba(212,175,55,0.3)',
                    color: 'var(--plum)',
                    boxShadow: digit ? '0 4px 12px rgba(189,3,166,0.15)' : 'none'
                  }}
                  disabled={isLoading}
                  onFocus={e => {
                    e.target.style.border = '2px solid var(--magenta)';
                    e.target.style.background = 'rgba(189,3,166,0.04)';
                  }}
                  onBlur={e => {
                    e.target.style.border = digit ? '2px solid var(--magenta)' : '1px solid rgba(212,175,55,0.3)';
                  }}
                />
              ))}
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--plum)', opacity: 0.6 }}>
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              </div>
              <input id="newPassword" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                className={inputCls} style={inputStyle}
                placeholder="New strong password"
                onFocus={e => (e.target.style.border = '1px solid var(--magenta)')}
                onBlur={e => (e.target.style.border = '1px solid rgba(212,175,55,0.3)')}
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading || code.some(d => d === "") || !newPassword}
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
              boxShadow: '0 8px 20px rgba(189,3,166,0.35)',
              border: '1px solid rgba(212,175,55,0.35)'
            }}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <div className="mt-8 text-center">
        <button onClick={() => navigate("/auth/login")}
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'rgba(74,0,78,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--plum)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(74,0,78,0.5)')}>
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>
      </div>
    </div>
  );
};
