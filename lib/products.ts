import { espelhoOffers } from '@/lib/offers';
import { espelhoBanners, mslBanners } from '@/lib/editorial-banners';

// Single catalogue of the seven works on sale, used by the sales landing pages (/livros/<slug>) and by the rooms.
// Copy is written from the Direction-supplied product texts (28/10/2026). Rules: no invented results, numbers,
// testimonials, prices or urgency; health-adjacent titles keep their clinical disclaimers verbatim in spirit.

export type Series = 'EspelhoMeu' | 'Me Sentir Leve';
export type SalesBlock = { title: string; text: string };

export type Product = {
  slug: string;
  series: Series;
  code: string;
  title: string;
  /** One-line promise used under the H1 and in share cards. */
  hook: string;
  headline: string;
  lead: string;
  /** Recognition questions for the "is this for me" opening. */
  recognition: string[];
  synopsis: string;
  includes: SalesBlock[];
  /** How the reading is organised (chapters, encounters, method). */
  structureTitle: string;
  structure: SalesBlock[];
  forWhom: string[];
  notFor: string[];
  notice: string;
  facts: string[];
  checkout: string;
  hero: string;
  banner: string;
  og: string;
  ctaLabel: string;
  /** Existing editorial page on the site, for readers who arrive from the house. */
  sitePage: string;
  roomPath: string;
};

const espelho = (slug: string) => {
  const offer = espelhoOffers.find(item => item.slug === slug);
  if (!offer || offer.commerce.status !== 'live') throw new Error(`EspelhoMeu offer missing: ${slug}`);
  return { offer, checkout: offer.commerce.checkout, n: Number(offer.code) };
};

const espelhoMedia = (slug: string, n: number) => ({
  hero: `/editorial/hero/espelho-p0${n}.webp`, banner: espelhoBanners[slug], og: `/editorial/og/espelho-p0${n}.jpg`,
  sitePage: `/espelho-meu/${slug}`, roomPath: `/experiencia/espelho-meu/${slug}`,
});

const p01 = espelho('7-dias-para-me-escolher');
const p02 = espelho('eu-sou-bela-do-meu-jeito');
const p03 = espelho('21-dias-meu-melhor-reflexo');
const p04 = espelho('recomecar-depois-dos-40');
const p05 = espelho('diario-de-amor-proprio');

export const products: Product[] = [
  {
    slug: '7-dias-para-me-escolher', series: 'EspelhoMeu', code: 'P01', title: '7 Dias Para Me Escolher',
    hook: 'Um reencontro gentil comigo mesma.',
    headline: 'Sete encontros curtos para voltar a escolher o que faz sentido para você.',
    lead: 'Um ponto de partida leve para observar o presente, reconhecer pequenas escolhas e abrir espaço para o que importa, no seu ritmo, sem calendário fixo.',
    recognition: ['Os dias passam e quase todas as escolhas parecem ser para os outros?', 'Sente vontade de parar um pouco, sem saber por onde começar?', 'Prefere algo curto, possível e só seu, sem ter de mostrar respostas a ninguém?'],
    synopsis: p01.offer.synopsis,
    includes: [
      { title: 'eBook 7 Dias Para Me Escolher', text: 'Sete encontros curtos de leitura e reflexão, para ler quando fizer sentido.' },
      { title: 'Workbook complementar de reflexão', text: 'Espaço para escrever, observar e guardar as suas próprias respostas.' },
    ],
    structureTitle: 'Como funciona',
    structure: [
      { title: 'Sete encontros', text: 'Cada encontro é curto e tem um foco simples: observar, reconhecer, escolher.' },
      { title: 'Sem calendário fixo', text: 'Pode fazer um encontro por dia ou espaçar como preferir.' },
      { title: 'Só para você', text: 'Nenhuma resposta precisa ser partilhada. O caderno é privado.' },
    ],
    forWhom: ['Mulheres adultas que querem um primeiro passo leve de autoconhecimento.', 'Quem gosta de ler e escrever no próprio ritmo.', 'Quem procura reflexão sem pressão nem promessas.'],
    notFor: ['Quem procura terapia, diagnóstico ou orientação clínica.', 'Menores de 18 anos.'],
    notice: p01.offer.notice,
    facts: ['eBook + workbook', 'Leitura digital', 'Volume 1 · EspelhoMeu Editions'],
    checkout: p01.checkout, ...espelhoMedia('7-dias-para-me-escolher', 1), ctaLabel: 'Quero começar os 7 dias',
  },
  {
    slug: 'eu-sou-bela-do-meu-jeito', series: 'EspelhoMeu', code: 'P02', title: 'Eu Sou Bela — Do Meu Jeito',
    hook: 'Expressar quem sou, com mais verdade e gentileza.',
    headline: 'Beleza como expressão pessoal, não como obrigação.',
    lead: 'Explore beleza, estilo e presença a partir da sua história, com sete capítulos de observações, perguntas e experiências opcionais.',
    recognition: ['Sente que a aparência virou mais uma tarefa a cumprir?', 'Gostaria de reencontrar um estilo que seja mesmo seu?', 'Quer pensar em beleza sem comparações nem padrões impostos?'],
    synopsis: p02.offer.synopsis,
    includes: [
      { title: 'Livro Eu Sou Bela — Do Meu Jeito', text: 'Sete capítulos com observações, perguntas e experiências opcionais.' },
      { title: 'Caderno da Minha Assinatura', text: 'Sete fichas para registar o que descobre sobre o seu estilo e a sua presença.' },
      { title: 'Cartões de reflexão', text: 'Perguntas para revisitar quando quiser.' },
    ],
    structureTitle: 'Uma leitura de autoria pessoal',
    structure: [
      { title: 'Sete capítulos', text: 'Beleza, expressão pessoal, história de estilo e presença.' },
      { title: 'Experiências opcionais', text: 'Você escolhe o que experimentar e quando.' },
      { title: 'Liberdade de escolha', text: 'Não há um modelo certo a seguir: a referência é você.' },
    ],
    forWhom: ['Mulheres que querem uma relação mais livre com a própria imagem.', 'Quem gosta de exercícios de escrita e reflexão.', 'Quem procura leveza e autoria, não regras.'],
    notFor: ['Quem procura um método diagnóstico ou terapêutico.', 'Quem procura consultoria de imagem personalizada.'],
    notice: p02.offer.notice,
    facts: ['Livro + caderno + cartões', 'Leitura digital', 'Volume 2 · EspelhoMeu Editions'],
    checkout: p02.checkout, ...espelhoMedia('eu-sou-bela-do-meu-jeito', 2), ctaLabel: 'Quero descobrir o meu jeito',
  },
  {
    slug: '21-dias-meu-melhor-reflexo', series: 'EspelhoMeu', code: 'P03', title: '21 Dias — Meu Melhor Reflexo',
    hook: 'Um percurso gentil para me reencontrar todos os dias.',
    headline: 'Vinte e um encontros para observar, experimentar e continuar.',
    lead: 'Um percurso editorial em três momentos — observar com respeito, experimentar com curiosidade e continuar ao seu ritmo.',
    recognition: ['Quer criar um pequeno hábito de reflexão, sem cobrança?', 'Começa projetos pessoais com entusiasmo e perde o fio a meio?', 'Prefere avançar sem ter de provar resultados a ninguém?'],
    synopsis: p03.offer.synopsis,
    includes: [
      { title: 'Livro 21 Dias — Meu Melhor Reflexo', text: 'Vinte e um encontros organizados em três momentos.' },
      { title: 'Caderno Meu Melhor Reflexo', text: 'Para registar o percurso e as suas descobertas.' },
      { title: 'Cartões', text: 'Para recuperar ideias e perguntas sempre que quiser.' },
    ],
    structureTitle: 'Três momentos, vinte e um encontros',
    structure: [
      { title: 'Observar com respeito', text: 'Olhar para o presente sem julgamento.' },
      { title: 'Experimentar com curiosidade', text: 'Pequenas experiências opcionais, escolhidas por você.' },
      { title: 'Continuar ao seu ritmo', text: 'Manter o que fez sentido, sem comprovar resultados nem fotografias pessoais.' },
    ],
    forWhom: ['Adultas que querem um percurso de reflexão com estrutura.', 'Quem gosta de ter um caderno e cartões para acompanhar a leitura.', 'Quem prefere constância gentil a desafios intensos.'],
    notFor: ['Quem procura acompanhamento clínico ou terapêutico.', 'Quem procura um desafio com metas e prova de resultados.'],
    notice: p03.offer.notice,
    facts: ['Livro + caderno + cartões', 'Leitura digital', 'Volume 3 · EspelhoMeu Editions'],
    checkout: p03.checkout, ...espelhoMedia('21-dias-meu-melhor-reflexo', 3), ctaLabel: 'Quero começar o percurso',
  },
  {
    slug: 'recomecar-depois-dos-40', series: 'EspelhoMeu', code: 'P04', title: 'Recomeçar Depois dos 40',
    hook: 'Um convite para abrir espaço a uma nova fase.',
    headline: 'A maturidade não é prazo nem defeito a corrigir. É um novo capítulo.',
    lead: 'Sete capítulos sobre tempo, história pessoal, curiosidade, papéis e relações — para ler em qualquer ordem e escolher experiências pequenas e possíveis.',
    recognition: ['Sente que mudou e que alguns papéis já não lhe servem como antes?', 'Tem curiosidade por novos começos, mas sem pressa nem fórmulas?', 'Quer olhar para a sua história com mais gentileza?'],
    synopsis: p04.offer.synopsis,
    includes: [
      { title: 'Livro Recomeçar Depois dos 40', text: 'Sete capítulos para ler em qualquer ordem.' },
      { title: 'Mapa de Novos Capítulos', text: 'Uma ferramenta para organizar ideias e possibilidades.' },
      { title: 'Cartões de reflexão', text: 'Para registos privados e perguntas a guardar.' },
    ],
    structureTitle: 'Sete capítulos, a sua ordem',
    structure: [
      { title: 'Tempo e história pessoal', text: 'Olhar para o caminho feito sem o transformar em balanço.' },
      { title: 'Curiosidade, papéis e relações', text: 'Repensar o que mantém, o que muda e o que experimenta.' },
      { title: 'Experiências pequenas e possíveis', text: 'Passos à sua medida, escolhidos por você.' },
    ],
    forWhom: ['Mulheres a partir dos 40 que vivem uma fase de mudança.', 'Quem quer refletir sobre novos começos com calma.', 'Quem gosta de registar ideias em privado.'],
    notFor: ['Quem procura aconselhamento clínico ou psicológico.', 'Quem procura um plano de carreira ou coaching personalizado.'],
    notice: p04.offer.notice,
    facts: ['Livro + mapa + cartões', 'Leitura digital', 'Volume 4 · EspelhoMeu Editions'],
    checkout: p04.checkout, ...espelhoMedia('recomecar-depois-dos-40', 4), ctaLabel: 'Quero abrir este capítulo',
  },
  {
    slug: 'diario-de-amor-proprio', series: 'EspelhoMeu', code: 'P05', title: 'Diário de Amor-Próprio — 30 Encontros Comigo',
    hook: '30 encontros comigo mesma, no meu próprio ritmo.',
    headline: 'Trinta convites à escrita pessoal. Nenhuma obrigação de os cumprir todos.',
    lead: 'Presença, memórias, corpo, escolhas e continuidade — encontros para ler sem frequência obrigatória, com páginas que podem ficar em branco.',
    recognition: ['Gostaria de escrever mais sobre si, sem saber por onde começar?', 'Quer um espaço privado, só seu, sem ninguém a ler?', 'Prefere convites gentis em vez de exercícios obrigatórios?'],
    synopsis: p05.offer.synopsis,
    includes: [
      { title: 'Diário de Amor-Próprio', text: 'Trinta encontros de escrita pessoal.' },
      { title: 'Caderno complementar', text: 'Mais espaço para continuar a escrever.' },
      { title: 'Cartões de reflexão', text: 'Perguntas para revisitar quando quiser.' },
    ],
    structureTitle: 'Trinta encontros, no seu ritmo',
    structure: [
      { title: 'Presença e memórias', text: 'Encontros para olhar para o agora e para o caminho.' },
      { title: 'Corpo e escolhas', text: 'Convites a escrever sobre o que sente e decide.' },
      { title: 'Continuidade', text: 'Sem frequência obrigatória: algumas páginas podem ficar em branco.' },
    ],
    forWhom: ['Quem quer criar um hábito de escrita pessoal.', 'Quem valoriza privacidade: as respostas não são recolhidas.', 'Quem procura um espaço de cuidado consigo.'],
    notFor: ['Quem procura psicoterapia ou acompanhamento clínico.'],
    notice: p05.offer.notice,
    facts: ['Diário + caderno + cartões', 'Leitura digital', 'Volume 5 · EspelhoMeu Editions'],
    checkout: p05.checkout, ...espelhoMedia('diario-de-amor-proprio', 5), ctaLabel: 'Quero o meu diário',
  },
  {
    slug: 'tomei-mounjaro-e-agora', series: 'Me Sentir Leve', code: 'MSL001', title: 'Tomei Mounjaro. E Agora?',
    hook: 'O peso pode mudar. Mas como cuidar de tudo o resto?',
    headline: 'Uma leitura educativa para o que vem além dos números da balança.',
    lead: 'Um livro independente sobre as questões que podem surgir durante um tratamento com tirzepatida — expectativas, informação científica, segurança, rotina, alimentação, força e imagem corporal.',
    recognition: ['Está em tratamento, ou a ponderar, e tem mais perguntas do que respostas?', 'Quer chegar à próxima consulta com dúvidas mais claras?', 'Procura informação séria, sem promessas nem atalhos?'],
    synopsis: 'O livro aborda expectativas, informação científica, segurança, mudanças na rotina, alimentação, força, imagem corporal e a importância do acompanhamento profissional. Inclui reflexões e perguntas para preparar conversas com a equipa de saúde.',
    includes: [
      { title: 'eBook Tomei Mounjaro. E Agora?', text: 'Edição digital A5 com 97 páginas.' },
      { title: 'Reflexões e perguntas', text: 'Para preparar conversas mais esclarecidas com a sua equipa de saúde.' },
    ],
    structureTitle: 'O que a leitura aborda',
    structure: [
      { title: 'Expectativas e informação', text: 'O que a ciência diz e o que ainda não se sabe.' },
      { title: 'Segurança e rotina', text: 'Mudanças na rotina, alimentação e força, para além do peso.' },
      { title: 'Imagem corporal e acompanhamento', text: 'Cuidar de tudo o resto, com apoio profissional.' },
    ],
    forWhom: ['Adultos em tratamento com tirzepatida, ou a ponderá-lo com o seu médico.', 'Familiares que querem compreender melhor o processo.', 'Quem quer informação educativa e independente.'],
    notFor: ['Quem procura doses, instruções de administração ou prescrição.', 'Quem procura substituir consulta ou orientação médica.'],
    notice: 'Não é um manual de administração ou prescrição de medicamentos. Não ensina doses, não recomenda iniciar ou interromper tratamentos e não promete resultados individuais. Obra independente, sem afiliação ou endosso do fabricante. Não substitui consulta ou orientação médica.',
    facts: ['eBook · 97 páginas', 'Edição digital A5', 'Me Sentir Leve · MSL001'],
    checkout: 'https://pay.hotmart.com/S108189606N', hero: '/editorial/hero/me-sentir-leve-msl001.webp', banner: mslBanners.mounjaro, og: '/editorial/og/me-sentir-leve-msl001.jpg',
    ctaLabel: 'Quero ler o livro', sitePage: '/me-sentir-leve/tomei-mounjaro-e-agora', roomPath: '/experiencia/me-sentir-leve',
  },
  {
    slug: 'corpo-forte-alem-da-balanca', series: 'Me Sentir Leve', code: 'MSL002 + MSL003', title: 'Corpo Forte — Além da Balança',
    hook: 'Uma jornada de 8 semanas para cuidar do corpo com mais consciência, força e continuidade.',
    headline: 'Seu corpo é muito mais do que um número na balança.',
    lead: 'Um guia digital de bem-estar para olhar para o próprio corpo de forma mais ampla, valorizando a força, a autonomia, o descanso e as escolhas possíveis na vida real.',
    recognition: ['Cansou de medir o progresso só pela balança?', 'Quer cuidar do corpo com mais consistência, sem pressão estética?', 'Precisa de uma estrutura que caiba na sua rotina real?'],
    synopsis: 'Ao longo de oito semanas, a leitura apresenta o Método F.O.R.T.E., organizado em cinco pilares, e acompanha-o com um workbook de aplicação e propostas de continuidade para os 90 dias seguintes.',
    includes: [
      { title: 'eBook Corpo Forte — Além da Balança', text: 'Guia editorial em quatro atos e oito semanas, com leituras sobre força funcional, movimento, alimentação, recuperação, identidade e continuidade. 80 páginas.' },
      { title: 'Workbook O Meu Corpo em Construção — incluído', text: 'Caderno de aplicação para as oito semanas, com exercícios de reflexão, atividades opcionais, espaços para escrita, ferramentas reutilizáveis e propostas de continuidade para 90 dias. 57 páginas.' },
    ],
    structureTitle: 'O Método F.O.R.T.E.',
    structure: [
      { title: 'F — Força', text: 'Reconhecer e valorizar suas capacidades.' },
      { title: 'O — Organização', text: 'Construir condições para cuidar de si dentro da sua rotina.' },
      { title: 'R — Recuperação', text: 'Compreender a importância do descanso e das pausas.' },
      { title: 'T — Trajetória', text: 'Observar o percurso sem transformar cada dificuldade em fracasso.' },
      { title: 'E — Evolução', text: 'Aprender, adaptar e continuar no seu próprio ritmo.' },
    ],
    forWhom: ['Mulheres adultas que desejam explorar novas formas de cuidar do corpo.', 'Quem quer organizar a rotina e refletir sobre bem-estar.', 'Quem não quer depender só de números, comparações ou padrões estéticos.'],
    notFor: ['Quem procura um programa de exercício individualizado ou prescrição alimentar.', 'Quem procura diagnóstico ou orientação médica.'],
    notice: 'Este produto tem finalidade educativa. Não constitui programa de exercício individualizado, prescrição alimentar, diagnóstico ou orientação médica. As atividades são opcionais e não substituem a avaliação de profissionais habilitados.',
    facts: ['eBook + workbook incluído', '8 semanas · Método F.O.R.T.E.', 'Me Sentir Leve · MSL002 + MSL003'],
    checkout: 'https://pay.hotmart.com/K108189729W', hero: '/editorial/hero/me-sentir-leve-msl002.webp', banner: mslBanners.corpoForte, og: '/editorial/og/me-sentir-leve-msl002.jpg',
    ctaLabel: 'Quero começar as 8 semanas', sitePage: '/me-sentir-leve/corpo-forte', roomPath: '/experiencia/corpo',
  },
];

export function findProduct(slug?: string | null) { return products.find(product => product.slug === slug); }
export function seriesSiblings(product: Product) { return products.filter(item => item.series === product.series && item.slug !== product.slug); }
