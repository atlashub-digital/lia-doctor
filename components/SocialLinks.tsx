const officialChannels = [
  { label: 'Facebook', href: 'https://web.facebook.com/lia.levelab', icon: '/brands/facebook.svg' },
  { label: 'YouTube', href: 'https://www.youtube.com/@LIA.Doctor', icon: '/brands/youtube.svg' },
  { label: 'TikTok', href: 'https://tiktok.com/@lia.doctor', icon: '/brands/tiktok.svg' },
  { label: 'Instagram', href: 'https://www.instagram.com/lia.levelab', icon: '/brands/instagram.svg' },
  { label: 'Grupo WhatsApp', href: 'https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3', icon: '/brands/whatsapp.svg' },
  { label: 'WhatsApp da LIA', href: 'https://wa.me/5515981383291', icon: '/brands/whatsapp.svg' },
] as const;

// Official destinations. Brand marks are Simple Icons SVGs (CC0) served from /public/brands, so the footer has no
// third-party runtime dependency; labels stay visible as text.
export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return <nav className={compact ? 'social-links social-links-compact' : 'social-links'} aria-label="Canais oficiais da LIA">
    {officialChannels.map(({ label, href, icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
      <img src={icon} width={23} height={23} alt="" loading="lazy" decoding="async" />
      <span>{label}</span>
    </a>)}
  </nav>;
}
