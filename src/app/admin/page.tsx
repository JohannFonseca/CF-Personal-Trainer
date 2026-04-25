'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, Activity, LogOut, Loader2, AlertCircle, UserCircle } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string | null;
  goals: string | null;
  training_days: number | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Profile[]>([]);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const init = async () => {
      // 1. Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace('/login');
        return;
      }

      // 2. Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      setAdminName(profile.full_name || user.email || 'Admin');

      // 3. Load all client profiles
      const { data: allProfiles, error: clientsError } = await supabase
        .from('profiles')
        .select('id, full_name, goals, training_days, created_at')
        .order('created_at', { ascending: false });

      if (clientsError) {
        setError('No se pudieron cargar los clientes. Verifica las políticas RLS en Supabase.');
      } else {
        setClients(allProfiles || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-foreground/60">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/5 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-bold text-primary">CF Trainer</h1>
          <p className="text-xs text-foreground/50 mt-1">Panel del Entrenador</p>
        </div>
        <nav className="px-4 py-4 space-y-2 flex-1">
          <a href="#" className="flex items-center space-x-3 bg-primary/10 text-primary px-4 py-3 rounded-xl font-medium">
            <Users size={20} />
            <span>Clientes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-foreground/70 hover:bg-white/5 hover:text-foreground px-4 py-3 rounded-xl font-medium transition-colors">
            <Activity size={20} />
            <span>Rutinas / Ejercicios</span>
          </a>
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{adminName}</p>
              <p className="text-xs text-primary">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-foreground/60 hover:text-red-400 px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Mobile header */}
        <div className="flex md:hidden justify-between items-center mb-6">
          <h1 className="text-lg font-bold text-primary">Panel Trainer</h1>
          <button onClick={handleLogout} className="text-foreground/60 hover:text-red-400">
            <LogOut size={20} />
          </button>
        </div>

        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestión de Clientes</h2>
            <p className="text-foreground/50 text-sm mt-1">
              {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-start space-x-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {clients.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-24 text-foreground/40 space-y-3">
            <UserCircle size={48} />
            <p className="text-lg font-medium">No hay clientes registrados aún</p>
            <p className="text-sm">Los usuarios que se registren aparecerán aquí.</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-white/5">
              {clients.map((client) => (
                <div key={client.id} className="p-4 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                      {(client.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{client.full_name || 'Sin nombre'}</p>
                      <p className="text-xs text-foreground/50">{client.goals || 'Sin objetivo definido'}</p>
                    </div>
                    <span className="text-xs text-foreground/40 flex-shrink-0">
                      {client.training_days ? `${client.training_days} días/sem` : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="border-b border-white/5 text-foreground/60 text-sm">
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Objetivo</th>
                  <th className="p-4 font-medium">Días/Semana</th>
                  <th className="p-4 font-medium">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {(client.full_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-foreground">{client.full_name || 'Sin nombre'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/80">{client.goals || '—'}</td>
                    <td className="p-4 text-foreground/80">{client.training_days ? `${client.training_days} días` : '—'}</td>
                    <td className="p-4 text-foreground/50 text-sm">
                      {new Date(client.created_at).toLocaleDateString('es-CR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
