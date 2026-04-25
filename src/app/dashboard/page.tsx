'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Clock, Dumbbell, ChevronRight, 
  CheckCircle2, Trophy, Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function WorkoutsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  const routines = [
    { 
      id: '1', 
      name: 'Pierna Explosiva', 
      day: 'Día 1', 
      duration: '45 min', 
      progress: 0,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400' 
    },
    { 
      id: '2', 
      name: 'Empuje (Pecho/Hombro)', 
      day: 'Día 2', 
      duration: '60 min', 
      progress: 100,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a7403f?auto=format&fit=crop&q=80&w=400'
    }
  ];

  return (
    <div className="p-6 space-y-10 pb-12">
      {/* Welcome Header */}
      <header className="space-y-1">
        <h2 className="text-3xl font-black tracking-tighter">HOLA, {user?.email?.split('@')[0].toUpperCase() || 'CAMPEÓN'}.</h2>
        <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest flex items-center">
          <Trophy size={14} className="mr-2 text-yellow-500" />
          Nivel 1 • 2.450 pts
        </p>
      </header>

      {/* Daily Progress Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-primary/20 bg-primary/5"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Tu Meta Hoy</p>
            <h3 className="text-xl font-black">Completar Entrenamiento</h3>
          </div>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-foreground/40">
            <span>Progreso Semanal</span>
            <span>60%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              className="h-full bg-primary rounded-full shadow-lg shadow-primary/40"
            />
          </div>
        </div>
      </motion.div>

      {/* Assigned Routines List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight uppercase">Tus Rutinas</h3>
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Semana 12</span>
        </div>

        <div className="space-y-4">
          {routines.map((routine, i) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-48 rounded-[2.5rem] overflow-hidden border border-white/10"
            >
              <img 
                src={routine.image} 
                alt={routine.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{routine.day}</p>
                    <h4 className="text-2xl font-black tracking-tighter text-white">{routine.name}</h4>
                    <div className="flex items-center space-x-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{routine.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Dumbbell size={12} />
                        <span>Fuerza</span>
                      </div>
                    </div>
                  </div>
                  
                  {routine.progress === 100 ? (
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <button className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                      <Play size={20} fill="currentColor" />
                    </button>
                  )}
                </div>
              </div>

              {routine.progress === 100 && (
                <div className="absolute top-6 right-6">
                  <span className="bg-green-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Completado</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Motivational Quote */}
      <footer className="py-12 text-center space-y-4">
        <div className="w-12 h-1 bg-white/5 mx-auto rounded-full" />
        <p className="text-sm font-bold italic text-foreground/40 leading-relaxed max-w-[200px] mx-auto">
          "El único entrenamiento malo es el que no sucedió."
        </p>
      </footer>

    </div>
  );
}
