'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  day_of_week: number | null;
  notes: string | null;
  created_at: string;
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
  const [completing, setCompleting] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDay()); // Default to today

  const days = [
    { label: 'DOM', value: 0 },
    { label: 'LUN', value: 1 },
    { label: 'MAR', value: 2 },
    { label: 'MIE', value: 3 },
    { label: 'JUE', value: 4 },
    { label: 'VIE', value: 5 },
    { label: 'SAB', value: 6 },
    { label: 'TODO', value: null }
  ];

  useEffect(() => {
    let interval: any;
    if (isWorkoutActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, sessionStartTime]);

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
        .select('*, exercises(id, name, muscle_group, media_url)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: true });

      // Fetch today's completions
      const today = new Date().toISOString().split('T')[0];
      const { data: completions } = await supabase
        .from('workout_logs')
        .select('exercise_id')
        .eq('client_id', user.id)
        .gte('completed_at', today);

      // Check if there's an active session
      const { data: activeSession } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('client_id', user.id)
        .is('finished_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (activeSession) {
        setIsWorkoutActive(true);
        setSessionStartTime(new Date(activeSession.started_at));
      }

      setProfile(profileData);
      setRoutines(routinesData || []);
      setCompletedToday(completions?.map(c => c.exercise_id) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleStartWorkout = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startTime = new Date();
    const { error } = await supabase.from('workout_sessions').insert({
      client_id: user.id,
      started_at: startTime.toISOString()
    });

    if (!error) {
      setIsWorkoutActive(true);
      setSessionStartTime(startTime);
    }
  };

  const handleFinishWorkout = async () => {
    setFinishing(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !sessionStartTime) return;

    const finishTime = new Date();
    const duration = Math.floor((finishTime.getTime() - sessionStartTime.getTime()) / (1000 * 60));

    await supabase.from('workout_sessions')
      .update({ 
        finished_at: finishTime.toISOString(),
        duration_minutes: duration 
      })
      .eq('client_id', user.id)
      .is('finished_at', null);

    setIsWorkoutActive(false);
    setSessionStartTime(null);
    setElapsedTime(0);
    setFinishing(false);
    setShowSuccess(true);
    
    // Auto-hide success message after 4 seconds
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = async (exerciseId: string) => {
    if (!isWorkoutActive) {
      alert('Inicia el entrenamiento primero para marcar ejercicios.');
      return;
    }

    setCompleting(exerciseId);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('workout_logs').insert({
      client_id: user.id,
      exercise_id: exerciseId
    });

    if (!error) {
      setCompletedToday([...completedToday, exerciseId]);
    }
    setCompleting(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const firstName = profile?.full_name?.split(' ')[0]?.toUpperCase() || 'CAMPEÓN';
  const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();

  return (
    <div className="p-6 space-y-10 pb-32">
      {/* Welcome Header */}
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{todayDate}</p>
          <h2 className="text-3xl font-black tracking-tighter">HOLA, {firstName}.</h2>
          <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest flex items-center">
            <Trophy size={14} className="mr-2 text-yellow-500" />
            {routines.length} ejercicios en tu plan
          </p>
        </div>
        
        {isWorkoutActive && (
          <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xl font-black font-mono tracking-tighter text-primary">
              {formatTime(elapsedTime)}
            </span>
          </div>
        )}
      </header>

      {/* Day Selection Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight uppercase italic">Tu Semana</h3>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Selecciona un día</span>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {days.map((day) => {
          const isToday = day.value === new Date().getDay();
          return (
            <button
              key={day.label}
              onClick={() => setSelectedDay(day.value)}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition-all shrink-0 flex flex-col items-center ${
                selectedDay === day.value 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-white/5 text-foreground/40 hover:bg-white/10'
              }`}
            >
              <span>{day.label}</span>
              {isToday && (
                <span className={`text-[8px] mt-0.5 ${selectedDay === day.value ? 'text-white/70' : 'text-primary'}`}>
                  HOY
                </span>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Action Area */}
      {!isWorkoutActive ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary p-1 rounded-3xl"
        >
          <button 
            onClick={handleStartWorkout}
            className="w-full py-6 bg-primary text-white rounded-[1.4rem] font-black text-xl tracking-tighter uppercase shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
          >
            <Play size={24} fill="currentColor" />
            <span>Iniciar Entrenamiento</span>
          </button>
        </motion.div>
      ) : (
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Entrenamiento en curso</p>
            <h3 className="text-lg font-black italic">¡Dale con todo!</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right mr-4">
              <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Progreso Hoy</p>
              <p className="text-lg font-black">
                {completedToday.filter(id => routines.filter(r => selectedDay === null || r.day_of_week === selectedDay || r.day_of_week === null).map(r => r.exercise_id).includes(id)).length} / {routines.filter(r => selectedDay === null || r.day_of_week === selectedDay || r.day_of_week === null).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals Card */}
      {!isWorkoutActive && profile?.goals && (
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
          <h3 className="text-lg font-black tracking-tight uppercase">
            {isWorkoutActive ? 'Ejercicios de hoy' : 'Tu Rutina'}
          </h3>
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">
            {routines.filter(r => selectedDay === null || r.day_of_week === selectedDay || r.day_of_week === null).length} ejercicios
          </span>
        </div>

        {routines.filter(r => selectedDay === null || r.day_of_week === selectedDay || r.day_of_week === null).length === 0 ? (
          <div className="py-24 text-center bg-card rounded-[2.5rem] border border-dashed border-white/10">
            <Dumbbell size={48} className="mx-auto text-foreground/10 mb-4" />
            <h4 className="text-xl font-black mb-2">Sin ejercicios para este día</h4>
            <p className="text-foreground/40 text-sm max-w-[200px] mx-auto">Relájate o revisa otros días de tu plan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routines
              .filter(r => selectedDay === null || r.day_of_week === selectedDay || r.day_of_week === null)
              .map((routine, i) => {
              const isCompleted = completedToday.includes(routine.exercise_id);
              const isNew = new Date(routine.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000;
              
              return (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group glass-card p-6 border transition-all relative overflow-hidden ${
                    isCompleted 
                    ? 'border-green-500/20 bg-green-500/5 opacity-60 scale-[0.98]' 
                    : isWorkoutActive ? 'border-primary/20 bg-primary/[0.02]' : 'border-white/5 hover:bg-white/[0.03]'
                  }`}
                >
                  {isNew && !isCompleted && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-white text-[8px] font-black px-3 py-1 uppercase tracking-tighter rounded-bl-xl shadow-lg">
                        NUEVO
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        isCompleted ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={18} /> : i + 1}
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-tight">{routine.exercises?.name}</h4>
                        <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                          {routine.exercises?.muscle_group}
                        </span>
                      </div>
                    </div>

                    {!isCompleted && isWorkoutActive && (
                      <button
                        onClick={() => handleComplete(routine.exercise_id)}
                        disabled={completing === routine.exercise_id}
                        className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                      >
                        {completing === routine.exercise_id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}
                      </button>
                    )}
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

                  {routine.notes && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center">
                        <Activity size={10} className="mr-1" /> Nota del Coach
                      </p>
                      <p className="text-xs font-bold text-foreground/70 italic leading-relaxed">
                        "{routine.notes}"
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Finish Button */}
      <AnimatePresence>
        {isWorkoutActive && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-6 right-6 z-50"
          >
            <button
              onClick={handleFinishWorkout}
              disabled={finishing}
              className="w-full py-5 bg-green-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-green-500/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3"
            >
              {finishing ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>FINALIZAR ENTRENAMIENTO</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivational Quote */}
      <footer className="py-12 text-center space-y-4">
        <div className="w-12 h-1 bg-white/5 mx-auto rounded-full" />
        <p className="text-sm font-bold italic text-foreground/40 leading-relaxed max-w-[200px] mx-auto">
          "El único entrenamiento malo es el que no sucedió."
        </p>
      </footer>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              className="glass-card p-12 border-primary/50 bg-primary/10 text-center space-y-6 max-w-sm w-full"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/40">
                <Trophy size={48} className="text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black italic tracking-tighter uppercase">¡BRUTAL!</h3>
                <p className="text-foreground/60 font-bold uppercase tracking-widest text-xs">Entrenamiento finalizado con éxito</p>
              </div>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm"
              >
                ACEPTAR
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
