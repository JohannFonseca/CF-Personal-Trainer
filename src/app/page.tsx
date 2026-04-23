import { Navbar } from '@/components/layout/Navbar';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import { SponsorCards } from '@/components/ui/SponsorCards';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 max-w-4xl mx-auto">
          Tu Mejor Versión <span className="text-primary">Empieza Aquí</span>
        </h1>
        
        <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
          Entrenamiento personalizado y seguimiento de rutinas para alcanzar tus metas de fitness.
        </p>
        
        <Link 
          href="/register" 
          className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-primary hover:bg-primary/90 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_8px_rgba(37,99,235,0.3)]"
        >
          Comienza Ahora
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Nuestros Patrocinadores
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
        </div>
        
        <SponsorCards />
      </section>

      <FloatingWhatsApp />
    </main>
  );
}
