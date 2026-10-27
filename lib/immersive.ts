import manifest from '@/docs/immersive/02_SCENE_MANIFEST.json';
import { espelho } from '@/lib/catalog';

export const sceneManifest = manifest;
export const canonicalImage = '/immersive/lia-canonical.png';
// Shared optimized texture: CSS crops and 3D should not redownload the 2.7 MB master.
export const sceneTexture = '/_next/image?url=%2Fimmersive%2Flia-canonical.png&w=1920&q=90';
export const rooms = [
  { ...manifest.doors[0], material: '#efc2aa', accent: '#814731', subtitle: 'Autoestima · identidade · beleza real', description: 'Um espaço para se reconhecer, com verdade e gentileza.', destination: '/espelho-meu', cta: 'Explorar EspelhoMeu', book: 2 },
  { ...manifest.doors[1], material: '#244c39', accent: '#f5e8cc', subtitle: 'Bem-estar · hábitos · equilíbrio', description: 'Informação e leituras para acompanhar o seu próximo capítulo.', destination: '/me-sentir-leve', cta: 'Explorar Me Sentir Leve', book: 0 },
  { ...manifest.doors[2], material: '#e8dbc2', accent: '#4a4936', subtitle: 'Energia · equilíbrio · corpo forte', description: 'Conheça Corpo Forte — Além da Balança, com o workbook O Meu Corpo em Construção incluído.', destination: '/me-sentir-leve/corpo-forte', cta: 'Conhecer Corpo Forte', book: 1 },
  { ...manifest.doors[3], material: '#a3b3a0', accent: '#253d32', subtitle: 'Clareza · pausa · vida mais leve', description: 'Novos conteúdos de Mente & Calma estão em preparação. Enquanto isso, conheça a Comunidade LIA.', destination: manifest.community.url, cta: 'Conhecer a comunidade', book: null },
] as const;
export type Room = (typeof rooms)[number];
export type RoomId = Room['id'];
export function findRoom(id?: string | null) { return rooms.find(room => room.id === id); }
export const books = [
  { id: 'mounjaro', title: 'Tomei Mounjaro. E Agora?', note: 'Informação para o seu próximo capítulo.', href: manifest.sales.mounjaro.page, cover: [770, 574, 880, 754] },
  { id: 'corpo-forte', title: 'Corpo Forte — Além da Balança', note: 'Com o workbook O Meu Corpo em Construção.', href: manifest.sales.corpo.page, cover: [1047, 575, 1168, 755] },
  { id: 'eu-sou-bela', title: 'Eu Sou Bela Do Meu Jeito', note: 'Expressar quem sou, com verdade e gentileza.', href: '/espelho-meu/eu-sou-bela-do-meu-jeito', cover: [1343, 576, 1468, 753] },
] as const;
// Living library of the EspelhoMeu room: real catalogue volumes, internal routes, no invented covers.
export const espelhoLibrary = espelho.map(book => ({ ...book, href: `/espelho-meu/${book.slug}` }));
export type LibraryBookId = (typeof espelhoLibrary)[number]['slug'];
export const mirrorReflection = 'Há espaço para me reconhecer.';
export const socialLabels: Record<string, string> = { facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' };
export function hotspotStyle(bounds: readonly number[]) {
  return { left: `${bounds[0] / 16.72}%`, top: `${bounds[1] / 9.41}%`, width: `${(bounds[2] - bounds[0]) / 16.72}%`, height: `${(bounds[3] - bounds[1]) / 9.41}%` };
}
export function cropStyle(bounds: readonly number[]) {
  const width = bounds[2] - bounds[0], height = bounds[3] - bounds[1];
  return { backgroundImage: `url(${sceneTexture})`, backgroundSize: `${1672 / width * 100}% ${941 / height * 100}%`, backgroundPosition: `${bounds[0] / (1672 - width) * 100}% ${bounds[1] / (941 - height) * 100}%` };
}
