import type { Metadata } from 'next';

// Rooms and the library are reached from the átrio ("/"); keep them out of the index to avoid duplicating it.
export const metadata: Metadata = {
  title: 'Uma visita à LIA',
  description: 'Quatro caminhos, um espaço para se reencontrar. Conheça o universo LIA.',
  robots: { index: false, follow: true },
};
export default function ExperienciaLayout({ children }: { children: React.ReactNode }) { return children; }
