import React, { useState, useRef } from "react";
import { Mail, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getNetworkErrorMessage } from "../../services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/users/forget-password", { email });
      toast({
        title: "Code Sent",
        description: "If this email exists, an OTP has been sent.",
        variant: "success",
      });
      setStep(2);
    } catch (err: any) {
      const errorMsg = !err.response 
        ? getNetworkErrorMessage(err) 
        : err.response?.data?.message || err.response?.data?.error || "Failed to request OTP.";
      
      toast({
        title: "Failed",
        description: errorMsg,
        variant: "destructive",
      });
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
    if (fullCode.length !== 6) { 
      toast({ title: "Invalid Input", description: "Please enter the complete 6-digit OTP.", variant: "destructive" });
      return; 
    }
    if (newPassword.length < 6) { 
      toast({ title: "Invalid Input", description: "Password must be at least 6 characters.", variant: "destructive" });
      return; 
    }
    setIsLoading(true);
    try {
      await api.post("/users/reset", { email, otp: fullCode, new_password: newPassword });
      toast({
        title: "Password Reset",
        description: "Password reset successfully! Redirecting to login...",
        variant: "success",
      });
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (err: any) {
      const errorMsg = !err.response 
        ? getNetworkErrorMessage(err) 
        : err.response?.data?.message || err.response?.data?.error || "Failed to reset password.";
      
      toast({
        title: "Reset Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/60">
      <CardHeader className="space-y-4 text-center pb-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-px transition-all duration-300 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Enter your email to receive a reset code." : `Enter the code sent to ${email} and your new password.`}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {/* Step 1 */}
        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full gap-2" disabled={isLoading || !email}>
              {isLoading ? "Sending Code..." : "Send Reset Code"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          /* Step 2 */
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* OTP Boxes */}
            <div className="space-y-3">
              <Label className="block text-center text-muted-foreground">6-Digit Verification Code</Label>
              <div className="flex justify-between gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text" 
                    inputMode="numeric" 
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="flex h-12 w-12 text-center rounded-md border border-input bg-background px-3 py-2 text-xl font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  required
                  minLength={6}
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || code.some(d => d === "") || !newPassword}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 p-4">
        <Button variant="ghost" className="text-muted-foreground gap-2 hover:text-foreground" onClick={() => navigate("/auth/login")}>
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};
