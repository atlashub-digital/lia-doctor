import type { Metadata } from 'next';

// Homepage: the átrio of the LIA house. The Experience in the (casa) layout renders it; the shop lives at /colecoes.
export const metadata: Metadata = {
  title: { absolute: 'LIA.doctor — A companheira da sua jornada' },
  description: 'Entre na casa da LIA: quatro caminhos — EspelhoMeu, Me Sentir Leve, Corpo e Mente & Calma — leituras que acompanham e a Comunidade LIA.',
  alternates: { canonical: '/' },
};
export default function Atrio() { return null; }
