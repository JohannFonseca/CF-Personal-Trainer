'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Lista de correos que SIEMPRE son administradores
const SUPER_ADMINS = ['arielfonseca049@gmail.com', 'jhnfonseca22@gmail.com'];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Iniciar sesión
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : 'Error al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
      return;
    }

    // 2. Verificar si es Super Admin por CÓDIGO (Infalible)
    const isSuperAdmin = SUPER_ADMINS.includes(authData.user.email?.toLowerCase() || '');

    if (isSuperAdmin) {
      setRedirecting('Admin (Modo Super)');
      router.push('/admin');
      return;
    }

    // 3. Si no es Super Admin, consultar base de datos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profile?.role === 'admin') {
      setRedirecting('Entrenador');
      router.push('/admin');
    } else {
      setRedirecting('Atleta');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center text-foreground/50 hover:text-primary transition-all font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="mr-2" size={18} />
          Inicio
        </Link>
      </div>

      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
            <ShieldCheck className="text-white" size={32} />
          </div>
        </div>
        <h2 className="text-center text-4xl font-black text-foreground tracking-tight">
          Bienvenido
        </h2>
        <p className="text-center text-sm text-foreground/40 mt-3 font-medium">
          Inicia sesión para gestionar tus entrenamientos
        </p>
      </motion.div>

      <motion.div
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-card/50 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-[2.5rem] sm:px-12 border border-white/5">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-bold border border-red-500/20 flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            {redirecting && (
              <div className="bg-primary/10 text-primary p-4 rounded-2xl text-xs font-bold border border-primary/20 flex items-center animate-pulse">
                <Loader2 size={14} className="animate-spin mr-2" />
                Entrando como {redirecting}...
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
              <input
                type="email"
                required
                className="block w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-foreground/40 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
              <input
                type="password"
                required
                className="block w-full px-5 py-4 bg-background border border-white/5 rounded-2xl text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex justify-center items-center gap-3 py-4 px-6 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'ACCEDER AL PANEL'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/register" className="text-xs font-bold text-foreground/30 hover:text-primary transition-colors uppercase tracking-widest">
              ¿No tienes cuenta? <span className="text-primary">Regístrate gratis</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
