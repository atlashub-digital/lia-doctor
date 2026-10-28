import { espelho, type Book } from '@/lib/catalog';

// Central commercial catalogue for the EspelhoMeu library. Independent of the 3D scene: the room, the HTML sheet,
// the /espelho-meu pages and the tests all read offers from here.
//
// Rules (Direction GO V1.2, 27/10/2026):
// - Purchases happen on Hotmart only. Never route lia.doctor visitors to espelho.lia.doctor.
// - Only checkout URLs provided by the Direction are live. Unsupported offers stay `pending`: no invented URLs,
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
  banner: string;
};

const pending: Commerce = { status: 'pending', reason: 'Associação Hotmart pendente de confirmação pela Direção.' };

// Materials, restated item by item from each volume's catalogue "details" sentence (no new claims).
const includesByCode: Record<string, string[]> = {
  '01': ['Leitura', 'Jornada de sete dias', 'Caderno de atividades'],
  '02': ['Sete capítulos', 'Caderno da Minha Assinatura', 'Sete fichas e cartões de reflexão'],
  '03': ['21 encontros em três momentos', 'Caderno Meu Melhor Reflexo', 'Cartões de reflexão'],
  '04': ['Sete capítulos', 'Mapa de Novos Capítulos', 'Cartões de reflexão'],
  '05': ['30 encontros de escrita', 'Caderno complementar', 'Cartões de reflexão'],
};

const commerceByCode: Record<string, Commerce> = {
  '02': { status: 'live', checkout: 'https://pay.hotmart.com/A108182278G', hotlink: 'https://go.hotmart.com/A108182278G?dp=1', widget: { enabled: false } },
  '03': { status: 'live', checkout: 'https://pay.hotmart.com/E108183347V', hotlink: 'https://go.hotmart.com/E108183347V?dp=1', widget: { enabled: false } },
  '04': { status: 'live', checkout: 'https://pay.hotmart.com/D108183354F', hotlink: 'https://go.hotmart.com/D108183354F?dp=1', widget: { enabled: false } },
  '05': { status: 'live', checkout: 'https://pay.hotmart.com/E108186873J', hotlink: 'https://go.hotmart.com/E108186873J?dp=1', widget: { enabled: false } },
  '01': {
    status: 'live',
    checkout: 'https://pay.hotmart.com/A108182228Y',
    hotlink: 'https://go.hotmart.com/A108182228Y?dp=1',
    widget: { enabled: false },
  },
};

export const espelhoOffers: Offer[] = espelho.map(book => ({
  ...book,
  productCode: `P${book.code}` as Offer['productCode'],
  collection: 'EspelhoMeu Editions',
  includes: includesByCode[book.code] ?? [book.details],
  commerce: commerceByCode[book.code] ?? pending,
  cover: { status: 'pending-editorial' },
  banner: `/products/p${book.code}-banner.png`,
}));

export function findOffer(slug?: string | null) {
  return espelhoOffers.find(offer => offer.slug === slug);
}
