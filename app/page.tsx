import type {Metadata} from 'next';
import Link from 'next/link';
import {BookArt} from '@/components/BookArt';
export const metadata:Metadata={alternates:{canonical:'/'}};
export default function Home(){
 return <>
 <section className="hero-home"><div className="container hero-home-grid">
 <div className="home-text"><span className="eyebrow"><span className="eyebrow-dot"/> LIA.DOCTOR · EDIÇÕES & EXPERIÊNCIAS</span>
  <h1>Há histórias que nos ajudam a <em>continuar.</em></h1>
  <p className="lead">Leituras para quem está a descobrir novas formas de cuidar de si, conhecer o seu corpo e escrever outros capítulos.</p>
  <div className="hero-actions"><Link className="btn btn-primary" href="/me-sentir-leve">Explorar Me Sentir Leve <span aria-hidden="true">↗</span></Link><Link className="btn btn-outline" href="/espelho-meu">Conhecer EspelhoMeu <span aria-hidden="true">→</span></Link></div>
  <div className="trust-row"><span>✧ Livros digitais</span><span>✧ Compra segura</span><span>✧ Acesso pela plataforma de entrega</span></div>
 </div>
 <div className="home-stage"><BookArt variant="mounjaro" title="Tomei Mounjaro. E Agora?" subtitle="Um guia educativo para seguir com informação." label="ME SENTIR LEVE"/>
 <div className="stage-badge">01 / 02 <strong>Novas leituras,<br/> novos começos</strong></div></div>
 </div></section>
 <section id="colecoes" className="section collection-section"><div className="container"><div className="section-heading"><span className="kicker">DUAS COLEÇÕES, UM ESPAÇO</span><h2>Um livro para cada <em>momento.</em></h2><p>Conheça os caminhos editoriais que vivem no ecossistema LIA.</p></div>
 <div className="collection-grid">
 <Link href="/me-sentir-leve" className="collection-card green-card"><div className="collection-card-top"><span>COLEÇÃO 01</span><span className="tiny-arrow">↗</span></div><div className="collection-symbol">✳</div><h3>Me Sentir<br/><em>Leve.</em></h3><p>Informação, bem-estar e reflexões para acompanhar escolhas mais conscientes.</p><span className="collection-link">Explorar coleção <span aria-hidden="true">→</span></span></Link>
 <Link href="/espelho-meu" className="collection-card clay-card"><div className="collection-card-top"><span>COLEÇÃO 02</span><span className="tiny-arrow">↗</span></div><div className="collection-symbol">✦</div><h3>Espelho<em>Meu.</em></h3><p>Uma coleção editorial sobre identidade, amor-próprio e a liberdade de se escolher.</p><span className="collection-link">Explorar coleção <span aria-hidden="true">→</span></span></Link>
 </div></div></section>
 <section className="section statement-section"><div className="container statement-inner"><span className="kicker">NOSSA ESSÊNCIA</span><blockquote>Não é sobre chegar mais depressa. É sobre encontrar leituras que façam sentido <em>para você, agora.</em></blockquote><Link className="text-link" href="/me-sentir-leve/tomei-mounjaro-e-agora">Conhecer o lançamento Tomei Mounjaro. E Agora? <span aria-hidden="true">↗</span></Link></div></section>
 </>;
}
