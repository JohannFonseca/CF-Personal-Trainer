'use client';

import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Dumbbell, Image as ImageIcon } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Tus Rutinas Asignadas</h2>
          <p className="text-foreground/60 mt-2">Sigue tu progreso y alcanza tus objetivos.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div 
            className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/20 p-3 rounded-xl text-primary">
                <Dumbbell size={24} />
              </div>
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                Pendiente
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Bienvenido a CF Trainer</h3>
            <p className="text-sm text-foreground/70 mb-4">Tu entrenador asignará tus rutinas personalizadas pronto. ¡Mantente atento!</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
