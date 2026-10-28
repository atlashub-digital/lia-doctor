import Link from 'next/link';
import {SocialLinks} from '@/components/SocialLinks';
export function SiteFooter(){
 return <footer className="site-footer"><div className="container footer-grid">
  <div><Link className="footer-brand" href="/">LIA<span>.</span>DOCTOR</Link><p>Histórias, leituras e recursos para o seu próximo capítulo.</p><p className="footer-muted">Um ecossistema editorial. Duas coleções com identidade própria.</p></div>
  <div><div className="footer-label">EXPLORAR</div><Link href="/me-sentir-leve">Me Sentir Leve</Link><Link href="/espelho-meu">EspelhoMeu</Link><Link href="/privacidade">Privacidade</Link></div>
  <div><div className="footer-label">INFORMAÇÃO</div><p>Os conteúdos publicados são educativos e não substituem acompanhamento profissional de saúde.</p><p>Pagamentos e entrega dos produtos Hotmart são processados na plataforma Hotmart.</p></div>
 <div className="footer-social"><strong>Siga a LIA</strong><SocialLinks/></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} LIA.DOCTOR</span><span>Publicações com intenção. Sem pressa e sem promessas impossíveis.</span></div></footer>;
}
