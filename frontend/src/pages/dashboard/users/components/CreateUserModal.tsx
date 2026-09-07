import { useState } from "react";
import { CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CreateUserModal = ({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "ORGANIZER" | "STAFF" | "">("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  // Reset form when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      // small delay to reset after animation
      setTimeout(() => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("");
        setStatus("idle");
        setMsg("");
      }, 300);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      setStatus("error");
      return;
    }
    if (!role) {
      setMsg("Please select a role.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setMsg("");
    
    try {
      await api.post("/users/create", { name, email, password, role });
      setStatus("success");
      setMsg("User created successfully!");
      onSuccess(); // trigger list refresh
    } catch (err: any) {
      setStatus("error");
      setMsg(err.response?.data?.message || "Failed to create user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Register a new team member and assign their role.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/10">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <p className="font-semibold text-foreground">User Created Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">The user can now log in with the provided password.</p>
            <Button onClick={() => handleOpenChange(false)} className="mt-6">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <Input 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="user@example.com"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Role</label>
              <Select value={role} onValueChange={(v: any) => setRole(v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="STAFF">Staff Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temporary Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temporary Password</label>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={8} 
                placeholder="Min. 8 characters" 
              />
            </div>

            {status === "error" && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/30">
                <AlertCircle className="w-4 h-4 shrink-0" /> {msg}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={status === "loading"} className="flex-1 gap-2">
                {status === "loading" ? "Creating..." : <><UserPlus className="w-4 h-4" /> Create User</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
