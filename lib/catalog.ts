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
    eyebrow:'O primeiro passo',description:'Sete encontros curtos para observar o presente, reconhecer pequenas escolhas e abrir espaço para o que faz sentido para você.',
    details:'Leitura, jornada de sete dias e caderno de atividades.'
  },
  {
    slug:'eu-sou-bela-do-meu-jeito',code:'02',title:'Eu Sou Bela — Do Meu Jeito',
    eyebrow:'Expressão e identidade',description:'Explore beleza, expressão pessoal, história de estilo e presença sem transformar a aparência em obrigação.',
    details:'Uma experiência editorial sobre beleza e expressão pessoal.'
  },
  {
    slug:'21-dias-meu-melhor-reflexo',code:'03',title:'21 Dias — Meu Melhor Reflexo',
    eyebrow:'Ver · experimentar · evoluir',description:'Vinte e um encontros em três momentos: observar com respeito, experimentar com curiosidade e continuar ao seu ritmo.',
    details:'Três atos, caderno de atividades e cartões de reflexão.'
  },
  {
    slug:'recomecar-depois-dos-40',code:'04',title:'Recomeçar Depois dos 40',
    eyebrow:'Novos capítulos',description:'Sete capítulos sobre tempo, história pessoal, curiosidade, papéis e relações; a maturidade não é um prazo nem um defeito.',
    details:'Leitura de reflexão sobre escolhas e possibilidades.'
  },
  {
    slug:'diario-de-amor-proprio',code:'05',title:'Diário de Amor-Próprio — 30 Encontros Comigo',
    eyebrow:'Um encontro consigo',description:'Trinta convites à escrita pessoal sobre presença, memórias, corpo, escolhas e continuidade, no seu ritmo.',
    details:'Diário e exercícios editoriais para acompanhar a leitura.'
  }
];
export const hotmartMounjaro = 'https://pay.hotmart.com/S108189606N?checkoutMode=2';
