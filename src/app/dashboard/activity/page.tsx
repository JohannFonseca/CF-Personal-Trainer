'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { History, Calendar, CheckCircle2, Clock, Loader2, Dumbbell } from 'lucide-react';
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

      // For now, let's fetch completed routines (if we had a completions table)
      // Since we don't have a completions table yet, let's show assignments as "Recent Activity"
      // In a real app, we'd have a 'workout_logs' table.
      const { data } = await supabase
        .from('client_routines')
        .select('*, exercises(name)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      setActivities(data || []);
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
          activities.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tight">{activity.exercises?.name}</h4>
                  <div className="flex items-center space-x-2 text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">
                    <Calendar size={12} />
                    <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Completado</p>
                <div className="flex items-center justify-end space-x-1 text-foreground/40 mt-1">
                  <Clock size={10} />
                  <span className="text-[10px] font-bold">12:45 PM</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
