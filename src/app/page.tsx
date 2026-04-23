import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { SponsorCards } from '@/components/ui/SponsorCards';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Trophy, Users, Star } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-sm font-bold mb-8 animate-fade-in">
          <Star className="h-4 w-4 fill-primary" />
          <span>EL CAMBIO QUE BUSCAS ESTÁ AQUÍ</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-tight">
          Transforma Tu Cuerpo <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Transforma Tu Vida</span>
        </h1>
        
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
          No es solo levantar pesas. Es disciplina, nutrición y mentalidad. <br className="hidden md:block" />
          Te acompaño en cada paso hacia tu mejor versión física y mental.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register" 
            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-primary hover:bg-primary/90 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_8px_rgba(37,99,235,0.3)]"
          >
            Comienza Tu Transformación
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="flex items-center -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
              </div>
            ))}
            <span className="pl-6 text-sm text-foreground/60 font-medium">+100 alumnos activos</span>
          </div>
        </div>
      </section>

      {/* Progress Section (Testimonials) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-card/30 backdrop-blur-sm border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Resultados Reales
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto italic text-lg">
              "La disciplina vence al talento. No busques excusas, busca resultados."
            </p>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mt-6" />
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible no-scrollbar">
            {[
              { src: '/images/progress-1.jpg', label: 'El Comienzo', desc: 'Mentalidad de cambio' },
              { src: '/images/progress-2.jpg', label: 'Primeros Pasos', desc: 'Constancia diaria' },
              { src: '/images/progress-3.jpg', label: 'Evolución', desc: 'Disciplina total' },
              { src: '/images/progress-4.jpg', label: 'Mi Mejor Versión', desc: 'Resultados reales' },
            ].map((img, index) => (
              <div key={index} className="flex-none w-[85%] sm:w-[60%] md:w-full snap-center group relative rounded-3xl overflow-hidden aspect-[3/4] border border-white/10 shadow-2xl transition-all duration-300">
                <img 
                  src={img.src} 
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity flex flex-col justify-end p-6">
                  <h4 className="text-xl font-bold text-white">{img.label}</h4>
                  <p className="text-white/70 text-sm">{img.desc}</p>
                </div>
                <div className="absolute top-4 left-4 bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {index < 2 ? 'ANTES' : 'DESPUÉS'}
                </div>
                <div className="absolute bottom-4 left-4 right-4 md:hidden">
                  <div className="bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                    <p className="text-white font-bold text-sm">{img.label}</p>
                    <p className="text-white/70 text-xs">{img.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Planes a Medida</h3>
              <p className="text-foreground/60 text-sm">Rutinas diseñadas específicamente para tu tipo de cuerpo y metas.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Meta Cumplida</h3>
              <p className="text-foreground/60 text-sm">Seguimiento semanal para asegurar que llegues a donde quieres estar.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Comunidad</h3>
              <p className="text-foreground/60 text-sm">Únete a un grupo que te motiva a no rendirte nunca.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Alianzas y Patrocinios
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </div>
        
        <SponsorCards />
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto bg-primary rounded-[3rem] p-12 shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿Listo para dejar las excusas?</h2>
          <p className="text-white/80 mb-10 text-lg">Tu primera rutina está a un clic de distancia. Regístrate hoy mismo.</p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-black text-primary bg-white hover:bg-white/90 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            ¡QUIERO EMPEZAR YA!
          </Link>
        </div>
      </section>

      <FloatingWhatsApp />
    </main>
  );
}
