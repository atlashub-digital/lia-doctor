import type { Metadata } from 'next';
import { Experience } from '@/components/immersive/Experience';

export const metadata: Metadata = {
  title: 'Uma visita à LIA',
  description: 'Quatro caminhos, um espaço para se reencontrar. Conheça o universo LIA.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/experiencia' },
};
export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return <><Experience enabled={process.env.NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED === 'true'} voiceEnabled={process.env.NEXT_PUBLIC_LIA_VOICE_ENABLED === 'true'} />{children}</>;
}
