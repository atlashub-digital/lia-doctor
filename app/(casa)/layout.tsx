import { Experience } from '@/components/immersive/Experience';

// The LIA house: "/" (átrio) and /experiencia/* (rooms, library) share this layout, so the 3D scene, chat and
// state survive navigation between the átrio and the rooms instead of remounting.
export default function CasaLayout({ children }: { children: React.ReactNode }) {
  return <><Experience enabled={process.env.NEXT_PUBLIC_LIA_IMMERSIVE_ENABLED === 'true'} voiceEnabled={process.env.NEXT_PUBLIC_LIA_VOICE_ENABLED === 'true'} />{children}</>;
}
