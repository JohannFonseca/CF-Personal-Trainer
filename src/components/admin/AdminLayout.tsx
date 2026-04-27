'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, Activity, LayoutDashboard, 
  Plus, Dumbbell, Settings, ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Atletas', icon: <Users size={20} />, path: '/admin/clients' },
    { name: 'Rutinas', icon: <Dumbbell size={20} />, path: '/admin/routines' },
    { name: 'Ejercicios', icon: <Activity size={20} />, path: '/admin/exercises' },
  ];

  const fabActions = [
    { name: 'Nueva Rutina', icon: <Dumbbell size={18} />, color: 'bg-primary', path: '/admin/clients' },
    { name: 'Ver Atletas', icon: <Users size={18} />, color: 'bg-green-500', path: '/admin/clients' },
    { name: 'Nuevo Ejercicio', icon: <Plus size={18} />, color: 'bg-purple-500', path: '/admin/exercises' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row pb-24 lg:pb-0">
      
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 p-8 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black italic tracking-tighter">CF TRAINER</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
                  isActive 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-bold">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-3xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Coach Pro</p>
            </div>
            <button onClick={() => router.push('/admin/clients')} className="text-foreground/20 hover:text-primary transition-colors">
              <Settings size={18} />
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all font-bold"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav - Mobile Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass-nav z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-1 transition-all ${
                isActive ? 'text-primary scale-110' : 'text-foreground/30'
              }`}
            >
              <div className={isActive ? 'animate-bounce-short' : ''}>
                {item.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button (FAB) - Mobile Only */}
      <div className="lg:hidden fixed bottom-24 right-6 z-50">
        <AnimatePresence>
          {showFABMenu && (
            <div className="absolute bottom-16 right-0 space-y-3 mb-4">
              {fabActions.map((action, i) => (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    router.push(action.path);
                    setShowFABMenu(false);
                  }}
                  className="flex items-center space-x-3 group"
                >
                  <span className="bg-card px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/5">
                    {action.name}
                  </span>
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        <button
          onClick={() => setShowFABMenu(!showFABMenu)}
          className={`w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/40 transition-transform active:scale-90 ${showFABMenu ? 'rotate-45' : ''}`}
        >
          <Plus size={32} />
        </button>
      </div>

    </div>
  );
}
