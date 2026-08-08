import { HeroSection } from "./components/HeroSection";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export const ForgotPassword = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-[#ECEEF5]">
      {/* Left Side: Hero & Branding */}
      <HeroSection />

      {/* Right Side: Authentication Form */}
      <div className="flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[20px] shadow-2xl p-10 border border-gray-100 transition-all duration-500">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};
