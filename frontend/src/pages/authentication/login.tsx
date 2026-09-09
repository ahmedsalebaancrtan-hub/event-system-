import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/user-store";
import { hasAuthTokens } from "../../services/api";
import { LoginForm } from "../../features/auth/LoginForm";
import { TwoFactorVerification } from "../../features/auth/TwoFactorVerification";
import { Star } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const { requires2FA, isAuthenticated, logout } = useUserStore();

  useEffect(() => {
    if (!hasAuthTokens()) {
      if (isAuthenticated) {
        logout();
      }
      return;
    }

    if (isAuthenticated && !requires2FA) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, requires2FA, navigate, logout]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background blobs for subtle gradient effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none bg-primary/5" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-3xl pointer-events-none bg-primary/5" />

      {/* Logo Header */}
      <div className="flex flex-col items-center gap-2 mb-8 z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-primary">
          <Star className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Event-Management</h1>
      </div>

      <div className="z-10 w-full max-w-md">
        {!requires2FA ? <LoginForm /> : <TwoFactorVerification />}
      </div>
    </div>
  );
};
