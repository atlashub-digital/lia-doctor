import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {espelho} from '@/lib/catalog';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return espelho.map(b=>({slug:b.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const book=espelho.find(x=>x.slug===slug);
 if(!book)return {title:'Livro não encontrado'};
 return {title:book.title+' — EspelhoMeu',description:book.description,alternates:{canonical:'/espelho-meu/'+slug}};
}
export default async function BookPage({params}:Props){
 const {slug}=await params;const book=espelho.find(x=>x.slug===slug);if(!book)notFound();
 return <><section className="product-hero espelho-book-hero"><div className="container product-hero-grid"><div className="product-main"><div className="breadcrumbs"><Link href="/">Início</Link><span>/</span><Link href="/espelho-meu">EspelhoMeu</Link><span>/</span><span>Volume {book.code}</span></div>
 <span className="eyebrow">ESPELHOMEU · VOLUME {book.code}</span><h1>{book.title}</h1><p className="lead">{book.description}</p><p className="product-note">{book.details}</p><a href={book.destination} className="btn btn-primary">Ver oferta no EspelhoMeu <span aria-hidden="true">↗</span></a><p className="small-print">A venda, o pagamento e o acesso deste volume continuam no portal EspelhoMeu, sem migração de clientes ou de direitos neste lançamento.</p></div><div className="espelho-art-large"><span>ESPELHOMEU EDITIONS</span><span className="large-flower">✺</span><h2>{book.title}</h2><span>VOLUME {book.code}</span></div></div></section>
 <section className="section paper-section"><div className="container centered-narrow"><span className="kicker">OUTRAS LEITURAS</span><h2>Uma coleção para continuar <em>a escolher.</em></h2><p>Explore os outros volumes e encontre o próximo capítulo.</p><Link className="btn btn-outline-dark" href="/espelho-meu">Voltar à coleção EspelhoMeu <span aria-hidden="true">→</span></Link></div></section></>;
}
