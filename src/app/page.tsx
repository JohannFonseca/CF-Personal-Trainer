import { redirect } from 'next/navigation';

// Fallback para redirigir la ruta raíz al idioma por defecto (es)
// en caso de que el middleware Edge falle o Vercel no lo intercepte correctamente.
export default function RootPage() {
  redirect('/es');
}
