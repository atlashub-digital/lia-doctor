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
    eyebrow:'O primeiro passo',description:'Sete convites para reconhecer, refletir e escolher no seu ritmo.',
    details:'Leitura, jornada de sete dias e caderno de atividades.'
  },
  {
    slug:'eu-sou-bela-do-meu-jeito',code:'02',title:'Eu Sou Bela — Do Meu Jeito',
    eyebrow:'Expressão e identidade',description:'Uma leitura sobre a liberdade de se reconhecer do seu jeito.',
    details:'Uma experiência editorial sobre beleza e expressão pessoal.'
  },
  {
    slug:'21-dias-meu-melhor-reflexo',code:'03',title:'21 Dias — Meu Melhor Reflexo',
    eyebrow:'Ver · experimentar · evoluir',description:'Vinte e um encontros para observar, experimentar e continuar.',
    details:'Três atos, caderno de atividades e cartões de reflexão.'
  },
  {
    slug:'recomecar-depois-dos-40',code:'04',title:'Recomeçar Depois dos 40',
    eyebrow:'Novos capítulos',description:'Para quem deseja olhar para novos começos com mais gentileza.',
    details:'Leitura de reflexão sobre escolhas e possibilidades.'
  },
  {
    slug:'diario-de-amor-proprio',code:'05',title:'Diário de Amor-Próprio',
    eyebrow:'Um encontro consigo',description:'Um espaço para registar pensamentos, reencontros e pequenas escolhas.',
    details:'Diário e exercícios editoriais para acompanhar a leitura.'
  }
];
export const hotmartMounjaro = 'https://pay.hotmart.com/S108189606N?checkoutMode=2';
