'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { User, Scale, Ruler, Calendar, Clock, Target, Loader2, LogOut, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setFormData({
        full_name: data?.full_name || '',
        weight: data?.weight || '',
        height: data?.height || '',
        training_days: data?.training_days || 3,
        time_available: data?.time_available || 60,
        goals: data?.goals || '',
      });
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update(formData).eq('id', user.id);
    setProfile({ ...profile, ...formData });
    setEditing(false);
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const stats = [
    { label: 'Peso', val: profile?.weight ? `${profile.weight} kg` : '--', icon: <Scale size={16} />, color: 'text-primary', field: 'weight', type: 'number', unit: 'kg' },
    { label: 'Altura', val: profile?.height ? `${profile.height} cm` : '--', icon: <Ruler size={16} />, color: 'text-blue-400', field: 'height', type: 'number', unit: 'cm' },
    { label: 'Días/Sem', val: profile?.training_days ? `${profile.training_days}d` : '--', icon: <Calendar size={16} />, color: 'text-green-500', field: 'training_days', type: 'number', unit: 'd' },
    { label: 'Sesión', val: profile?.time_available ? `${profile.time_available}m` : '--', icon: <Clock size={16} />, color: 'text-yellow-500', field: 'time_available', type: 'number', unit: 'min' },
  ];

  return (
    <div className="p-6 pb-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tighter">MI PERFIL</h2>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} className="p-3 bg-white/5 rounded-2xl text-foreground/40 hover:bg-white/10 transition-all"><X size={20} /></button>
                <button onClick={handleSave} disabled={saving} className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="p-3 bg-white/5 rounded-2xl text-foreground/40 hover:bg-white/10 transition-all hover:text-primary"><Edit2 size={20} /></button>
            )}
          </div>
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center space-x-5 mb-8">
          <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-primary/20">
            {(profile?.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 font-black text-xl w-full outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
            ) : (
              <h3 className="text-2xl font-black">{profile?.full_name || 'Sin nombre'}</h3>
            )}
            <p className="text-primary font-bold uppercase text-xs tracking-widest mt-1">Atleta</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <div className={`flex items-center ${stat.color} space-x-2 mb-2`}>
                {stat.icon}
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">{stat.label}</span>
              </div>
              {editing ? (
                <input
                  type={stat.type}
                  className="bg-transparent text-xl font-black outline-none w-full"
                  value={formData[stat.field]}
                  onChange={e => setFormData({ ...formData, [stat.field]: e.target.value })}
                />
              ) : (
                <p className="text-xl font-black italic">{stat.val}</p>
              )}
            </div>
          ))}
        </div>

        {/* Goals */}
        <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 mb-8">
          <div className="flex items-center text-primary space-x-2 mb-3">
            <Target size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Objetivo Personal</span>
          </div>
          {editing ? (
            <textarea
              className="w-full bg-transparent outline-none font-bold text-sm resize-none text-foreground/70 min-h-[80px]"
              value={formData.goals}
              onChange={e => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Describe tu objetivo..."
            />
          ) : (
            <p className="text-base font-bold italic text-foreground/70">
              "{profile?.goals || 'Sin metas definidas todavía.'}"
            </p>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <LogOut size={18} />
          <span>CERRAR SESIÓN</span>
        </button>
      </motion.div>
    </div>
  );
}
