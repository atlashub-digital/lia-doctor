import type {Metadata} from 'next';
import Link from 'next/link';
import {espelhoOffers as espelho} from '@/lib/offers';
export const metadata:Metadata={title:'EspelhoMeu — Biblioteca editorial',description:'Cinco volumes sobre escolhas, reflexão, identidade e amor-próprio. Explore a coleção EspelhoMeu.',alternates:{canonical:'/espelho-meu'}};
export default function Espelho(){return <>
<section className="collection-hero espelho-hero"><div className="container"><span className="eyebrow">LIA.DOCTOR / COLEÇÕES / 02</span><h1>Espelho<em>Meu.</em></h1><p>Um espaço para se reconhecer, fazer perguntas e escolher o que faz sentido para você.</p><div className="section-rule"/></div></section>
<section className="section"><div className="container"><div className="section-heading left-heading"><span className="kicker">A COLEÇÃO COMPLETA</span><h2>Cinco caminhos.<br/><em>No seu ritmo.</em></h2><p>Conheça cada livro e os respetivos materiais, ou entre na Livraria EspelhoMeu.</p></div>
<div className="volume-grid">{espelho.map(b=><Link href={'/espelho-meu/'+b.slug} key={b.slug} className="volume-card"><div className="volume-art"><img className="volume-banner" src={b.banner} alt={`Banner oficial de ${b.title}`} /></div><div className="volume-info"><span className="kicker">{b.eyebrow}</span><h3>{b.title}</h3><p>{b.description}</p><span className="text-link">Conhecer livro <span aria-hidden="true">↗</span></span></div></Link>)}</div>
<div className="collection-banner"><div><span className="kicker">TODOS OS VOLUMES</span><h3>Uma coleção.<br/><em>Várias formas de se escolher.</em></h3><p>Encontre as cinco leituras e os seus materiais correspondentes.</p></div><Link href="/experiencia/espelho-meu" className="btn btn-light">Entrar na Livraria EspelhoMeu <span aria-hidden="true">→</span></Link></div>
</div></section></>;}
