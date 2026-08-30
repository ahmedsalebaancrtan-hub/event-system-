import { useState, useEffect } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface ResetModalState {
  open: boolean;
  user: User | null;
}

export const ResetPasswordModal = ({
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
