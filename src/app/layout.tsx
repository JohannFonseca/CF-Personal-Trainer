import './globals.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'CF Personal Trainer',
  description: 'Entrenamiento personalizado y seguimiento de rutinas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
