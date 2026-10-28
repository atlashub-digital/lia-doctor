import { espelhoOffers } from '@/lib/offers';
import { findProduct, type Product } from '@/lib/products';
import type { RoomId } from '@/lib/immersive';

// What each themed room puts on its shelf. Items come from the single product catalogue, so the 3D volumes, the HTML
// library, the editorial sheet and the sales pages always agree. Covers are cropped from the official banners.

export type ShelfItem = {
  slug: string;
  code: string;
  title: string;
  kicker: string;
  short: string;
  synopsis: string;
  includes: string[];
  notice: string;
  checkout: string;
  cover: string;
  banner: string;
  salesPath: string;
  collection: string;
};

const covers: Record<string, string> = {
  '7-dias-para-me-escolher': '/editorial/covers/espelho-p01.webp',
  'eu-sou-bela-do-meu-jeito': '/editorial/covers/espelho-p02.webp',
  '21-dias-meu-melhor-reflexo': '/editorial/covers/espelho-p03.webp',
  'recomecar-depois-dos-40': '/editorial/covers/espelho-p04.webp',
  'diario-de-amor-proprio': '/editorial/covers/espelho-p05.webp',
  'tomei-mounjaro-e-agora': '/editorial/covers/me-sentir-leve-msl001.webp',
  'corpo-forte-alem-da-balanca': '/editorial/covers/me-sentir-leve-msl002.webp',
};
/** The workbook ships inside Corpo Forte; it stands next to it as a display volume, not a separate product. */
export const workbookCover = '/editorial/covers/me-sentir-leve-msl003.webp';

function item(product: Product): ShelfItem {
  const offer = espelhoOffers.find(entry => entry.slug === product.slug);
  return {
    slug: product.slug, code: product.code, title: product.title,
    kicker: offer?.eyebrow ?? product.hook, short: offer?.description ?? product.hook,
    synopsis: product.synopsis, includes: product.includes.map(entry => entry.title), notice: product.notice,
    checkout: product.checkout, cover: covers[product.slug], banner: product.banner, salesPath: `/livros/${product.slug}`,
    collection: product.series === 'EspelhoMeu' ? 'EspelhoMeu Editions' : 'Me Sentir Leve',
  };
}

const bySlug = (...slugs: string[]) => slugs.map(slug => { const product = findProduct(slug); if (!product) throw new Error(`Unknown product ${slug}`); return item(product); });

export const shelves: Record<RoomId, { heading: string; items: ShelfItem[]; workbook: boolean }> = {
  'espelho-meu': { heading: 'Livraria EspelhoMeu · Cinco volumes', items: bySlug('7-dias-para-me-escolher', 'eu-sou-bela-do-meu-jeito', '21-dias-meu-melhor-reflexo', 'recomecar-depois-dos-40', 'diario-de-amor-proprio'), workbook: false },
  'me-sentir-leve': { heading: 'Biblioteca Me Sentir Leve · Duas leituras', items: bySlug('tomei-mounjaro-e-agora', 'corpo-forte-alem-da-balanca'), workbook: true },
  corpo: { heading: 'Atelier Corpo Forte · Livro + workbook', items: bySlug('corpo-forte-alem-da-balanca'), workbook: true },
  'mente-e-calma': { heading: 'Sala da Pausa', items: [], workbook: false },
};

export function findShelfItem(room?: string | null, slug?: string | null) {
  if (!room || !slug || !(room in shelves)) return undefined;
  return shelves[room as RoomId].items.find(entry => entry.slug === slug);
}
