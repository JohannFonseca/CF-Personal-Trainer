'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Activity, TrendingUp, Calendar, 
  ChevronRight, Dumbbell, PlayCircle, Clock, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    exercises: 0,
    activeThisWeek: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const { count: clientCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: exerciseCount } = await supabase.from('exercises').select('*', { count: 'exact', head: true });
      
      setStats({
        clients: clientCount || 0,
        exercises: exerciseCount || 0,
        activeThisWeek: clientCount || 0 // Real count for now
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Panel de Control</p>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase">Hola, Coach.</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 bg-primary/5">
          <Users className="text-primary mb-4" size={24} />
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.clients}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Atletas Registrados</p>
        </div>

        <div className="glass-card p-8">
          <Dumbbell className="text-blue-400 mb-4" size={24} />
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.exercises}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Ejercicios en Biblioteca</p>
        </div>

        <div className="glass-card p-8">
          <Activity className="text-green-500 mb-4" size={24} />
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.activeThisWeek}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Atletas Activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Actividad Reciente</h2>
          <div className="bg-card/50 border border-dashed border-white/10 rounded-[3rem] py-20 text-center">
            <Activity size={48} className="mx-auto text-foreground/10 mb-4" />
            <p className="text-foreground/40 font-bold uppercase text-xs tracking-widest">Esperando actividad de tus atletas...</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Acceso Rápido</h2>
          <div className="glass-card p-8 bg-primary/10 space-y-4">
            <h4 className="font-bold text-primary italic">GESTIÓN DE ATLETAS</h4>
            <p className="text-xs text-foreground/40 font-medium">Revisa el progreso de tus alumnos y asigna nuevas metas.</p>
            <button onClick={() => window.location.href = '/admin/clients'} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase">
              Ver Clientes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
