'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, Target, Activity, Loader2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchProgress();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 pb-12 space-y-10">
      <header>
        <h2 className="text-3xl font-black tracking-tighter uppercase">Progreso</h2>
        <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest mt-1">Tu evolución física</p>
      </header>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 bg-primary/5 border-primary/20"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
              <Scale size={24} />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Peso Actual</span>
          </div>
          <div className="flex items-end space-x-2">
            <h3 className="text-5xl font-black tracking-tighter">{profile?.weight || '--'}</h3>
            <span className="text-xl font-black text-foreground/20 italic mb-1">KG</span>
          </div>
          <p className="text-xs font-bold text-foreground/40 mt-4 uppercase tracking-widest flex items-center">
            <TrendingUp size={14} className="mr-2 text-green-500" />
            Manteniendo peso estable
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-6 bg-blue-500/5 border-blue-500/10">
            <div className="flex items-center text-blue-400 space-x-2 mb-4">
              <Target size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Meta</span>
            </div>
            <p className="text-sm font-bold text-foreground/60 leading-relaxed italic truncate">
              {profile?.goals || 'No definida'}
            </p>
          </div>
          <div className="glass-card p-6 bg-yellow-500/5 border-yellow-500/10">
            <div className="flex items-center text-yellow-500 space-x-2 mb-4">
              <Activity size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Nivel</span>
            </div>
            <p className="text-sm font-bold text-foreground/60 leading-relaxed italic">
              Intermedio
            </p>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 ml-2">Gráfica de Evolución</h3>
        <div className="h-64 glass-card border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="w-4 bg-primary/20 rounded-t-lg"
              />
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Próximamente: Gráficas detalladas</p>
        </div>
      </section>
    </div>
  );
}
