import type { Metadata } from 'next';
import { CinematicEntry } from '@/components/entry/CinematicEntry';

// Preview of the future cinematic entry for "/". The production homepage is untouched until the Direction's GO.
export const metadata: Metadata = {
  title: 'Entrada (pré-visualização)',
  description: 'Pré-visualização da entrada cinematográfica da LIA.doctor.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/entrada' },
};

// Raise the curtain before first paint when JavaScript runs (no flash of the final frame before the approach).
const curtainFlag = "document.documentElement.classList.add('entry-js')";

export default function EntradaPreview() {
  return <>
    <script dangerouslySetInnerHTML={{ __html: curtainFlag }} />
    <CinematicEntry />
  </>;
}
