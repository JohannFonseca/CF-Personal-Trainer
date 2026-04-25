'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, Activity, LogOut, Loader2, AlertCircle, 
  UserCircle, ShieldCheck, Search, Filter, ChevronRight,
  TrendingUp, Calendar, Target, X, Weight, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Profile = {
  id: string;
  full_name: string | null;
  goals: string | null;
  training_days: number | null;
  weight: number | null;
  height: number | null;
  time_available: number | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [adminProfile, setAdminProfile] = useState<{name: string} | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }

        setAdminProfile({ name: profile.full_name || user.email || 'Admin' });

        const { data: allProfiles, error: clientsError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (clientsError) throw clientsError;
        setClients(allProfiles || []);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredClients = clients.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Cargando Coach Dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground relative">
      {/* Sidebar (Desktop) */}
      <aside className="w-72 bg-card border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic">CF TRAINER</h1>
          </div>
          <nav className="space-y-2">
            <button className="w-full flex items-center space-x-3 bg-primary/10 text-primary px-4 py-4 rounded-2xl font-black transition-all">
              <Users size={20} />
              <span>Mis Clientes</span>
            </button>
            <button className="w-full flex items-center space-x-3 text-foreground/40 hover:bg-white/5 hover:text-foreground px-4 py-4 rounded-2xl font-bold transition-all">
              <Activity size={20} />
              <span>Librería de Ejercicios</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 py-4 rounded-2xl font-black text-sm hover:bg-red-500/20 transition-all">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-12 overflow-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black tracking-tight mb-2">Panel del Coach</h2>
            <p className="text-foreground/40 font-medium italic">"La disciplina vence al talento cuando el talento no se disciplina."</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Buscar por nombre..."
                className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Total Atletas</p>
            <div className="flex items-end justify-between">
              <h3 className="text-5xl font-black text-primary">{clients.length}</h3>
              <Users className="text-primary/20 mb-1" size={48} />
            </div>
          </div>
          <div className="bg-card p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Objetivos Pendientes</p>
            <div className="flex items-end justify-between">
              <h3 className="text-5xl font-black text-yellow-500">{filteredClients.length}</h3>
              <Target className="text-yellow-500/20 mb-1" size={48} />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <h3 className="text-xl font-black px-2">Clientes Recientes</h3>
          {filteredClients.length === 0 ? (
            <div className="bg-card/50 border border-dashed border-white/10 rounded-[3rem] py-20 text-center">
              <UserCircle size={64} className="mx-auto text-foreground/10 mb-4" />
              <p className="text-foreground/40 font-bold">No se encontraron resultados</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map(client => (
                <div key={client.id} className="group bg-card hover:bg-white/[0.04] border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between transition-all">
                  <div className="flex items-center space-x-6 w-full md:w-auto mb-6 md:mb-0">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">
                      {(client.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{client.full_name || 'Sin nombre'}</h4>
                      <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest mt-1">{client.goals || 'Sin objetivo definido'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setSelectedClient(client)}
                      className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-foreground px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
                    >
                      <User size={18} />
                      <span>Ver Perfil</span>
                    </button>
                    <button className="flex-1 md:flex-none bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2">
                      <Activity size={18} />
                      <span>Asignar Rutina</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedClient(null)}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center mb-10">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-primary/30 mb-6">
                  {(selectedClient.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <h3 className="text-3xl font-black">{selectedClient.full_name}</h3>
                <p className="text-primary font-bold uppercase tracking-widest text-xs mt-2">Atleta CF Trainer</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                  <div className="flex items-center text-primary space-x-2">
                    <Weight size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Peso Actual</span>
                  </div>
                  <p className="text-2xl font-black">{selectedClient.weight || '--'} <span className="text-xs text-foreground/30">kg</span></p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                  <div className="flex items-center text-blue-400 space-x-2">
                    <Move size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Estatura</span>
                  </div>
                  <p className="text-2xl font-black">{selectedClient.height || '--'} <span className="text-xs text-foreground/30">cm</span></p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                  <div className="flex items-center text-green-400 space-x-2">
                    <Calendar size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Frecuencia</span>
                  </div>
                  <p className="text-2xl font-black">{selectedClient.training_days || '--'} <span className="text-xs text-foreground/30">días/sem</span></p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                  <div className="flex items-center text-yellow-500 space-x-2">
                    <Clock size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tiempo</span>
                  </div>
                  <p className="text-2xl font-black">{selectedClient.time_available || '--'} <span className="text-xs text-foreground/30">min/sesión</span></p>
                </div>
              </div>

              <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                <div className="flex items-center text-primary space-x-2 mb-4">
                  <Target size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">Metas y Objetivos</span>
                </div>
                <p className="text-foreground/70 leading-relaxed font-medium italic">
                  "{selectedClient.goals || 'Este atleta aún no ha definido sus objetivos específicos.'}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
