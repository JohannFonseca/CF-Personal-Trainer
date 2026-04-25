'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Share2, User, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        setRole(profile?.role || 'client');
      }
    });
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
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary transition-colors">
              <Share2 size={20} />
            </a>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors bg-white/5 px-3 py-1.5 rounded-full"
                >
                  <LayoutDashboard size={15} />
                  <span className="hidden sm:inline">{role === 'admin' ? 'Panel Admin' : 'Mi Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground/60 hover:text-red-400 transition-colors bg-white/5 px-3 py-1.5 rounded-full"
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors bg-white/5 px-3 py-1.5 rounded-full">
                <User size={16} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
