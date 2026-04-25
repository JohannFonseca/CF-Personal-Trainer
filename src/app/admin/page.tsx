'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShieldAlert, User, ShieldCheck, Loader2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const check = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setData({ error: "No hay sesión activa. Por favor, inicia sesión." });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setData({
      authUser: {
        id: user.id,
        email: user.email,
      },
      profile: profile || null,
      profileError: profileError?.message || null,
      matches: profile?.role === 'admin'
    });
    setLoading(false);
  };

  useEffect(() => {
    check();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p>Analizando permisos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-card border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className={`p-3 rounded-2xl ${data?.matches ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {data?.matches ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagnóstico de Acceso</h1>
            <p className="text-foreground/50 text-sm">Verificando credenciales de arielfonseca049@gmail.com</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center">
              <User size={16} className="mr-2" /> Datos de Autenticación
            </h2>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span className="text-foreground/40">Email:</span> <span className="font-mono text-foreground">{data?.authUser?.email}</span></p>
              <p className="flex justify-between"><span className="text-foreground/40">ID Usuario:</span> <span className="font-mono text-[10px] text-foreground">{data?.authUser?.id}</span></p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center">
              <ShieldCheck size={16} className="mr-2" /> Datos de Perfil (Base de Datos)
            </h2>
            {data?.profile ? (
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-foreground/40">Nombre:</span> <span className="text-foreground font-bold">{data.profile.full_name}</span></p>
                <p className="flex justify-between">
                  <span className="text-foreground/40">Rol Detectado:</span> 
                  <span className={`font-black px-3 py-1 rounded-full ${data.profile.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {data.profile.role || 'SIN ROL'}
                  </span>
                </p>
                <p className="flex justify-between"><span className="text-foreground/40">ID en Perfil:</span> <span className="font-mono text-[10px] text-foreground">{data.profile.id}</span></p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-red-400 font-bold mb-1">¡Perfil no encontrado!</p>
                <p className="text-xs text-foreground/40">Tu ID de usuario no existe en la tabla 'profiles'.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          {data?.matches && (
            <button 
              onClick={() => router.push('/admin')} 
              className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shadow-primary/25"
            >
              Ir al Panel de Admin
            </button>
          )}
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }} 
            className="flex-1 bg-white/5 text-foreground/60 font-bold py-4 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        <p className="mt-8 text-[10px] text-center text-foreground/20 leading-relaxed italic">
          Si el rol detectado no es 'admin', asegúrate de haberlo escrito correctamente en Supabase.<br />
          Si el perfil no se encuentra, borra el usuario en Supabase Auth y regístrate de nuevo.
        </p>
      </div>
    </div>
  );
}
