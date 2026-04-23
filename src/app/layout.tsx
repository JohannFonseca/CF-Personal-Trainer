import './globals.css';

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
      </body>
    </html>
  );
}
