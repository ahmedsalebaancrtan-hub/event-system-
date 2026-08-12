import { RegisterForm } from "./components/RegisterForm";
import { Star } from "lucide-react";

export const Register = () => {
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
        <RegisterForm />
      </div>
    </div>
  );
};
