import { espelho, type Book } from '@/lib/catalog';

// Central commercial catalogue for the EspelhoMeu library. Independent of the 3D scene: the room, the HTML sheet,
// the /espelho-meu pages and the tests all read offers from here.
//
// Rules:
// - Purchases happen on Hotmart only. Never route lia.doctor visitors to espelho.lia.doctor.
// - Product copy, materials and Hotmart links are the ones supplied by the Direction on 28/10/2026. No invented URLs.
// - New Hotmart purchases are fulfilled by Hotmart. Nothing here grants Reader or ARO entitlements.
// - The Direction-supplied Hotmart widget snippet is kept off (`widget.enabled: false`): it removed the buy buttons
//   in testing and loads jQuery over http. Buttons link straight to the official payment page.
// - Standalone cover files were not supplied (only banners), so 3D front boards stay `pending-editorial`.

export type Commerce =
  | { status: 'live'; checkout: string; hotlink: string; widget: { enabled: boolean } }
  | { status: 'pending'; reason: string };

export type Cover = { status: 'pending-editorial' } | { status: 'approved'; src: string; width: number; height: number };

export type Offer = Book & {
  productCode: `P0${1 | 2 | 3 | 4 | 5}`;
  collection: 'EspelhoMeu Editions';
  includes: string[];
  /** Full editorial synopsis supplied by the Direction (the catalogue `description` stays as the short line). */
  synopsis: string;
  /** Scope / audience notice that must accompany the offer. */
  notice: string;
  commerce: Commerce;
  cover: Cover;
};

// Direction-supplied product data (28/10/2026), keyed by catalogue code.
const details: Record<string, { synopsis: string; notice: string; includes: string[]; code: string }> = {
  '01': {
    synopsis: 'Sete encontros curtos para observar o presente, reconhecer pequenas escolhas e abrir espaço para o que faz sentido para você. A leitura não exige calendário fixo, nem partilha de respostas.',
    includes: ['eBook 7 Dias Para Me Escolher', 'Workbook complementar de reflexão'],
    notice: 'Conteúdo educativo e reflexivo, destinado a maiores de 18 anos; não substitui terapia ou orientação clínica.',
    code: 'A108182228Y',
  },
  '02': {
    synopsis: 'Explore beleza, expressão pessoal, história de estilo e presença sem transformar a aparência em obrigação. Sete capítulos com observações, perguntas e experiências opcionais.',
    includes: ['Livro Eu Sou Bela — Do Meu Jeito', 'Caderno da Minha Assinatura, com sete fichas', 'Cartões de reflexão'],
    notice: 'É uma leitura de autoria pessoal e liberdade de escolha, não um método diagnóstico ou terapêutico.',
    code: 'A108182278G',
  },
  '03': {
    synopsis: 'Vinte e um encontros editoriais organizados em três momentos: observar com respeito, experimentar com curiosidade e continuar ao seu ritmo. Os exercícios são opcionais e não exigem comprovação de resultados nem fotografias pessoais.',
    includes: ['Livro 21 Dias — Meu Melhor Reflexo', 'Caderno Meu Melhor Reflexo', 'Cartões para recuperar ideias e perguntas'],
    notice: 'Publicação educativa para adultos.',
    code: 'E108183347V',
  },
  '04': {
    synopsis: 'Sete capítulos sobre tempo, história pessoal, curiosidade, papéis e relações. A maturidade não é tratada como prazo, obrigação ou defeito a corrigir. Pode ler em qualquer ordem, guardar perguntas e escolher experiências pequenas e possíveis.',
    includes: ['Livro Recomeçar Depois dos 40', 'Mapa de Novos Capítulos', 'Cartões de reflexão para registos privados'],
    notice: 'Não se trata de aconselhamento clínico.',
    code: 'D108183354F',
  },
  '05': {
    synopsis: 'Diário de Amor-Próprio — 30 Encontros Comigo é uma coleção de convites à escrita pessoal: presença, memórias, corpo, escolhas e continuidade. Os trinta encontros podem ser lidos sem frequência obrigatória e algumas páginas podem permanecer em branco.',
    includes: ['Diário de Amor-Próprio', 'Caderno complementar', 'Cartões de reflexão'],
    notice: 'As respostas são privadas e não são recolhidas automaticamente. Não substitui psicoterapia.',
    code: 'E108186873J',
  },
};

export const espelhoOffers: Offer[] = espelho.map(book => {
  const data = details[book.code];
  return {
    ...book,
    productCode: `P${book.code}` as Offer['productCode'],
    collection: 'EspelhoMeu Editions',
    includes: data.includes,
    synopsis: data.synopsis,
    notice: data.notice,
    commerce: { status: 'live', checkout: `https://pay.hotmart.com/${data.code}`, hotlink: `https://go.hotmart.com/${data.code}?dp=1`, widget: { enabled: false } },
    cover: { status: 'pending-editorial' },
  };
});

export function findOffer(slug?: string | null) {
  return espelhoOffers.find(offer => offer.slug === slug);
}
