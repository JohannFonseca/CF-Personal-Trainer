'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dumbbell, Image as ImageIcon } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-white/5 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">CF Trainer Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              US
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Tus Rutinas Asignadas</h2>
          <p className="text-foreground/60 mt-2">Sigue tu progreso y alcanza tus objetivos.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card Example */}
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
                Día de Pecho
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Press de Banca</h3>
            <p className="text-sm text-foreground/70 mb-4">4 sets de 10-12 repeticiones. Descanso 90s.</p>
            <div className="flex items-center space-x-2 text-primary font-medium text-sm">
              <ImageIcon size={16} />
              <span>Ver demostración</span>
            </div>
          </motion.div>
          
          {/* Card Example 2 */}
          <motion.div 
            className="bg-card rounded-2xl p-6 border border-white/5 shadow-xl"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/20 p-3 rounded-xl text-primary">
                <Dumbbell size={24} />
              </div>
              <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                Día de Pecho
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Aperturas Inclinadas</h3>
            <p className="text-sm text-foreground/70 mb-4">3 sets de 12-15 repeticiones. Descanso 60s.</p>
            <div className="flex items-center space-x-2 text-primary font-medium text-sm">
              <ImageIcon size={16} />
              <span>Ver demostración</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
