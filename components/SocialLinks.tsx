const officialChannels = [
  { label: 'Facebook', href: 'https://web.facebook.com/lia.levelab', icon: 'https://cdn.simpleicons.org/facebook/1877F2' },
  { label: 'YouTube', href: 'https://www.youtube.com/@LIA.Doctor', icon: 'https://cdn.simpleicons.org/youtube/FF0033' },
  { label: 'TikTok', href: 'https://tiktok.com/@lia.doctor', icon: 'https://cdn.simpleicons.org/tiktok/25F4EE' },
  { label: 'Instagram', href: 'https://www.instagram.com/lia.levelab', icon: 'https://cdn.simpleicons.org/instagram/E4405F' },
  { label: 'Grupo WhatsApp', href: 'https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3', icon: 'https://cdn.simpleicons.org/whatsapp/25D366' },
  { label: 'WhatsApp da LIA', href: 'https://wa.me/5515981383291', icon: 'https://cdn.simpleicons.org/whatsapp/25D366' },
] as const;

// Official destinations. Brand silhouettes by Simple Icons; labels remain visible as a fallback.
export function SocialLinks({ compact = false }: { compact?: boolean }) {
  return <nav className={compact ? 'social-links social-links-compact' : 'social-links'} aria-label="Canais oficiais da LIA">
    {officialChannels.map(({ label, href, icon }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
      <img src={icon} width={23} height={23} alt="" loading="lazy" decoding="async" />
      <span>{label}</span>
    </a>)}
  </nav>;
}
