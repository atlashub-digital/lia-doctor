import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findShelfItem, shelves } from '@/lib/shelves';

// Shareable selection state: /experiencia/<room>/<volume>. The (casa) layout reads the path and opens the sheet; this
// page only validates the URL against the room's shelf.
type Props = { params: Promise<{ room: string; book: string }> };
export function generateStaticParams() {
  return Object.entries(shelves).flatMap(([room, shelf]) => shelf.items.map(item => ({ room, book: item.slug })));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { room, book } = await params;
  const item = findShelfItem(room, book);
  return item ? { title: `${item.title} — ${item.collection}`, description: item.short } : { title: 'Livro não encontrado' };
}
export default async function BookSelection({ params }: Props) {
  const { room, book } = await params;
  if (!findShelfItem(room, book)) notFound();
  return null;
}
