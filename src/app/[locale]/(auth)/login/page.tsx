'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('Landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    window.location.href = '/es/dashboard';
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
          {t('login')}
        </h2>
      </motion.div>

      <motion.div 
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-card py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/5">
          <form className="space-y-6" onSubmit={handleLogin}>
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_20px_4px_rgba(37,99,235,0.2)] text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                Entrar
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
