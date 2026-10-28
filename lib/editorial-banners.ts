export const espelhoBanners: Record<string, string> = {
  '7-dias-para-me-escolher': '/editorial/banners/espelho-p01.png',
  'eu-sou-bela-do-meu-jeito': '/editorial/banners/espelho-p02.png',
  '21-dias-meu-melhor-reflexo': '/editorial/banners/espelho-p03.png',
  'recomecar-depois-dos-40': '/editorial/banners/espelho-p04.png',
  'diario-de-amor-proprio': '/editorial/banners/espelho-p05.png',
};
export const mslBanners = {
  mounjaro: '/editorial/banners/me-sentir-leve-msl001.png',
  corpoForte: '/editorial/banners/me-sentir-leve-msl002.png',
} as const;
export function bannerForEspelho(slug: string): string { return espelhoBanners[slug] ?? espelhoBanners['7-dias-para-me-escolher']; }
