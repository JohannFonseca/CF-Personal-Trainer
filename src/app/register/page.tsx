'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Loader2, CheckCircle2, 
  Dumbbell, Scale, Ruler, Calendar, Clock, Target, User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    weight: '',
    height: '',
    trainingDays: '3',
    timeAvailable: '60',
    goals: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    // 1. Sign Up in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    });

    if (authError || !authData.user) {
      setError(authError?.message || 'Error al crear la cuenta.');
      setLoading(false);
      return;
    }

    // 2. Update Profile with extra data
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        training_days: parseInt(formData.trainingDays),
        time_available: parseInt(formData.timeAvailable),
        goals: formData.goals
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error("Error actualizando perfil:", profileError);
      // No bloqueamos el acceso si falla la actualización de perfil extra
    }

    router.push('/dashboard');
    router.refresh();
  };

  const steps = [
    { title: 'Cuenta', icon: <User size={18} /> },
    { title: 'Físico', icon: <Scale size={18} /> },
    { title: 'Metas', icon: <Target size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center text-foreground/40 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest">
          <ArrowLeft className="mr-2" size={16} /> Volver
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* Progress Bar */}
        <div className="flex justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                step > i + 1 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                step === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 
                'bg-card border border-white/5 text-foreground/30'
              }`}>
                {step > i + 1 ? <CheckCircle2 size={20} /> : s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-primary' : 'text-foreground/30'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <motion.div 
          className="bg-card/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
          layout
        >
          <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); nextStep(); }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight">Crea tu cuenta</h2>
                    <p className="text-sm text-foreground/40 mt-2">Empecemos con lo básico</p>
                  </div>

                  {error && <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-bold border border-red-500/20">{error}</div>}

                  <div>
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                    <input
                      type="text" required
                      className="w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="Juan Pérez"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Email</label>
                    <input
                      type="email" required
                      className="w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="juan@ejemplo.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
                    <input
                      type="password" required
                      className="w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight">Datos Físicos</h2>
                    <p className="text-sm text-foreground/40 mt-2">Ayúdanos a conocer tu condición inicial</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 p-6 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex items-center text-primary space-x-2">
                        <Scale size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Peso</span>
                      </div>
                      <div className="flex items-end space-x-2">
                        <input
                          type="number" required
                          className="bg-transparent text-2xl font-black outline-none w-full"
                          placeholder="0"
                          value={formData.weight}
                          onChange={e => setFormData({...formData, weight: e.target.value})}
                        />
                        <span className="text-foreground/30 font-bold mb-1">KG</span>
                      </div>
                    </div>

                    <div className="bg-background/50 p-6 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex items-center text-blue-400 space-x-2">
                        <Ruler size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Altura</span>
                      </div>
                      <div className="flex items-end space-x-2">
                        <input
                          type="number" required
                          className="bg-transparent text-2xl font-black outline-none w-full"
                          placeholder="0"
                          value={formData.height}
                          onChange={e => setFormData({...formData, height: e.target.value})}
                        />
                        <span className="text-foreground/30 font-bold mb-1">CM</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-black tracking-tight">Tu Plan</h2>
                    <p className="text-sm text-foreground/40 mt-2">Dinos cuánto tiempo tienes y qué buscas</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                      <Calendar className="text-primary" size={24} />
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Días por semana</label>
                        <select 
                          className="bg-transparent font-bold w-full outline-none"
                          value={formData.trainingDays}
                          onChange={e => setFormData({...formData, trainingDays: e.target.value})}
                        >
                          {[1,2,3,4,5,6,7].map(d => <option key={d} value={d} className="bg-card">{d} días</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                      <Clock className="text-blue-400" size={24} />
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-1">Minutos por sesión</label>
                        <select 
                          className="bg-transparent font-bold w-full outline-none"
                          value={formData.timeAvailable}
                          onChange={e => setFormData({...formData, timeAvailable: e.target.value})}
                        >
                          {[30, 45, 60, 90, 120].map(t => <option key={t} value={t} className="bg-card">{t} min</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest ml-1 flex items-center">
                        <Target size={12} className="mr-1" /> Tus Objetivos
                      </label>
                      <textarea
                        required
                        className="w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm h-24 resize-none"
                        placeholder="Ej: Bajar de peso, ganar masa muscular en piernas, mejorar resistencia..."
                        value={formData.goals}
                        onChange={e => setFormData({...formData, goals: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex space-x-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="p-4 bg-white/5 hover:bg-white/10 text-foreground rounded-2xl transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{step === 3 ? 'FINALIZAR REGISTRO' : 'CONTINUAR'}</span>
                    {step < 3 && <ArrowRight size={18} />}
                  </>
                )}
              </button>
            </div>
          </form>

          {step === 1 && (
            <div className="mt-8 text-center">
              <Link href="/login" className="text-xs font-bold text-foreground/30 hover:text-primary transition-colors uppercase tracking-widest">
                ¿Ya tienes cuenta? <span className="text-primary">Inicia sesión</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
