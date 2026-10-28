import type {Metadata} from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {bannerForEspelho} from '@/lib/editorial-banners';
import {notFound} from 'next/navigation';
import {espelho} from '@/lib/catalog';
import {findOffer} from '@/lib/offers';
import {OfferAction} from '@/components/OfferAction';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return espelho.map(b=>({slug:b.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const book=espelho.find(x=>x.slug===slug);
 if(!book)return {title:'Livro não encontrado'};
 return {title:book.title+' — EspelhoMeu',description:book.description,alternates:{canonical:'/espelho-meu/'+slug}};
}
export default async function BookPage({params}:Props){
 const {slug}=await params;const book=findOffer(slug);if(!book)notFound();
 return <><section className="product-hero espelho-book-hero"><div className="container product-hero-grid"><div className="product-main"><div className="breadcrumbs"><Link href="/">Início</Link><span>/</span><Link href="/espelho-meu">EspelhoMeu</Link><span>/</span><span>Volume {book.code}</span></div>
 <span className="eyebrow">ESPELHOMEU · VOLUME {book.code}</span><h1>{book.title}</h1><p className="lead">{book.description}</p><p className="product-note">{book.details}</p><OfferAction offer={book} libraryHref={'/experiencia/espelho-meu/'+book.slug}/><p className="small-print">{book.commerce.status==='live'?'Pagamento e entrega feitos pela Hotmart. Compras anteriores e acessos existentes mantêm-se inalterados.':'Este volume ainda não tem compra disponível nesta loja. Compras anteriores e acessos existentes mantêm-se inalterados.'}</p></div><div className="espelho-art-large"><span>ESPELHOMEU EDITIONS</span><span className="large-flower">✺</span><h2>{book.title}</h2><span>VOLUME {book.code}</span></div></div></section>
 <section className="editorial-banner-section"><div className="container"><Image src={bannerForEspelho(book.slug)} alt={`Banner oficial: ${book.title}`} width={2172} height={724} sizes="(max-width: 750px) 100vw, 1220px" className="editorial-banner-image"/></div></section>
 <section className="section paper-section"><div className="container centered-narrow"><span className="kicker">OUTRAS LEITURAS</span><h2>Uma coleção para continuar <em>a escolher.</em></h2><p>Explore os outros volumes e encontre o próximo capítulo.</p><Link className="btn btn-outline-dark" href="/espelho-meu">Voltar à coleção EspelhoMeu <span aria-hidden="true">→</span></Link></div></section></>;
}
