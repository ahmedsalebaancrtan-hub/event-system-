import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/user-store";
import { HeroSection } from "./components/HeroSection";
import { LoginForm } from "./components/LoginForm";
import { TwoFactorVerification } from "./components/TwoFactorVerification";

export const Login = () => {
  const navigate = useNavigate();
  const { requires2FA, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && !requires2FA) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, requires2FA, navigate]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#ECEEF5]">
      {/* Left Side: Hero & Branding */}
      <HeroSection />

      {/* Right Side: Authentication Form */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[20px] shadow-2xl p-10 border border-gray-100 transition-all duration-500">
          {!requires2FA ? <LoginForm /> : <TwoFactorVerification />}
        </div>
      </div>
    </div>
  );
};
