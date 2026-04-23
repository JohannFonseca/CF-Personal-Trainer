'use client';

import { motion } from 'framer-motion';
import { Users, Activity, Settings } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/5 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="px-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 bg-primary/10 text-primary px-4 py-3 rounded-xl font-medium">
            <Users size={20} />
            <span>Clientes</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-foreground/70 hover:bg-white/5 hover:text-foreground px-4 py-3 rounded-xl font-medium transition-colors">
            <Activity size={20} />
            <span>Rutinas / Ejercicios</span>
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-foreground">Gestión de Clientes</h2>
          <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-[0_0_20px_4px_rgba(37,99,235,0.2)]">
            + Nuevo Ejercicio
          </button>
        </header>

        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-foreground/60 text-sm">
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Objetivo</th>
                <th className="p-4 font-medium">Días/Semana</th>
                <th className="p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      J
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Juan Pérez</p>
                      <p className="text-xs text-foreground/60">juan@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground/80">Hipertrofia</td>
                <td className="p-4 text-foreground/80">4 días</td>
                <td className="p-4">
                  <button className="text-primary hover:underline text-sm font-medium">
                    Asignar Rutina
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
