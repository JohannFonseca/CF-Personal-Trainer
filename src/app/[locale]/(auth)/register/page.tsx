'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const t = useTranslations('Landing');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success! Redirect to dashboard.
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center text-foreground/70 hover:text-primary transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </Link>
      </div>

      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {t('register')}
        </h2>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-card py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/5">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-500/10 text-red-500 p-3 rounded-md text-sm border border-red-500/20">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-foreground">Nombre Completo</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm bg-background placeholder-white/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm bg-background placeholder-white/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-md shadow-sm bg-background placeholder-white/40 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_20px_4px_rgba(37,99,235,0.2)] text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
