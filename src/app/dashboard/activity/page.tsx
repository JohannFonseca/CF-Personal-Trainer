'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { History, Calendar, CheckCircle2, Clock, Loader2, Dumbbell, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: logs } = await supabase
        .from('workout_logs')
        .select('*, exercises(name)')
        .eq('client_id', user.id)
        .order('completed_at', { ascending: false });

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('client_id', user.id)
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false });

      // Merge and sort by date
      const merged = [
        ...(logs || []).map(l => ({ ...l, type: 'exercise', date: l.completed_at })),
        ...(sessions || []).map(s => ({ ...s, type: 'session', date: s.finished_at }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(merged);
      setLoading(false);
    };
    fetchActivity();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 pb-12 space-y-8">
      <header>
        <h2 className="text-3xl font-black tracking-tighter">ACTIVIDAD</h2>
        <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest mt-1">Historial de entrenamientos</p>
      </header>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="py-24 text-center bg-card rounded-[2.5rem] border border-dashed border-white/10">
            <History size={48} className="mx-auto text-foreground/10 mb-4" />
            <h4 className="text-xl font-black mb-2">Sin actividad reciente</h4>
            <p className="text-foreground/40 text-sm max-w-[200px] mx-auto">Tus entrenamientos completados aparecerán aquí.</p>
          </div>
        ) : (
          activities.map((activity, i) => {
            const isSession = activity.type === 'session';
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass-card p-6 border flex items-center justify-between ${
                  isSession ? 'bg-primary/10 border-primary/20' : 'border-white/5'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isSession ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {isSession ? <Trophy size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tight">
                      {isSession ? 'Sesión de Entrenamiento' : activity.exercises?.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">
                      <Calendar size={12} />
                      <span>{new Date(activity.date).toLocaleDateString()}</span>
                      {isSession && (
                        <>
                          <span className="mx-1">•</span>
                          <Clock size={12} />
                          <span>{activity.duration_minutes} min</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                    isSession ? 'text-primary' : 'text-green-500'
                  }`}>
                    {isSession ? 'Finalizado' : 'Completado'}
                  </p>
                  <div className="flex items-center justify-end space-x-1 text-foreground/40 mt-1">
                    <Clock size={10} />
                    <span className="text-[10px] font-bold">
                      {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
