'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Users, Activity, LogOut, Loader2, AlertCircle, UserCircle, ShieldCheck } from 'lucide-react';

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
  const [adminProfile, setAdminProfile] = useState<{name: string, role: string} | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log("No hay usuario logueado");
          router.replace('/login');
          return;
        }

        // 2. Obtener perfil y rol directamente
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error al obtener perfil:", profileError);
          setError(`Error de base de datos: ${profileError.message}`);
          setLoading(false);
          return;
        }

        if (!profile || profile.role !== 'admin') {
          console.log("Acceso denegado: El usuario no es admin. Rol detectado:", profile?.role);
          router.replace('/dashboard');
          return;
        }

        setAdminProfile({
          name: profile.full_name || user.email || 'Admin',
          role: profile.role
        });

        // 3. Cargar clientes
        const { data: allProfiles, error: clientsError } = await supabase
          .from('profiles')
          .select('id, full_name, goals, training_days, created_at')
          .order('created_at', { ascending: false });

        if (clientsError) {
          console.error("Error al cargar clientes:", clientsError);
          setError("No se pudieron cargar los clientes. Revisa los permisos RLS.");
        } else {
          setClients(allProfiles || []);
        }

      } catch (err) {
        console.error("Error inesperado:", err);
        setError("Ocurrió un error inesperado al cargar el panel.");
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
        <div className="text-center">
          <p className="font-bold text-foreground">Verificando Identidad</p>
          <p className="text-xs text-foreground/50">Cargando permisos de entrenador...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-red-500/20 p-8 rounded-3xl text-center shadow-2xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error de Acceso</h2>
          <p className="text-foreground/60 mb-6 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all mb-3"
          >
            Reintentar
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-foreground/50 text-sm hover:text-foreground transition-colors"
          >
            Cerrar sesión e intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">CF Trainer</h1>
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-2 flex-1">
          <a href="#" className="flex items-center space-x-3 bg-primary/10 text-primary px-4 py-3 rounded-xl font-medium">
            <Users size={20} />
            <span>Clientes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-foreground/70 hover:bg-white/5 hover:text-foreground px-4 py-3 rounded-xl font-medium transition-colors">
            <Activity size={20} />
            <span>Rutinas</span>
          </a>
        </nav>

        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {adminProfile?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{adminProfile?.name}</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Entrenador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 px-3 py-2.5 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        <header className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Gestión de Clientes</h2>
              <p className="text-foreground/50 mt-1">Supervisa el progreso y asigna nuevas rutinas.</p>
            </div>
            <div className="hidden sm:flex space-x-3">
              <div className="bg-card px-4 py-2 rounded-xl border border-white/5">
                <p className="text-[10px] text-foreground/40 font-bold uppercase">Total Clientes</p>
                <p className="text-xl font-bold text-primary">{clients.length}</p>
              </div>
            </div>
          </div>
        </header>

        {clients.length === 0 ? (
          <div className="bg-card border border-dashed border-white/10 rounded-[2rem] py-20 text-center">
            <UserCircle size={64} className="mx-auto text-foreground/10 mb-4" />
            <h3 className="text-xl font-bold text-foreground">No hay clientes registrados</h3>
            <p className="text-foreground/40 max-w-sm mx-auto mt-2">
              Cuando tus alumnos se registren en la plataforma, aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => (
              <div 
                key={client.id} 
                className="group bg-card hover:bg-white/[0.04] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {(client.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {client.full_name || 'Usuario sin nombre'}
                    </h4>
                    <p className="text-xs text-foreground/40 mt-0.5">
                      Registrado el {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                  <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <p className="text-[9px] text-foreground/40 font-bold uppercase leading-none mb-1">Objetivo</p>
                    <p className="text-xs font-medium text-foreground/80">{client.goals || 'No definido'}</p>
                  </div>
                  <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <p className="text-[9px] text-foreground/40 font-bold uppercase leading-none mb-1">Entreno</p>
                    <p className="text-xs font-medium text-foreground/80">{client.training_days || 0} días/sem</p>
                  </div>
                  <button className="flex-1 sm:flex-none ml-0 sm:ml-4 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                    Asignar Rutina
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
