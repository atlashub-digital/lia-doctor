import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findProduct, products, seriesSiblings } from '@/lib/products';
import { CheckoutLink } from '@/components/sales/CheckoutLink';
import { StickyBuy } from '@/components/sales/StickyBuy';
import { SocialLinks } from '@/components/SocialLinks';
import './sales.css';

// Sales landing page per work, built for paid traffic: one offer, one action, no site navigation competing with it.
// Shareable as https://www.lia.doctor/livros/<slug>; campaign parameters are forwarded to the Hotmart checkout.
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return products.map(product => ({ slug: product.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = findProduct((await params).slug);
  if (!product) return { title: 'Livro não encontrado' };
  const title = `${product.title} — ${product.hook}`;
  return {
    title: { absolute: `${product.title} | LIA.doctor` },
    description: product.lead,
    alternates: { canonical: `/livros/${product.slug}` },
    openGraph: { type: 'website', title, description: product.lead, url: `/livros/${product.slug}`, images: [{ url: product.og, width: 1200, height: 630, alt: product.title }], locale: 'pt_BR', siteName: 'LIA.doctor' },
    twitter: { card: 'summary_large_image', title, description: product.lead, images: [product.og] },
  };
}

const faq = (title: string, notice: string) => [
  ['Como recebo o livro?', 'A compra e a entrega são feitas pela Hotmart. Depois da confirmação do pagamento, recebe por e-mail as instruções de acesso aos materiais digitais.'],
  ['O pagamento é seguro?', 'Sim. O pagamento é processado no checkout oficial da Hotmart, onde vê o preço final, a moeda e as formas de pagamento disponíveis antes de concluir.'],
  ['Em que dispositivos posso ler?', 'Os materiais são digitais: pode ler no smartphone, tablet ou computador.'],
  ['Preciso seguir um calendário?', `Não. ${title} foi pensado para ser lido no seu ritmo.`],
  ['Isto substitui acompanhamento profissional?', notice],
] as const;

export default async function SalesPage({ params }: Props) {
  const product = findProduct((await params).slug);
  if (!product) notFound();
  const theme = product.series === 'EspelhoMeu' ? 'sp-espelho' : 'sp-leve';
  const jsonLd = { '@context': 'https://schema.org', '@type': 'Book', name: product.title, description: product.synopsis, bookFormat: 'https://schema.org/EBook', inLanguage: 'pt-BR', image: `https://www.lia.doctor${product.og}`, url: `https://www.lia.doctor/livros/${product.slug}`, publisher: { '@type': 'Organization', name: product.series === 'EspelhoMeu' ? 'EspelhoMeu Editions' : 'LIA.doctor' } };
  return <div className={`sp ${theme}`}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <header className="sp-top"><Link href="/" className="sp-logo">LIA<span>.</span>doctor</Link><span className="sp-series">{product.series}</span></header>

    <section className="sp-hero">
      <div className="sp-wrap sp-hero-grid">
        <div className="sp-hero-copy">
          <span className="sp-eyebrow">{product.series} · {product.code}</span>
          <h1>{product.title}</h1>
          <p className="sp-hook">{product.hook}</p>
          <p className="sp-lead">{product.lead}</p>
          <ul className="sp-facts">{product.facts.map(fact => <li key={fact}>{fact}</li>)}</ul>
          <CheckoutLink checkout={product.checkout} className="sp-btn" placement="hero">{product.ctaLabel} <span aria-hidden="true">→</span></CheckoutLink>
          <p className="sp-secure">Pagamento seguro na Hotmart · Acesso digital enviado por e-mail</p>
        </div>
        <div className="sp-hero-visual"><Image src={product.hero} alt={`Capa de ${product.title}`} width={920} height={724} priority sizes="(max-width: 860px) 100vw, 560px" /></div>
      </div>
    </section>

    <section className="sp-section sp-recognition"><div className="sp-wrap sp-narrow">
      <h2>{product.headline}</h2>
      <ul>{product.recognition.map(item => <li key={item}>{item}</li>)}</ul>
      <p>Se respondeu que sim a alguma destas perguntas, esta leitura foi escrita a pensar em você.</p>
    </div></section>

    <section className="sp-section sp-about"><div className="sp-wrap sp-two">
      <div><span className="sp-eyebrow">Sobre a obra</span><h2>O que vai encontrar</h2><p className="sp-body">{product.synopsis}</p></div>
      <div className="sp-includes"><span className="sp-eyebrow">O que recebe</span>
        <ol>{product.includes.map((item, i) => <li key={item.title}><span className="sp-num">{String(i + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
      </div>
    </div></section>

    {/* The official banner has a drawn "start" button, so the whole banner leads to the checkout. */}
    <section className="sp-banner"><div className="sp-wrap"><CheckoutLink checkout={product.checkout} className="sp-banner-link" placement="banner"><Image src={product.banner} alt={`${product.title}: ${product.ctaLabel}`} width={2172} height={724} sizes="(max-width: 1240px) 100vw, 1180px" /></CheckoutLink></div></section>

    <section className="sp-section sp-structure"><div className="sp-wrap">
      <h2>{product.structureTitle}</h2>
      <div className={`sp-steps sp-steps-${product.structure.length}`}>{product.structure.map(step => <article key={step.title}><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      <div className="sp-cta-row"><CheckoutLink checkout={product.checkout} className="sp-btn" placement="middle">{product.ctaLabel} <span aria-hidden="true">→</span></CheckoutLink></div>
    </div></section>

    <section className="sp-section sp-fit"><div className="sp-wrap sp-two">
      <div className="sp-yes"><h2>É para você se…</h2><ul>{product.forWhom.map(item => <li key={item}>{item}</li>)}</ul></div>
      <div className="sp-no"><h2>Não é para você se…</h2><ul>{product.notFor.map(item => <li key={item}>{item}</li>)}</ul><p className="sp-notice">{product.notice}</p></div>
    </div></section>

    <section className="sp-section sp-trust"><div className="sp-wrap sp-trust-grid">
      <div><h3>Compra segura</h3><p>Checkout oficial da Hotmart, com o preço final e as formas de pagamento visíveis antes de concluir.</p></div>
      <div><h3>Entrega digital</h3><p>Após a confirmação do pagamento, a Hotmart envia por e-mail o acesso aos materiais.</p></div>
      <div><h3>Ao seu ritmo</h3><p>Sem calendário obrigatório nem partilha de respostas. Os seus registos são seus.</p></div>
    </div></section>

    <section className="sp-section sp-faq"><div className="sp-wrap sp-narrow">
      <h2>Perguntas frequentes</h2>
      {faq(product.title, product.notice).map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
    </div></section>

    <section className="sp-final"><div className="sp-wrap sp-narrow">
      <span className="sp-eyebrow">{product.series}</span>
      <h2>{product.title}</h2>
      <p>{product.hook}</p>
      <CheckoutLink checkout={product.checkout} className="sp-btn sp-btn-light" placement="final">{product.ctaLabel} <span aria-hidden="true">→</span></CheckoutLink>
      <p className="sp-secure">Pagamento seguro na Hotmart</p>
    </div></section>

    {seriesSiblings(product).length ? <section className="sp-section sp-more"><div className="sp-wrap">
      <h2>Outras leituras da série {product.series}</h2>
      <div className="sp-more-grid">{seriesSiblings(product).map(item => <Link key={item.slug} href={`/livros/${item.slug}`}><Image src={item.hero} alt="" width={460} height={362} sizes="(max-width: 860px) 50vw, 280px" /><strong>{item.title}</strong><span>{item.hook}</span></Link>)}</div>
    </div></section> : null}

    <footer className="sp-footer"><div className="sp-wrap">
      <SocialLinks compact />
      <p>Conteúdo educativo. Não substitui acompanhamento profissional de saúde. Pagamentos e entrega processados pela Hotmart.</p>
      <p><Link href="/">Visitar a casa LIA</Link> · <Link href={product.sitePage}>Ficha na coleção</Link> · <Link href="/privacidade">Privacidade</Link></p>
    </div></footer>

    <StickyBuy checkout={product.checkout} title={product.title} label="Comprar" />
  </div>;
}
