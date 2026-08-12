import React, { useState, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { useUserStore } from "../../../store/user-store";
import { api, getNetworkErrorMessage } from "../../../lib/api";
import type { LoginResponse } from "../../../types/user";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export const TwoFactorVerification = () => {
  const { loginEmail, verify2FA } = useUserStore();
  const { toast } = useToast();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
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
    setIsVerifying(true);
    try {
      const response = await api.post<LoginResponse>("/users/verify-2fa-login", { email: loginEmail, otp: fullCode });
      verify2FA(response.data);
      toast({
        title: "Verified",
        description: "Two-factor verification successful.",
        variant: "success",
      });
    } catch (err: any) {
      const errorMsg = !err.response 
        ? getNetworkErrorMessage(err) 
        : err.response?.data?.message || "Invalid verification code.";
        
      toast({
        title: "Verification Failed",
        description: errorMsg,
        variant: "destructive",
      });
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/60">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Two-Step Verification</CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app for{" "}
            <span className="font-medium text-foreground">{loginEmail}</span>.
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* OTP Input Grid */}
          <div className="space-y-3">
            <Label className="block text-center text-muted-foreground sr-only">Verification Code</Label>
            <div className="flex justify-between gap-2">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text" 
                  inputMode="numeric" 
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="flex h-12 w-12 text-center rounded-md border border-input bg-background px-3 py-2 text-xl font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                  disabled={isVerifying}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={() => submitCode(code.join(""))}
            disabled={isVerifying || code.some(d => d === "")}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-2">
            Didn't receive the code?{" "}
            <button className="font-semibold text-primary hover:underline transition-colors">
              Resend
            </button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 p-4">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm" onClick={() => window.location.reload()}>
          Return to login
        </Button>
      </CardFooter>
    </Card>
  );
};
