'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter, Link } from '@/i18n/routing';
import { Share2, User } from 'lucide-react';

export function Navbar() {
  const t = useTranslations('Landing');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-primary tracking-tight">
              CF Trainer
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLocale}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {locale === 'es' ? 'EN' : 'ES'}
            </button>
            
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-foreground hover:text-primary transition-colors">
              <Share2 size={20} />
            </a>
            
            <Link href="/login" className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors bg-white/5 px-3 py-1.5 rounded-full">
              <User size={16} />
              <span className="hidden sm:inline">{t('login')}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
