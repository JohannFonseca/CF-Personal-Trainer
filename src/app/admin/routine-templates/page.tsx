'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, Trash2, Edit3, Dumbbell, Search, 
  Loader2, X, Check, ChevronRight, Hash, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Exercise = {
  id: string;
  name: string;
  muscle_group: string;
};

type Routine = {
  id: string;
  name: string;
  description: string;
  routine_exercises?: any[];
};

export default function RoutineTemplatesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedExercises: [] as any[]
  });

  const fetchRoutines = async () => {
    const { data } = await supabase
      .from('routines')
      .select('*, routine_exercises(*, exercises(*))')
      .order('created_at', { ascending: false });
    setRoutines(data || []);
    setLoading(false);
  };

  const fetchExercises = async () => {
    const { data } = await supabase.from('exercises').select('*').order('name');
    setExercises(data || []);
  };

  useEffect(() => {
    fetchRoutines();
    fetchExercises();
  }, []);

  const handleAddExerciseToTemplate = (exercise: Exercise) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: [
        ...prev.selectedExercises,
        {
          exercise_id: exercise.id,
          name: exercise.name,
          sets: 3,
          reps: '12',
          rest_time: 60
        }
      ]
    }));
  };

  const removeExerciseFromTemplate = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.filter((_, i) => i !== idx)
    }));
  };

  const updateExerciseInTemplate = (idx: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map((ex, i) => 
        i === idx ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setLoading(true);

    try {
      let routineId = editingRoutine?.id;

      if (editingRoutine) {
        // Update routine
        await supabase.from('routines').update({
          name: formData.name,
          description: formData.description
        }).eq('id', routineId);

        // Delete old exercises
        await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
      } else {
        // Create routine
        const { data } = await supabase.from('routines').insert({
          name: formData.name,
          description: formData.description
        }).select().single();
        routineId = data.id;
      }

      // Insert exercises
      const inserts = formData.selectedExercises.map((ex, idx) => ({
        routine_id: routineId,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        rest_time: ex.rest_time,
        order_index: idx
      }));

      await supabase.from('routine_exercises').insert(inserts);
      
      setShowModal(false);
      setEditingRoutine(null);
      setFormData({ name: '', description: '', selectedExercises: [] });
      fetchRoutines();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormData({
      name: routine.name,
      description: routine.description || '',
      selectedExercises: routine.routine_exercises?.map(re => ({
        exercise_id: re.exercise_id,
        name: re.exercises?.name,
        sets: re.sets,
        reps: re.reps,
        rest_time: re.rest_time
      })) || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Borrar esta rutina preestablecida?')) {
      await supabase.from('routines').delete().eq('id', id);
      fetchRoutines();
    }
  };

  if (loading && routines.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic">Plantillas.</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Crea rutinas para asignar rápidamente</p>
        </div>
        <button 
          onClick={() => {
            setEditingRoutine(null);
            setFormData({ name: '', description: '', selectedExercises: [] });
            setShowModal(true);
          }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>NUEVA PLANTILLA</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((routine) => (
          <motion.div 
            key={routine.id}
            layout
            className="glass-card p-8 border border-white/5 hover:bg-white/[0.02] transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Dumbbell size={24} />
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(routine)} className="p-2 text-foreground/20 hover:text-primary transition-colors"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(routine.id)} className="p-2 text-foreground/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <h3 className="text-2xl font-black tracking-tight uppercase italic mb-2">{routine.name}</h3>
            <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest mb-6">{routine.routine_exercises?.length || 0} Ejercicios</p>
            
            <div className="space-y-2 mb-8">
              {routine.routine_exercises?.slice(0, 3).map((re, i) => (
                <div key={i} className="flex items-center space-x-2 text-[10px] font-bold text-foreground/60 uppercase">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <span>{re.exercises?.name}</span>
                </div>
              ))}
              {(routine.routine_exercises?.length || 0) > 3 && (
                <p className="text-[10px] font-bold text-primary uppercase">+{routine.routine_exercises!.length - 3} más...</p>
              )}
            </div>

            <button 
              onClick={() => handleEdit(routine)}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              Gestionar Plantilla
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="relative w-full max-w-5xl h-full md:h-[90vh] bg-card border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row no-scrollbar"
            >
              {/* Left: Exercises */}
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-black/20 shrink-0 md:shrink">
                <div className="p-8 space-y-6">
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Añadir Ejercicios</h2>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                    <input 
                      type="text"
                      placeholder="Buscar ejercicio..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                    />
                  </div>
                </div>
                <div className="md:flex-1 overflow-y-visible md:overflow-y-auto px-8 pb-8 space-y-2 no-scrollbar">
                  {exercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleAddExerciseToTemplate(ex)}
                      className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group"
                    >
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase tracking-tight">{ex.name}</p>
                        <p className="text-[9px] font-black text-primary/60 uppercase">{ex.muscle_group}</p>
                      </div>
                      <Plus size={16} className="text-foreground/20 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Template Form */}
              <div className="w-full md:w-1/2 flex flex-col h-full">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-card md:bg-transparent sticky top-0 z-10">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic text-primary">Detalles de Plantilla</h2>
                  <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 rounded-2xl text-foreground/40 hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="md:flex-1 overflow-y-visible md:overflow-y-auto p-8 space-y-6 no-scrollbar">
                  <div className="space-y-4">
                    <input 
                      placeholder="Nombre de la rutina (ej: Empuje A)"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-black text-xl uppercase italic outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <textarea 
                      placeholder="Descripción u objetivos..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/30 ml-2">Ejercicios en la plantilla ({formData.selectedExercises.length})</h3>
                    {formData.selectedExercises.map((ex, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 relative">
                        <button onClick={() => removeExerciseFromTemplate(idx)} className="absolute top-4 right-4 text-foreground/10 hover:text-red-500"><Trash2 size={16} /></button>
                        <h4 className="font-black uppercase italic tracking-tight mb-4">{ex.name}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1 text-center">
                            <span className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Sets</span>
                            <input 
                              type="number"
                              className="w-full bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-center font-black"
                              value={ex.sets}
                              onChange={e => updateExerciseInTemplate(idx, 'sets', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Reps</span>
                            <input 
                              type="text"
                              className="w-full bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-center font-black"
                              value={ex.reps}
                              onChange={e => updateExerciseInTemplate(idx, 'reps', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1 text-center">
                            <span className="text-[9px] font-black uppercase text-foreground/20 tracking-widest">Desc.</span>
                            <input 
                              type="number"
                              className="w-full bg-black/40 border border-white/5 rounded-xl px-2 py-2 text-center font-black"
                              value={ex.rest_time}
                              onChange={e => updateExerciseInTemplate(idx, 'rest_time', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white/[0.02] border-t border-white/5">
                  <button 
                    onClick={handleSave}
                    disabled={!formData.name || formData.selectedExercises.length === 0 || loading}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 uppercase tracking-widest flex items-center justify-center space-x-2"
                  >
                    <Check size={20} />
                    <span>{editingRoutine ? 'Guardar Cambios' : 'Crear Plantilla'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
