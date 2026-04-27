'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dumbbell, TrendingUp, History, User, 
  Flame, Bell, ChevronLeft, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Rutinas', icon: <Dumbbell size={24} />, path: '/dashboard' },
    { name: 'Progreso', icon: <TrendingUp size={24} />, path: '/dashboard/progress' },
    { name: 'Actividad', icon: <History size={24} />, path: '/dashboard/activity' },
    { name: 'Perfil', icon: <User size={24} />, path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24">
      
      {/* Header - App Style */}
      <header className="sticky top-0 z-40 glass-nav px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center rotate-3">
            <Dumbbell className="text-white" size={18} strokeWidth={3} />
          </div>
          <h1 className="text-lg font-black italic tracking-tighter">CF TRAINER</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">
            <Flame size={14} fill="currentColor" />
            <span className="text-xs font-black">5</span>
          </div>
          <button onClick={handleLogout} className="text-foreground/40 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto relative">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-nav z-50 flex items-center justify-around px-4 border-t border-white/5">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-1.5 transition-all relative ${
                isActive ? 'text-primary' : 'text-foreground/30'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-3 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
