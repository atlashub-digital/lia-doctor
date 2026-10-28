import Link from 'next/link';
const socials = [
  { name: 'Facebook', href: 'https://web.facebook.com/lia.levelab', icon: 'facebook' },
  { name: 'YouTube', href: 'https://www.youtube.com/@LIA.Doctor', icon: 'youtube' },
  { name: 'TikTok', href: 'https://tiktok.com/@lia.doctor', icon: 'tiktok' },
  { name: 'Instagram', href: 'https://www.instagram.com/lia.levelab', icon: 'instagram' },
] as const;
const groupUrl = 'https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3';
const liaWhatsappUrl = 'https://wa.me/5515981383291';
export function SiteFooter(){
 return <footer className="site-footer"><div className="container footer-grid">
  <div><Link className="footer-brand" href="/">LIA<span>.</span>DOCTOR</Link><p>Histórias, leituras e recursos para o seu próximo capítulo.</p><p className="footer-muted">Um ecossistema editorial. Duas coleções com identidade própria.</p></div>
  <div><div className="footer-label">EXPLORAR</div><Link href="/me-sentir-leve">Me Sentir Leve</Link><Link href="/espelho-meu">EspelhoMeu</Link><Link href="/privacidade">Privacidade</Link></div>
  <div><div className="footer-label">CONECTE-SE À LIA</div><nav aria-label="Redes sociais oficiais da LIA" style={{display:'flex',flexWrap:'wrap',gap:'12px',margin:'12px 0'}}>
  {socials.map(s=><a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} style={{display:'inline-flex',alignItems:'center',gap:'6px'}}><img src={`https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/${s.icon}.svg`} width={20} height={20} alt="" aria-hidden="true" loading="lazy"/>{s.name}</a>)}</nav>
  <a href={groupUrl} target="_blank" rel="noopener noreferrer">Grupo WhatsApp LIA ↗</a>
  <a href={liaWhatsappUrl} target="_blank" rel="noopener noreferrer">Falar com a LIA no WhatsApp ↗</a>
  </div>
  <div><div className="footer-label">INFORMAÇÃO</div><p>Os conteúdos publicados são educativos e não substituem acompanhamento profissional de saúde.</p><p>Pagamentos e entrega dos produtos Hotmart são processados na plataforma Hotmart.</p></div>
 </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} LIA.DOCTOR</span><span>Publicações com intenção. Sem pressa e sem promessas impossíveis.</span></div></footer>;
}
