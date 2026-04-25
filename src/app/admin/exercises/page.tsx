'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, Trash2, ExternalLink, Filter, Loader2, 
  X, Play, Image as ImageIcon, Search, Upload, Camera
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
  const [uploading, setUploading] = useState(false);
  
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('exercises')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo archivo: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exercises')
      .getPublicUrl(filePath);

    setNewExercise({ ...newExercise, media_url: publicUrl });
    setUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('exercises').insert([newExercise]);
    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      setShowAddModal(false);
      setNewExercise({ name: '', muscle_group: 'Pecho', media_url: '', difficulty: 'Intermedio' });
      fetchExercises();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Borrar este ejercicio?')) {
      await supabase.from('exercises').delete().eq('id', id);
      fetchExercises();
    }
  };

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase">Biblioteca.</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">{exercises.length} Ejercicios cargados</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar..."
              className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {exercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).map((ex) => (
          <motion.div key={ex.id} layout className="glass-card overflow-hidden group border border-white/5">
            <div className="aspect-video relative overflow-hidden bg-black/40">
              {ex.media_url ? (
                <div className="absolute inset-0 flex items-center justify-center">
                   <Play size={40} className="text-white/20 group-hover:text-primary transition-all" />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/10 italic font-black uppercase text-[10px]">Sin Video</div>
              )}
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black tracking-tight">{ex.name}</h3>
                <button onClick={() => handleDelete(ex.id)} className="text-foreground/20 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
              <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-full">{ex.muscle_group}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-card border border-white/10 rounded-[3rem] p-10 shadow-2xl">
              <h2 className="text-2xl font-black tracking-tighter mb-8 text-center uppercase">Añadir Ejercicio</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Nombre</label>
                  <input required type="text" className="w-full bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold outline-none" value={newExercise.name} onChange={e => setNewExercise({...newExercise, name: e.target.value})} />
                </div>
                
                {/* File Upload Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2 block ml-1">Video o Foto (Galería/Cámara)</label>
                  <label className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${newExercise.media_url ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-primary/50 bg-white/5'}`}>
                    <input type="file" accept="video/*,image/*" className="hidden" onChange={handleFileUpload} />
                    {uploading ? (
                      <Loader2 className="animate-spin text-primary" size={32} />
                    ) : newExercise.media_url ? (
                      <div className="flex flex-col items-center text-green-500">
                        <Plus size={32} className="rotate-45" />
                        <span className="text-[10px] font-black uppercase mt-1">Archivo Cargado</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-foreground/20">
                        <Camera size={32} />
                        <span className="text-[10px] font-black uppercase mt-1">Subir desde celular</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select className="bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold" value={newExercise.muscle_group} onChange={e => setNewExercise({...newExercise, muscle_group: e.target.value})}>
                    {['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazos', 'Core', 'Cardio'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="bg-background border border-white/5 rounded-2xl px-6 py-4 font-bold" value={newExercise.difficulty} onChange={e => setNewExercise({...newExercise, difficulty: e.target.value})}>
                    {['Principiante', 'Intermedio', 'Avanzado'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={uploading || loading} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 uppercase">
                  {loading ? 'Guardando...' : 'Crear Ejercicio'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
