import { useUserStore } from "../../../store/user-store";
import { User as UserIcon, Mail, Shield, Key, LogOut, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" />
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
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <div className="h-1 w-14 mt-2 mb-1 rounded-full bg-gradient-to-r from-primary to-primary/40" />
        <p className="text-muted-foreground text-sm mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left - Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden flex flex-col items-center text-center">
            {/* Hero gradient banner */}
            <div className="w-full h-28 flex items-center justify-center relative bg-gradient-to-br from-slate-900 to-slate-700">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              <Star className="w-8 h-8 fill-primary/40 text-primary/40" />
            </div>

            {/* Avatar */}
            <Avatar className="-mt-10 relative z-10 w-20 h-20 border-4 border-background shadow-xl">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <CardContent className="px-6 pb-8 pt-3 w-full">
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <Badge variant="outline" className="mt-2 gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                {roleLabel}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">{user.email}</p>

              <div className="mt-6 pt-6 w-full border-t border-border/40">
                <Button
                  id="profile-logout-btn"
                  variant="outline"
                  className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Details & Security */}
        <div className="md:col-span-2 space-y-6">

          {/* Personal Info */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-yellow-400" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <div className="h-px w-16 mt-1 bg-gradient-to-r from-primary/60 to-transparent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: user.name, icon: UserIcon },
                  { label: "Email Address", value: user.email, icon: Mail },
                  { label: "Account Role", value: roleLabel, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground/70">
                      {label}
                    </label>
                    <div className="flex items-center w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
                      <Icon className="w-4 h-4 mr-3 shrink-0 text-primary/60" />
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-primary/70 to-primary" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Security Settings</CardTitle>
                  <div className="h-px w-16 mt-1 bg-gradient-to-r from-primary/60 to-transparent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account." },
                  { title: "Password Management", desc: "Update your account password for enhanced security." }
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="rounded-full opacity-50 cursor-not-allowed"
                      title="Feature coming soon"
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
