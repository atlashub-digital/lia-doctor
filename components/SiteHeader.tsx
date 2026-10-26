import Link from 'next/link';
export function SiteHeader(){
 return <header className="site-header"><div className="container header-inner">
  <Link href="/" aria-label="LIA Doctor — início" className="brand"><span className="brand-icon" aria-hidden="true">L.</span><span className="brand-word">LIA<span className="brand-dot">.</span>DOCTOR</span></Link>
  <nav className="nav" aria-label="Navegação principal">
   <Link href="/me-sentir-leve">Me Sentir Leve</Link>
   <Link href="/espelho-meu">EspelhoMeu</Link>
   <Link href="/#colecoes">Coleções</Link>
  </nav>
  <Link href="/me-sentir-leve/tomei-mounjaro-e-agora" className="nav-cta">Conhecer o lançamento <span aria-hidden="true">↗</span></Link>
 </div></header>;
}
