export type Collection = 'espelho' | 'leve';
export type Book = {
  slug: string;
  code: string;
  title: string;
  eyebrow: string;
  description: string;
  details: string;
};
export const espelho: Book[] = [
  {
    slug:'7-dias-para-me-escolher', code:'01',title:'7 Dias Para Me Escolher',
    eyebrow:'O primeiro passo',description:'Sete encontros curtos para reconhecer pequenas escolhas e abrir espaço para o que faz sentido para você.',
    details:'Inclui o eBook e workbook de reflexão. Educativo, para maiores de 18 anos; não substitui terapia.'
  },
  {
    slug:'eu-sou-bela-do-meu-jeito',code:'02',title:'Eu Sou Bela — Do Meu Jeito',
    eyebrow:'Expressão e identidade',description:'Explore beleza, expressão pessoal e presença sem transformar a aparência em obrigação.',
    details:'Sete capítulos e Caderno da Minha Assinatura com fichas e cartões; não é método terapêutico.'
  },
  {
    slug:'21-dias-meu-melhor-reflexo',code:'03',title:'21 Dias — Meu Melhor Reflexo',
    eyebrow:'Ver · experimentar · evoluir',description:'Vinte e um encontros em três momentos: observar, experimentar e continuar ao seu ritmo.',
    details:'Inclui livro, Caderno Meu Melhor Reflexo e cartões de reflexão. Atividades opcionais.'
  },
  {
    slug:'recomecar-depois-dos-40',code:'04',title:'Recomeçar Depois dos 40',
    eyebrow:'Novos capítulos',description:'Sete capítulos sobre tempo, história pessoal, curiosidade, papéis e relações.',
    details:'Inclui livro, Mapa de Novos Capítulos e cartões de reflexão. Conteúdo educativo.'
  },
  {
    slug:'diario-de-amor-proprio',code:'05',title:'Diário de Amor-Próprio',
    eyebrow:'Um encontro consigo',description:'Trinta encontros de escrita sobre presença, memórias, corpo, escolhas e continuidade.',
    details:'Inclui diário, caderno complementar e cartões. Não substitui psicoterapia.'
  }
];
export const hotmartMounjaro = 'https://pay.hotmart.com/S108189606N?checkoutMode=2';
