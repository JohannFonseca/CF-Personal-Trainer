'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, Activity, LogOut, Loader2, AlertCircle, 
  UserCircle, ShieldCheck, Search, Filter, ChevronRight,
  TrendingUp, Calendar, Target
} from 'lucide-react';

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
  const [adminProfile, setAdminProfile] = useState<{name: string} | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.replace('/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        setAdminProfile({ name: profile.full_name || user.email || 'Admin' });

        const { data: allProfiles, error: clientsError } = await supabase
          .from('profiles')
          .select('id, full_name, goals, training_days, created_at')
          .order('created_at', { ascending: false });

        if (clientsError) throw clientsError;
        setClients(allProfiles || []);

      } catch (err: any) {
        setError(err.message || "Error al cargar el panel.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-foreground/40 text-sm font-medium">Cargando panel de control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-card/50 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">CF Trainer</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 bg-primary/10 text-primary px-4 py-3.5 rounded-2xl font-bold transition-all">
              <Users size={20} />
              <span>Clientes</span>
            </button>
            <button className="w-full flex items-center space-x-3 text-foreground/50 hover:bg-white/5 hover:text-foreground px-4 py-3.5 rounded-2xl font-medium transition-all">
              <Activity size={20} />
              <span>Ejercicios</span>
            </button>
            <button className="w-full flex items-center space-x-3 text-foreground/50 hover:bg-white/5 hover:text-foreground px-4 py-3.5 rounded-2xl font-medium transition-all">
              <Calendar size={20} />
              <span>Calendario</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-primary font-black">
                  {adminProfile?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{adminProfile?.name}</p>
                <p className="text-[10px] text-foreground/40 font-bold uppercase">Entrenador</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-2xl transition-all font-bold text-sm"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black">Gestión de Clientes</h2>
            <p className="text-foreground/40 mt-2 font-medium">Bienvenido de nuevo. Tienes {clients.length} clientes registrados.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all w-full md:w-64"
              />
            </div>
            <button className="bg-white/5 p-3.5 rounded-2xl border border-white/5 text-foreground/60 hover:text-foreground transition-all">
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:scale-110 transition-transform">
              <Users size={80} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-2">Total Alumnos</p>
            <h3 className="text-5xl font-black text-primary">{clients.length}</h3>
          </div>
          <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-green-500/10 group-hover:scale-110 transition-transform">
              <TrendingUp size={80} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-2">Activos Hoy</p>
            <h3 className="text-5xl font-black text-green-500">{Math.ceil(clients.length * 0.7)}</h3>
          </div>
          <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative overflow-hidden group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 p-8 text-yellow-500/10 group-hover:scale-110 transition-transform">
              <Target size={80} strokeWidth={3} />
            </div>
            <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-2">Rutinas Pendientes</p>
            <h3 className="text-5xl font-black text-yellow-500">{clients.length}</h3>
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold px-2 mb-6">Lista de Clientes</h3>
          {clients.length === 0 ? (
            <div className="bg-card border border-dashed border-white/10 rounded-[3rem] py-24 text-center">
              <UserCircle size={64} className="mx-auto text-foreground/10 mb-6" />
              <h4 className="text-2xl font-bold mb-2">Sin clientes todavía</h4>
              <p className="text-foreground/40">Comparte tu web para que tus alumnos se registren.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {clients.map((client) => (
                <div 
                  key={client.id} 
                  className="group bg-card hover:bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between transition-all"
                >
                  <div className="flex items-center space-x-6 mb-6 md:mb-0 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">
                      {(client.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                        {client.full_name || 'Sin nombre'}
                      </h4>
                      <p className="text-sm text-foreground/30 font-medium">Miembro desde {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                      <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">Objetivo</span>
                      <span className="text-sm font-bold text-foreground/80">{client.goals || 'Pendiente'}</span>
                    </div>
                    <div className="bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
                      <span className="text-[10px] text-foreground/30 font-bold uppercase tracking-tighter">Frecuencia</span>
                      <span className="text-sm font-bold text-foreground/80">{client.training_days || 0} días/sem</span>
                    </div>
                    <button className="flex-1 md:flex-none bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2">
                      <span>Ver Perfil</span>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
