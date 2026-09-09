import { Calendar, Users, TrendingUp, Star, Sparkles } from "lucide-react";

export const HeroSection = () => {
  return (
    <div className="hidden lg:flex relative flex-col justify-between p-14 overflow-hidden"
      style={{ background: `linear-gradient(160deg, var(--plum-dark) 0%, var(--plum) 45%, var(--magenta-dark) 100%)` }}>

      {/* Decorative background circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'rgba(189,3,166,0.18)' }}></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"
        style={{ background: 'rgba(212,175,55,0.08)' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(189,3,166,0.06)' }}></div>

      {/* Gold horizontal ornament lines */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}></div>
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}></div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xl border"
          style={{ background: `linear-gradient(135deg, var(--magenta), var(--gold))`, borderColor: 'rgba(212,175,55,0.5)' }}>
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <span className="font-luxury text-2xl text-white tracking-wide">Event-Management</span>
          <div className="h-px w-full mt-0.5" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}></div>
        </div>
      </div>

      {/* Main Hero Text */}
      <div className="relative z-10 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px w-8" style={{ background: 'var(--gold)' }}></div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold-light)' }}>
            Premium Event Platform
          </span>
        </div>
        <h1 className="font-luxury text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
          Every Event Begins With <span style={{ color: 'var(--gold-light)' }}>Great</span> Planning.
        </h1>
        <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Manage conferences, weddings, exhibitions, and corporate events — all from one powerful, elegant dashboard.
        </p>
      </div>

      {/* Floating Stats Cards */}
      <div className="relative z-10 space-y-4">
        {/* Card 1 */}
        <div className="w-64 p-4 rounded-2xl backdrop-blur-md transition-transform hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(212,175,55,0.25)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <Calendar className="w-6 h-6" style={{ color: 'var(--gold-light)' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Upcoming Events</p>
              <p className="text-2xl font-bold text-white">142</p>
            </div>
          </div>
          <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }}></div>
        </div>

        {/* Card 2 */}
        <div className="w-56 ml-8 p-4 rounded-2xl backdrop-blur-md transition-transform hover:scale-105"
          style={{
            background: 'rgba(189,3,166,0.15)',
            border: '1px solid rgba(189,3,166,0.35)',
            boxShadow: '0 8px 32px rgba(189,3,166,0.15)'
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(189,3,166,0.25)', border: '1px solid rgba(189,3,166,0.4)' }}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Guests</p>
              <p className="text-2xl font-bold text-white">12.5k</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="w-60 p-4 rounded-2xl backdrop-blur-md transition-transform hover:scale-105"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(229,169,60,0.15)', border: '1px solid rgba(229,169,60,0.3)' }}>
              <TrendingUp className="w-6 h-6" style={{ color: 'var(--gold-light)' }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Revenue</p>
              <p className="text-2xl font-bold text-white">$1.2M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating sparkle decoration */}
      <Sparkles className="absolute top-1/3 right-12 w-6 h-6 opacity-30 animate-pulse" style={{ color: 'var(--gold)' }} />
      <Sparkles className="absolute top-1/2 right-1/3 w-4 h-4 opacity-20 animate-pulse animation-delay-300" style={{ color: 'var(--gold)' }} />
    </div>
  );
};
