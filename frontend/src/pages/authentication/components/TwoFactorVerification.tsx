import React, { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { api, getNetworkErrorMessage } from "../../../lib/api";
import type { LoginResponse } from "../../../types/user";

export const TwoFactorVerification = () => {
  const { loginEmail, verify2FA } = useUserStore();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
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
    if (newCode.every((digit) => digit !== "")) submitCode(newCode.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const submitCode = async (fullCode: string) => {
    setIsVerifying(true); setError("");
    try {
      const response = await api.post<LoginResponse>("/users/verify-2fa-login", { email: loginEmail, otp: fullCode });
      verify2FA(response.data);
    } catch (err: any) {
      if (!err.response) setError(getNetworkErrorMessage(err));
      else setError(err.response?.data?.message || "Invalid verification code.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
        style={{ background: `linear-gradient(135deg, var(--plum), var(--magenta))`, boxShadow: '0 8px 24px rgba(189,3,166,0.35)' }}>
        <ShieldCheck className="w-10 h-10 text-white" />
        {/* Gold ring decoration */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: '1px solid rgba(212,175,55,0.5)', boxShadow: '0 0 0 4px rgba(212,175,55,0.1)' }}></div>
      </div>

      <h2 className="font-luxury text-3xl font-bold mb-2" style={{ color: 'var(--plum)' }}>Two-Step Verification</h2>
      <div className="h-px w-16 mx-auto my-3" style={{ background: 'linear-gradient(90deg, var(--gold), var(--magenta))' }}></div>
      <p className="text-gray-500 text-sm mb-8">
        Enter the verification code from your authenticator app for{" "}
        <span className="font-semibold" style={{ color: 'var(--plum)' }}>{loginEmail}</span>.
      </p>

      {error && (
        <div className="mb-6 p-3 rounded-xl text-sm text-center text-red-600"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      )}

      {/* OTP Input Grid */}
      <div className="flex justify-between gap-2 mb-8">
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text" inputMode="numeric" maxLength={6}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="w-12 h-14 text-center text-2xl font-bold outline-none transition-all duration-300"
            style={{
              borderRadius: '14px',
              background: digit ? 'rgba(189,3,166,0.06)' : 'rgba(74,0,78,0.03)',
              border: digit ? '2px solid var(--magenta)' : '1px solid rgba(212,175,55,0.3)',
              color: 'var(--plum)',
              boxShadow: digit ? '0 4px 12px rgba(189,3,166,0.15)' : 'none'
            }}
            disabled={isVerifying}
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

      <button
        onClick={() => submitCode(code.join(""))}
        disabled={isVerifying || code.some(d => d === "")}
        className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, var(--plum), var(--magenta))`,
          boxShadow: '0 8px 20px rgba(189,3,166,0.35)',
          border: '1px solid rgba(212,175,55,0.35)'
        }}>
        {isVerifying ? "Verifying..." : "Verify Code"}
      </button>

      <div className="mt-6 text-sm" style={{ color: 'rgba(74,0,78,0.5)' }}>
        Didn't receive the code?{" "}
        <button className="font-bold transition-colors" style={{ color: 'var(--magenta)' }}>
          Resend
        </button>
      </div>

      <div className="mt-3">
        <button onClick={() => window.location.reload()}
          className="text-sm transition-colors" style={{ color: 'rgba(74,0,78,0.4)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--plum)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(74,0,78,0.4)')}>
          Return to login
        </button>
      </div>
    </div>
  );
};
