import { espelho, type Book } from '@/lib/catalog';

// Central commercial catalogue for the EspelhoMeu library. Independent of the 3D scene: the room, the HTML sheet,
// the /espelho-meu pages and the tests all read offers from here.
//
// Rules (Direction GO V1.2, 27/10/2026):
// - Purchases happen on Hotmart only. Never route lia.doctor visitors to espelho.lia.doctor.
// - Only checkout URLs confirmed by the Direction are live. Everything else stays `pending`: no invented URLs,
//   no fictitious purchase buttons.
// - New Hotmart purchases are fulfilled by Hotmart. Nothing here grants Reader or ARO entitlements.
// - The Hotmart widget is prepared but disabled; enabling it is a separate, explicit decision.
// - Covers stay `pending-editorial` until the approved P01–P05 files clear editorial GO. The repository is public,
//   so the files are not committed before that.

export type Commerce =
  | { status: 'live'; checkout: string; hotlink: string; widget: { enabled: false } }
  | { status: 'pending'; reason: string };

export type Cover = { status: 'pending-editorial' } | { status: 'approved'; src: string; width: number; height: number };

export type Offer = Book & {
  productCode: `P0${1 | 2 | 3 | 4 | 5}`;
  collection: 'EspelhoMeu Editions';
  includes: string[];
  commerce: Commerce;
  cover: Cover;
};

const pending: Commerce = { status: 'pending', reason: 'A validar.' };
const includesByCode: Record<string, string[]> = {
 '01': ['eBook e workbook complementar de reflexão'],
 '02': ['Livro em sete capítulos', 'Caderno da Minha Assinatura e cartões de reflexão'],
 '03': ['Livro com 21 encontros', 'Caderno Meu Melhor Reflexo', 'Cartões de reflexão'],
 '04': ['Livro com sete capítulos', 'Mapa de Novos Capítulos e cartões'],
 '05': ['Diário de 30 encontros', 'Caderno complementar e cartões'],
};
const live = (id: string): Commerce => ({ status: 'live', checkout: 'https://pay.hotmart.com/' + id, hotlink: 'https://go.hotmart.com/' + id + '?dp=1', widget: { enabled: false } });
const commerceByCode: Record<string, Commerce> = {
 '01': live('A108182228Y'),
 '02': live('A108182278G'),
 '03': live('E108183347V'),
 '04': live('D108183354F'),
 '05': live('E108186873J'),
};

export const espelhoOffers: Offer[] = espelho.map(book => ({
  ...book,
  productCode: `P${book.code}` as Offer['productCode'],
  collection: 'EspelhoMeu Editions',
  includes: includesByCode[book.code] ?? [book.details],
  commerce: commerceByCode[book.code] ?? pending,
  cover: { status: 'pending-editorial' },
}));

export function findOffer(slug?: string | null) {
  return espelhoOffers.find(offer => offer.slug === slug);
}
