'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, Dumbbell, Search, Filter, Loader2, 
  ChevronRight, Calendar, Clock, Trash2, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoutinesPage() {
  const [loading, setLoading] = useState(true);
  const [routines, setRoutines] = useState<any[]>([]);

  useEffect(() => {
    // Simulación de carga por ahora para evitar el 404
    setTimeout(() => setLoading(false), 500);
  }, []);

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
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Crea planes de entrenamiento maestros</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
          <Plus size={20} />
          <span>NUEVA RUTINA</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routines.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-card rounded-[3rem] border border-dashed border-white/10">
            <Dumbbell size={64} className="mx-auto text-foreground/10 mb-6" />
            <h3 className="text-2xl font-black mb-2">No has creado rutinas</h3>
            <p className="text-foreground/40 font-medium max-w-xs mx-auto">Comienza creando tu primer plan de entrenamiento para tus atletas.</p>
          </div>
        ) : (
          <p>Lista de rutinas aquí...</p>
        )}
      </div>
    </div>
  );
}
