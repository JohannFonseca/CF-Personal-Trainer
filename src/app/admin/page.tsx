'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Activity, TrendingUp, Calendar, 
  ChevronRight, Dumbbell, PlayCircle, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    routines: 0,
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
        routines: exerciseCount || 0,
        activeThisWeek: Math.ceil((clientCount || 0) * 0.8) // Mock for now
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-6 lg:p-12 space-y-12">
      {/* Header */}
      <header className="flex flex-col space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sábado, 24 de Abril</p>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">HOLA, COACH.</h1>
      </header>

      {/* Hero Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={item} className="glass-card p-8 group hover:bg-primary/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.clients}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Atletas Totales</p>
        </motion.div>

        <motion.div variants={item} className="glass-card p-8 group hover:bg-blue-500/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Dumbbell size={24} />
            </div>
            <Activity size={20} className="text-blue-400" />
          </div>
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.routines}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Ejercicios en Biblioteca</p>
        </motion.div>

        <motion.div variants={item} className="glass-card p-8 group hover:bg-green-500/5 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded-lg font-black">+12%</span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.activeThisWeek}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Activos esta Semana</p>
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Actividad Reciente</h2>
            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Ver Todo</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white">
                  <PlayCircle size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Juan Pérez completó "Pierna A"</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock size={12} className="text-foreground/30" />
                    <span className="text-[10px] font-bold text-foreground/30 uppercase">Hace 2 horas</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-foreground/20" />
              </div>
            ))}
          </div>
        </section>

        {/* Quick Assignments */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Próximos Entrenamientos</h2>
            <Calendar size={20} className="text-foreground/20" />
          </div>
          <div className="glass-card overflow-hidden">
            <div className="p-8 bg-primary/10 border-b border-white/5">
              <h4 className="font-bold text-primary mb-1 italic text-lg tracking-tight">REVISIÓN DE RUTINAS</h4>
              <p className="text-xs text-foreground/40 font-medium">Tienes 4 atletas esperando una rutina nueva para mañana.</p>
            </div>
            <div className="p-8">
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                ASIGNAR AHORA
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
