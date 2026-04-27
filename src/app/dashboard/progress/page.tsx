'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { TrendingUp, Scale, Target, Activity, Loader2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      const { data: logs } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('client_id', user.id)
        .order('logged_at', { ascending: true });

      setProfile(profileData);
      
      // Format data for chart
      const chartData = logs?.map(log => ({
        date: new Date(log.logged_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        weight: parseFloat(log.weight)
      })) || [];
      
      setWeightHistory(chartData);
      setLoading(false);
    };
    fetchProgress();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const weightChange = weightHistory.length > 1 
    ? (weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)
    : 0;

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
            <TrendingUp size={14} className={`mr-2 ${Number(weightChange) <= 0 ? 'text-green-500' : 'text-red-500'}`} />
            {Number(weightChange) === 0 
              ? 'Manteniendo peso estable' 
              : `${weightChange > 0 ? '+' : ''}${weightChange} kg desde el inicio`
            }
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

      {/* Real Chart */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/30 ml-2">Gráfica de Evolución</h3>
        <div className="h-72 w-full glass-card p-4 border-white/5">
          {weightHistory.length < 2 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-30">
              <TrendingUp size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Se necesitan más registros para graficar</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightHistory}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '900'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}
