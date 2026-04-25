'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Activity, Search, Plus, Trash2, ExternalLink, 
  Dumbbell, Filter, Loader2, X, Play, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
  media_url: string | null;
  difficulty: string;
};

export default function ExercisesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ 
    name: '', 
    muscle_group: 'Pecho', 
    media_url: '',
    difficulty: 'Intermedio'
  });

  const fetchExercises = async () => {
    const { data } = await supabase.from('exercises').select('*').order('name');
    setExercises(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('exercises').insert([newExercise]);
    if (!error) {
      setShowAddModal(false);
      setNewExercise({ name: '', muscle_group: 'Pecho', media_url: '', difficulty: 'Intermedio' });
      fetchExercises();
    }
    setLoading(false);
  };

  const filtered = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && exercises.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">BIBLIOTECA.</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">{exercises.length} Ejercicios disponibles</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar ejercicio..."
              className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map((ex) => (
          <motion.div
            key={ex.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card overflow-hidden group border border-white/5"
          >
            <div className="aspect-video relative overflow-hidden bg-black/40">
              {ex.media_url ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <Play size={48} className="text-white/20 group-hover:text-primary transition-colors group-hover:scale-125 transition-transform" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/10">
                  <ImageIcon size={64} strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase mt-2">Sin Media</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{ex.muscle_group}</span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black tracking-tight">{ex.name}</h3>
                <button className="p-2 text-foreground/20 hover:text-red-400 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${ex.difficulty === 'Principiante' ? 'bg-green-500' : ex.difficulty === 'Intermedio' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-black uppercase text-foreground/40">{ex.difficulty}</span>
                </div>
                {ex.media_url && (
                  <a href={ex.media_url} target="_blank" className="flex items-center space-x-2 text-[10px] font-black uppercase text-primary hover:underline">
                    <ExternalLink size={14} />
                    <span>Tutorial</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl"
            >
              <h2 className="text-3xl font-black tracking-tighter mb-8 text-center uppercase">Añadir Ejercicio</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Nombre del Ejercicio</label>
                  <input required type="text" className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Músculo</label>
                    <select className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold outline-none" value={newExercise.muscle_group} onChange={e => setNewExercise({...newExercise, muscle_group: e.target.value})}>
                      {['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazos', 'Core', 'Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Dificultad</label>
                    <select className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold outline-none" value={newExercise.difficulty} onChange={e => setNewExercise({...newExercise, difficulty: e.target.value})}>
                      {['Principiante', 'Intermedio', 'Avanzado'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Link de Video (YouTube/IG)</label>
                  <input type="url" className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://..." value={newExercise.media_url} onChange={e => setNewExercise({...newExercise, media_url: e.target.value})} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'GUARDAR EJERCICIO'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
