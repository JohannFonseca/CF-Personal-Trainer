'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, Dumbbell, Search, Filter, Loader2, 
  ChevronRight, Calendar, Clock, Trash2, Edit3,
  User, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RoutineWithInfo = {
  id: string;
  client_id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  assigned_date: string;
  profiles: { full_name: string };
  exercises: { name: string, muscle_group: string };
};

export default function RoutinesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<RoutineWithInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRoutines = async () => {
    const { data } = await supabase
      .from('client_routines')
      .select(`
        *,
        profiles:client_id (full_name),
        exercises:exercise_id (name, muscle_group)
      `)
      .order('created_at', { ascending: false });
    
    setRoutines(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta asignación de rutina?')) {
      const { error } = await supabase.from('client_routines').delete().eq('id', id);
      if (!error) fetchRoutines();
    }
  };

  const filteredRoutines = routines.filter(r => 
    r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.exercises?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase">Rutinas.</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Control global de entrenamientos</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por atleta o ejercicio..."
              className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => window.location.href = '/admin/clients'}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">NUEVA ASIGNACIÓN</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {filteredRoutines.length === 0 ? (
          <div className="py-32 text-center bg-card rounded-[3rem] border border-dashed border-white/10">
            <Dumbbell size={64} className="mx-auto text-foreground/10 mb-6" />
            <h3 className="text-2xl font-black mb-2">No hay rutinas asignadas</h3>
            <p className="text-foreground/40 font-medium max-w-xs mx-auto">Ve a la sección de atletas para asignar planes de entrenamiento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRoutines.map((routine) => (
              <motion.div 
                key={routine.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.02] transition-all border border-white/5"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase italic">{routine.profiles?.full_name}</h3>
                    <div className="flex items-center space-x-3 text-xs font-bold text-foreground/30 uppercase tracking-widest mt-1">
                      <Activity size={14} className="text-primary" />
                      <span>{routine.exercises?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 px-6 border-l border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Series</p>
                    <p className="text-xl font-black italic">{routine.sets}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Reps</p>
                    <p className="text-xl font-black italic">{routine.reps}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Descanso</p>
                    <p className="text-xl font-black italic">{routine.rest_time}s</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleDelete(routine.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
