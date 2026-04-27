'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, Activity, TrendingUp, Calendar, 
  ChevronRight, Dumbbell, PlayCircle, Clock, Loader2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    exercises: 0,
    pending: 0
  });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }

      // 1. Total Atletas
      const { count: clientCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client');

      // 2. Total Ejercicios
      const { count: exerciseCount } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      // 3. Pendientes de Rutina
      const { data: allClients } = await supabase.from('profiles').select('id').eq('role', 'client');
      const { data: assigned } = await supabase.from('client_routines').select('client_id');
      
      const assignedIds = new Set((assigned || []).map(a => a.client_id));
      const pendingCount = (allClients || []).filter(c => !assignedIds.has(c.id)).length;

      setStats({
        clients: clientCount || 0,
        exercises: exerciseCount || 0,
        pending: pendingCount
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const coachName = profile?.full_name?.split(' ')[0] || 'Coach';

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">SISTEMA DE GESTIÓN</p>
        <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase text-balance transition-all">Hola, {coachName}.</h1>
      </header>

      {/* Stats Realistas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 bg-primary/5 border-primary/20">
          <div className="flex justify-between items-start mb-6">
            <Users className="text-primary" size={24} />
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total</span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.clients}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Atletas Atendidos</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
          <div className="flex justify-between items-start mb-6">
            <Dumbbell className="text-blue-400" size={24} />
            <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-widest">Contenido</span>
          </div>
          <h3 className="text-5xl font-black tracking-tighter mb-1">{stats.exercises}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Ejercicios Disponibles</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`glass-card p-8 border-dashed transition-colors ${stats.pending > 0 ? 'bg-orange-500/5 border-orange-500/30' : 'bg-green-500/5 border-green-500/30'}`}>
          <div className="flex justify-between items-start mb-6">
            <AlertCircle className={stats.pending > 0 ? 'text-orange-500' : 'text-green-500'} size={24} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${stats.pending > 0 ? 'text-orange-500/40' : 'text-green-500/40'}`}>Atención</span>
          </div>
          <h3 className={`text-5xl font-black tracking-tighter mb-1 ${stats.pending > 0 ? 'text-orange-500' : 'text-green-500'}`}>{stats.pending}</h3>
          <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Sin Rutina Asignada</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Próximos Pasos</h2>
          <div className="space-y-4">
            {stats.pending > 0 ? (
              <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Tienes trabajo pendiente</p>
                  <p className="text-xs text-orange-500/70 font-bold uppercase tracking-widest">{stats.pending} atletas necesitan su primer plan.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">¡Todo al día!</p>
                  <p className="text-xs text-green-500/70 font-bold uppercase tracking-widest">Todos tus atletas tienen rutinas activas.</p>
                </div>
              </div>
            )}
            
            <Link href="/admin/clients" className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/5 group">
              <div className="flex items-center space-x-4">
                <Users size={20} className="text-foreground/40 group-hover:text-primary transition-colors" />
                <span className="font-bold uppercase text-sm tracking-tight">Ir a lista de Atletas</span>
              </div>
              <ChevronRight size={18} className="text-foreground/20 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-black tracking-tight uppercase">Resumen de Biblioteca</h2>
          <div className="glass-card p-8 bg-card border-white/5">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                <Dumbbell size={24} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Catálogo de Ejercicios</p>
                <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">Base de datos técnica</p>
              </div>
            </div>
            <p className="text-xs text-foreground/40 font-medium leading-relaxed mb-6">
              Mantén tu biblioteca actualizada con videos de buena calidad para que tus alumnos no tengan dudas sobre la técnica.
            </p>
            <Link href="/admin/exercises" className="block w-full text-center py-4 bg-blue-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">
              Gestionar Ejercicios
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
