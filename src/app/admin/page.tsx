'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, Activity, LogOut, Loader2, AlertCircle, 
  UserCircle, ShieldCheck, Search, Plus, 
  Dumbbell, Weight, Move, User, Clock, Trash2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPER_ADMINS = ['arielfonseca049@gmail.com', 'jhnfonseca22@gmail.com'];

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

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  media_url: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [view, setView] = useState<'clients' | 'exercises'>('clients');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Profile[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [adminProfile, setAdminProfile] = useState<{name: string} | null>(null);
  
  // Modales
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  
  // Form Exercise
  const [newExercise, setNewExercise] = useState({ name: '', muscle_group: 'Pecho', media_url: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      const isSuper = SUPER_ADMINS.includes(user.email?.toLowerCase().trim() || '');
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (!isSuper && profile?.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }

      setAdminProfile({ name: profile?.full_name || user.email?.split('@')[0] || 'Coach' });

      // Cargar Clientes
      const { data: pData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setClients(pData || []);

      // Cargar Ejercicios
      const { data: eData } = await supabase.from('exercises').select('*').order('name');
      setExercises(eData || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('exercises').insert([newExercise]);
    if (!error) {
      setShowAddExercise(false);
      setNewExercise({ name: '', muscle_group: 'Pecho', media_url: '' });
      fetchData();
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (confirm('¿Seguro que quieres borrar este ejercicio?')) {
      await supabase.from('exercises').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Sincronizando Base de Datos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-72 bg-card border-r border-white/5 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic">CF TRAINER</h1>
          </div>
          <nav className="space-y-2">
            <button 
              onClick={() => setView('clients')}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-black transition-all ${view === 'clients' ? 'bg-primary/10 text-primary' : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'}`}
            >
              <Users size={20} />
              <span>Mis Clientes</span>
            </button>
            <button 
              onClick={() => setView('exercises')}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-2xl font-black transition-all ${view === 'exercises' ? 'bg-primary/10 text-primary' : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'}`}
            >
              <Activity size={20} />
              <span>Ejercicios</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-400 py-4 rounded-2xl font-black text-xs hover:bg-red-500/20 transition-all">
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-auto">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black tracking-tight">{view === 'clients' ? 'Mis Atletas' : 'Biblioteca de Ejercicios'}</h2>
          {view === 'exercises' && (
            <button 
              onClick={() => setShowAddExercise(true)}
              className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              <Plus size={20} />
              <span>Nuevo Ejercicio</span>
            </button>
          )}
        </header>

        {view === 'clients' ? (
          <div className="grid gap-4">
            {clients.length === 0 ? (
              <div className="bg-card border border-dashed border-white/10 rounded-[3rem] py-20 text-center">
                <UserCircle size={64} className="mx-auto text-foreground/10 mb-4" />
                <p className="text-foreground/40 font-bold">No hay clientes todavía. Revisa los permisos SQL.</p>
              </div>
            ) : (
              clients.map(client => (
                <div key={client.id} className="bg-card border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-primary/20 flex items-center justify-center text-primary font-black text-2xl">
                      {(client.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{client.full_name || 'Sin nombre'}</h4>
                      <p className="text-xs font-bold text-foreground/30 uppercase">{client.goals || 'Sin objetivo'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 md:mt-0">
                    <button onClick={() => setSelectedClient(client)} className="bg-white/5 px-6 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">Detalles</button>
                    <button className="bg-primary text-white px-6 py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/10">Asignar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {exercises.map(ex => (
              <div key={ex.id} className="bg-card border border-white/5 rounded-[2.5rem] p-8 space-y-4 group">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                    <Dumbbell size={24} />
                  </div>
                  <button onClick={() => handleDeleteExercise(ex.id)} className="p-2 text-foreground/20 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <h4 className="text-xl font-black">{ex.name}</h4>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">{ex.muscle_group}</p>
                </div>
                {ex.media_url && (
                  <a href={ex.media_url} target="_blank" className="flex items-center space-x-2 text-xs font-bold text-foreground/40 hover:text-foreground transition-colors pt-2">
                    <ExternalLink size={14} />
                    <span>Ver Video / Imagen</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Add Exercise */}
      <AnimatePresence>
        {showAddExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddExercise(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-card border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 text-center">Nuevo Ejercicio</h3>
              <form onSubmit={handleAddExercise} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Nombre</label>
                  <input type="text" required className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Músculo</label>
                  <select className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 outline-none" value={newExercise.muscle_group} onChange={e => setNewExercise({...newExercise, muscle_group: e.target.value})}>
                    {['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block">Link de Video (YouTube/IG)</label>
                  <input type="url" className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/20" value={newExercise.media_url} onChange={e => setNewExercise({...newExercise, media_url: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">CREAR EJERCICIO</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Profile (Simplificado) */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClient(null)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-card border border-white/10 rounded-[3rem] p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 italic">{(selectedClient.full_name || '?').charAt(0)}</div>
                <h3 className="text-3xl font-black">{selectedClient.full_name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[10px] uppercase font-bold text-primary">Peso</p><p className="text-xl font-black">{selectedClient.weight} kg</p></div>
                <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[10px] uppercase font-bold text-blue-400">Altura</p><p className="text-xl font-black">{selectedClient.height} cm</p></div>
              </div>
              <div className="mt-4 bg-primary/5 p-6 rounded-2xl italic text-foreground/70 text-center">"{selectedClient.goals}"</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
