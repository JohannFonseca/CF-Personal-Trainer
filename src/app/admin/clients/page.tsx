'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, UserCircle, Search, Filter, 
  ChevronRight, Target, Activity, Loader2, X,
  Weight, Move, Calendar, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Profile = {
  id: string;
  full_name: string | null;
  goals: string | null;
  training_days: number | null;
  weight: number | null;
  height: number | null;
  time_available: number | null;
  created_at: string;
};

export default function ClientsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setClients(data || []);
      setLoading(false);
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-6 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter">MIS ATLETAS.</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mt-2">Gestionando {clients.length} perfiles</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar atleta..."
              className="bg-card border border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-72 font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-card border border-white/5 p-4 rounded-2xl text-foreground/40 hover:text-foreground transition-all">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden group hover:bg-primary/[0.02] transition-all cursor-pointer"
            onClick={() => setSelectedClient(client)}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                  {(client.full_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black bg-green-500/20 text-green-500 px-3 py-1 rounded-full uppercase tracking-widest">Activo</span>
                  <p className="text-[9px] text-foreground/30 font-bold mt-2 uppercase">Meta: {client.goals?.split(' ')[0] || 'Fitness'}</p>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{client.full_name || 'Sin nombre'}</h3>
                <div className="flex items-center space-x-2 text-foreground/30 font-bold uppercase text-[10px] tracking-widest">
                  <Target size={12} />
                  <span>{client.goals || 'Sin objetivo definido'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">Días/Sem</span>
                  <span className="text-sm font-black italic">{client.training_days || '--'} DÍAS</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.2em] mb-1">Última Actividad</span>
                  <span className="text-sm font-black italic">HOY</span>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-white/5 flex items-center justify-between group-hover:bg-primary transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">Ver Perfil Completo</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform group-hover:text-white" />
            </div>
          </motion.div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-32 text-center bg-card rounded-[3rem] border border-dashed border-white/10">
            <UserCircle size={64} className="mx-auto text-foreground/10 mb-6" />
            <h3 className="text-2xl font-black mb-2">No hay atletas todavía</h3>
            <p className="text-foreground/40 font-medium max-w-xs mx-auto">Comparte tu enlace de registro para empezar a gestionar a tu equipo.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedClient(null)} className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="h-40 bg-gradient-to-r from-primary to-blue-600 relative">
                <button onClick={() => setSelectedClient(null)} className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-2xl backdrop-blur-md transition-all"><X size={20} /></button>
              </div>

              <div className="px-8 pb-12">
                <div className="relative -mt-16 mb-8">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-card p-1">
                    <div className="w-full h-full rounded-[2.2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-5xl">
                      {selectedClient.full_name?.charAt(0)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                  <div>
                    <h3 className="text-4xl font-black tracking-tighter">{selectedClient.full_name}</h3>
                    <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs mt-2">Atleta de Alto Rendimiento</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20">ASIGNAR RUTINA</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'Peso', val: `${selectedClient.weight || '--'} kg`, icon: <Weight size={14} />, color: 'text-primary' },
                    { label: 'Altura', val: `${selectedClient.height || '--'} cm`, icon: <Move size={14} />, color: 'text-blue-400' },
                    { label: 'Frecuencia', val: `${selectedClient.training_days || '--'} d/s`, icon: <Calendar size={14} />, color: 'text-green-500' },
                    { label: 'Sesión', val: `${selectedClient.time_available || '--'} min`, icon: <Clock size={14} />, color: 'text-yellow-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5">
                      <div className={`flex items-center ${stat.color} space-x-2 mb-2`}>
                        {stat.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{stat.label}</span>
                      </div>
                      <p className="text-xl font-black italic">{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                  <div className="flex items-center text-primary space-x-3 mb-4">
                    <Target size={20} />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Objetivo del Atleta</span>
                  </div>
                  <p className="text-lg font-bold italic leading-relaxed text-foreground/70">
                    "{selectedClient.goals || 'Sin metas definidas todavía.'}"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
