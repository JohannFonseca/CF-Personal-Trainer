'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  X, Search, Plus, Trash2, Dumbbell, 
  Clock, Hash, Activity, Check, Loader2, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  media_url: string | null;
}

interface AssignRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

interface RoutineItem {
  exercise_id: string;
  name: string;
  sets: number;
  reps: string;
  rest_time: number;
  day_of_week: number | null;
}

export default function AssignRoutineModal({ isOpen, onClose, clientId, clientName }: AssignRoutineModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExercises();
      fetchTemplates();
      setStatus(null);
      setShowTemplates(false);
    }
  }, [isOpen]);

  const fetchExercises = async () => {
    setLoading(true);
    const { data } = await supabase.from('exercises').select('*').order('name');
    setExercises(data || []);
    setLoading(false);
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('routines')
      .select('*, routine_exercises(*, exercises(name))')
      .order('name');
    setTemplates(data || []);
  };

  const handleLoadTemplate = (template: any) => {
    const templateExercises = template.routine_exercises.map((re: any) => ({
      exercise_id: re.exercise_id,
      name: re.exercises.name,
      sets: re.sets,
      reps: re.reps,
      rest_time: re.rest_time,
      day_of_week: null
    }));
    
    setSelectedExercises(templateExercises);
    setShowTemplates(false);
  };

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.find(ex => ex.exercise_id === exercise.id)) return;
    
    setSelectedExercises([
      ...selectedExercises,
      {
        exercise_id: exercise.id,
        name: exercise.name,
        sets: 3,
        reps: '12',
        rest_time: 60,
        day_of_week: null
      }
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.exercise_id !== exerciseId));
  };

  const updateRoutineItem = (exerciseId: string, field: keyof RoutineItem, value: any) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.exercise_id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleSave = async () => {
    if (selectedExercises.length === 0) return;
    
    setSaving(true);
    try {
      const inserts = selectedExercises.map(item => ({
        client_id: clientId,
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        rest_time: item.rest_time,
        day_of_week: item.day_of_week,
        notes: ''
      }));

      const { error } = await supabase.from('client_routines').insert(inserts);
      
      if (error) throw error;
      
      setStatus({ type: 'success', message: 'Rutina asignada correctamente' });
      setTimeout(() => {
        onClose();
        setSelectedExercises([]);
      }, 1500);
    } catch (error: any) {
      setStatus({ type: 'error', message: 'Error: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-background/95 backdrop-blur-2xl" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-5xl h-full md:h-[85vh] bg-card border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col md:flex-row no-scrollbar"
          >
            {/* Left Side: Exercise Selection */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/5 flex flex-col h-full bg-black/20 shrink-0 md:shrink">
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">{showTemplates ? 'Plantillas' : 'Biblioteca'}</h2>
                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{showTemplates ? 'Selecciona una rutina lista' : 'Busca y añade ejercicios'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      className={`p-3 rounded-2xl transition-all flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${
                        showTemplates ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-foreground/40 hover:bg-white/10'
                      }`}
                    >
                      <Copy size={16} />
                      <span className="hidden sm:inline">{showTemplates ? 'Ver Biblioteca' : 'Cargar Plantilla'}</span>
                    </button>
                    <div className="md:hidden">
                      <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl"><X size={20} /></button>
                    </div>
                  </div>
                </div>

                {!showTemplates && (
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={18} />
                    <input 
                      type="text"
                      placeholder="Filtrar por nombre o músculo..."
                      className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="md:flex-1 overflow-y-visible md:overflow-y-auto px-8 pb-8 space-y-3 custom-scrollbar no-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={32} />
                  </div>
                ) : showTemplates ? (
                  templates.map(temp => (
                    <button
                      key={temp.id}
                      onClick={() => handleLoadTemplate(temp)}
                      className="w-full p-6 bg-white/5 border border-white/5 rounded-[2rem] text-left hover:bg-primary/5 hover:border-primary/20 transition-all group"
                    >
                      <h4 className="font-black uppercase italic text-lg tracking-tight group-hover:text-primary transition-colors">{temp.name}</h4>
                      <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">{temp.routine_exercises?.length || 0} Ejercicios</p>
                    </button>
                  ))
                ) : (
                  filteredExercises.map(ex => {
                    const isSelected = selectedExercises.some(s => s.exercise_id === ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => isSelected ? removeExercise(ex.id) : addExercise(ex)}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                          isSelected 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-4 text-left">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-white/5 text-foreground/20'}`}>
                            <Dumbbell size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase tracking-tight">{ex.name}</p>
                            <p className="text-[10px] font-black text-primary/60 uppercase">{ex.muscle_group}</p>
                          </div>
                        </div>
                        {isSelected ? <Check size={18} className="text-primary" /> : <Plus size={18} className="text-foreground/10 group-hover:text-primary transition-colors" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Side: Configuration */}
            <div className="w-full md:w-1/2 flex flex-col h-full">
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between sticky top-0 z-10 bg-card md:bg-transparent">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic text-primary">Rutina para {clientName.split(' ')[0]}</h2>
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{selectedExercises.length} ejercicios seleccionados</p>
                </div>
                <button onClick={onClose} className="hidden md:block p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-foreground/40 hover:text-foreground"><X size={20} /></button>
              </div>

              <div className="md:flex-1 overflow-y-visible md:overflow-y-auto p-8 space-y-6 custom-scrollbar no-scrollbar">
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl text-xs font-bold border flex items-center mb-4 ${
                      status.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}
                  >
                    {status.type === 'success' ? <Check size={14} className="mr-2" /> : <X size={14} className="mr-2" />}
                    {status.message}
                  </motion.div>
                )}

                {selectedExercises.length === 0 ? (
                  <div className="h-full flex flex-row md:flex-col items-center justify-center text-center opacity-20 space-x-4 md:space-x-0 md:space-y-4">
                    <Activity size={64} />
                    <p className="text-xl font-black uppercase italic tracking-tighter">Selecciona ejercicios para comenzar</p>
                  </div>
                ) : (
                  selectedExercises.map((item, idx) => (
                    <motion.div 
                      key={item.exercise_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6 relative group"
                    >
                      <button 
                        onClick={() => removeExercise(item.exercise_id)}
                        className="absolute top-4 right-4 text-foreground/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-black text-primary/40 bg-primary/5 w-6 h-6 flex items-center justify-center rounded-lg">{idx + 1}</span>
                        <h4 className="font-black uppercase italic text-lg tracking-tight">{item.name}</h4>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-foreground/30 ml-2 flex items-center space-x-1">
                            <Hash size={10} />
                            <span>Series</span>
                          </label>
                          <input 
                            type="number" 
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-black text-center text-sm"
                            value={item.sets}
                            onChange={e => updateRoutineItem(item.exercise_id, 'sets', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-foreground/30 ml-2 flex items-center space-x-1">
                            <Activity size={10} />
                            <span>Reps</span>
                          </label>
                          <input 
                            type="text" 
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-black text-center text-sm"
                            value={item.reps}
                            onChange={e => updateRoutineItem(item.exercise_id, 'reps', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-foreground/30 ml-2 flex items-center space-x-1">
                            <Clock size={10} />
                            <span>Descanso (s)</span>
                          </label>
                          <input 
                            type="number" 
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 font-black text-center text-sm"
                            value={item.rest_time}
                            onChange={e => updateRoutineItem(item.exercise_id, 'rest_time', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5">
                <button 
                  disabled={selectedExercises.length === 0 || saving}
                  onClick={handleSave}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  <span>{saving ? 'Guardando...' : 'Finalizar y Asignar Rutina'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
