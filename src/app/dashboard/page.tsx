'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Clock, Dumbbell, 
  CheckCircle2, Trophy, Flame, Hash, Activity, Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type RoutineEntry = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: string;
  rest_time: number;
  exercises: {
    name: string;
    muscle_group: string;
    media_url: string | null;
  };
};

export default function WorkoutsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [routines, setRoutines] = useState<RoutineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: routinesData } = await supabase
        .from('client_routines')
        .select('*, exercises(name, muscle_group, media_url)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: true });

      setProfile(profileData);
      setRoutines(routinesData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const firstName = profile?.full_name?.split(' ')[0]?.toUpperCase() || 'CAMPEÓN';

  return (
    <div className="p-6 space-y-10 pb-12">
      {/* Welcome Header */}
      <header className="space-y-1">
        <h2 className="text-3xl font-black tracking-tighter">HOLA, {firstName}.</h2>
        <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest flex items-center">
          <Trophy size={14} className="mr-2 text-yellow-500" />
          {routines.length} ejercicios en tu plan
        </p>
      </header>

      {/* Goals Card */}
      {profile?.goals && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-primary/20 bg-primary/5"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Tu Objetivo</p>
              <h3 className="text-lg font-black leading-snug">{profile.goals}</h3>
            </div>
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Flame size={24} fill="currentColor" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 mt-4">
            <div className="text-center">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Días/Sem</p>
              <p className="text-xl font-black">{profile.training_days || '--'}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Sesión</p>
              <p className="text-xl font-black">{profile.time_available || '--'}<span className="text-xs">m</span></p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Ejercicios</p>
              <p className="text-xl font-black">{routines.length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Assigned Routines List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight uppercase">Tu Rutina</h3>
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">{routines.length} ejercicios</span>
        </div>

        {routines.length === 0 ? (
          <div className="py-24 text-center bg-card rounded-[2.5rem] border border-dashed border-white/10">
            <Dumbbell size={48} className="mx-auto text-foreground/10 mb-4" />
            <h4 className="text-xl font-black mb-2">Sin rutina asignada</h4>
            <p className="text-foreground/40 text-sm max-w-[200px] mx-auto">Tu entrenador aún no ha asignado ejercicios.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routines.map((routine, i) => (
              <motion.div
                key={routine.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group glass-card p-6 border border-white/5 hover:bg-white/[0.03] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-black uppercase tracking-tight">{routine.exercises?.name}</h4>
                      <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                        {routine.exercises?.muscle_group}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Series</p>
                    <p className="text-xl font-black italic">{routine.sets}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1">Reps</p>
                    <p className="text-xl font-black italic">{routine.reps}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-foreground/20 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                      <Clock size={9} />Descanso
                    </p>
                    <p className="text-xl font-black italic">{routine.rest_time}s</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
