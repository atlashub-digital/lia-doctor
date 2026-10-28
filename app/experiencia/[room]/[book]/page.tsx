import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findOffer, espelhoOffers } from '@/lib/offers';

// Shareable selection state: /experiencia/espelho-meu/<volume>. The Experience layout reads the path and opens the
// sheet; this page only validates the URL. Only the EspelhoMeu library has volumes.
type Props = { params: Promise<{ room: string; book: string }> };
export function generateStaticParams() { return espelhoOffers.map(offer => ({ room: 'espelho-meu', book: offer.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offer = findOffer((await params).book);
  return offer ? { title: `${offer.title} — Livraria EspelhoMeu`, description: offer.description } : { title: 'Livro não encontrado' };
}
export default async function BookSelection({ params }: Props) {
  const { room, book } = await params;
  if (room !== 'espelho-meu' || !findOffer(book)) notFound();
  return null;
}
