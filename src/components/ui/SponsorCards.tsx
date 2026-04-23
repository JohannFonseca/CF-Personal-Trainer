'use client';

import { motion } from 'framer-motion';

const sponsors = [
  {
    name: 'Barepump',
    discount: '10%',
    code: 'CF24',
    url: 'https://barepump.com',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    name: 'Aspyr Athletic Wear',
    discount: '15%',
    code: 'CF04',
    url: 'https://aspyr.com',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    name: 'Rectify Nutrition',
    discount: '15%',
    code: 'FABIAN15',
    url: 'https://rectifynutrition.com',
    image: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&q=80&w=400&h=300'
  }
];

export function SponsorCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sponsors.map((sponsor, index) => (
        <motion.a
          key={sponsor.name}
          href={sponsor.url}
          target="_blank"
          rel="noreferrer"
          className="relative group rounded-2xl overflow-hidden shadow-xl bg-card border border-white/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
        >
          <div className="aspect-[4/3] relative">
            <img 
              src={sponsor.image} 
              alt={sponsor.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-6 text-white">
            <h3 className="text-xl font-bold mb-3">{sponsor.name}</h3>
            <div className="flex items-center justify-between">
              <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                -{sponsor.discount}
              </span>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-md backdrop-blur-md">
                <span className="text-xs uppercase tracking-wider opacity-80">Code:</span>
                <span className="font-mono font-bold text-primary-foreground">{sponsor.code}</span>
              </div>
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
