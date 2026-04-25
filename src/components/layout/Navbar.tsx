'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Share2, User, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setRole(profile?.role || 'client');
      }
    };
    
    fetchSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchSession();
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-primary tracking-tight">
              CF Trainer
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] text-foreground/40 font-bold uppercase">{role === 'admin' ? 'Coach' : 'Atleta'}</span>
                <span className="text-xs font-medium text-foreground/70">{user.email}</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={role === 'admin' ? '/admin' : '/dashboard'}
                  className={`flex items-center space-x-2 text-sm font-bold transition-all px-4 py-2 rounded-full shadow-lg ${
                    role === 'admin' 
                    ? 'bg-primary text-white shadow-primary/20' 
                    : 'bg-white/5 text-foreground hover:bg-white/10'
                  }`}
                >
                  {role === 'admin' ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                  <span>{role === 'admin' ? 'Panel Admin' : 'Mi Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground/60 hover:text-red-400 transition-colors bg-white/5 rounded-full"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 px-6 py-2.5 rounded-full transition-all shadow-lg shadow-primary/20">
                <User size={16} />
                <span>Entrar</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
