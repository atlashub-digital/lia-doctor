import type {Metadata} from 'next';
import Link from 'next/link';
import {BookArt} from '@/components/BookArt';
import {HotmartCheckout} from '@/components/HotmartCheckout';
export const metadata:Metadata={title:'Tomei Mounjaro. E Agora? — eBook',description:'Um guia educativo de 97 páginas para organizar perguntas, informação e cuidados. Conheça o livro e a oferta na Hotmart.',alternates:{canonical:'/me-sentir-leve/tomei-mounjaro-e-agora'}};
export default function Mounjaro(){
 return <><section className="product-hero"><div className="container product-hero-grid"><div className="product-main">
  <div className="breadcrumbs"><Link href="/">Início</Link><span>/</span><Link href="/me-sentir-leve">Me Sentir Leve</Link><span>/</span><span>MSL001</span></div>
  <span className="eyebrow"><span className="eyebrow-dot"/> UMA LEITURA PARA O SEU PRÓXIMO PASSO</span>
  <h1>Tomei Mounjaro.<br/><em>E Agora?</em></h1>
  <p className="lead">Entre tantas informações, uma coisa faz diferença: ter espaço para entender, perguntar e decidir com acompanhamento profissional.</p>
  <p className="product-note">Um guia educativo, com linguagem acessível, para apoiar conversas mais esclarecidas sobre o tratamento.</p>
  <div className="product-facts"><span>✦ 97 páginas</span><span>✦ Edição digital A5</span><span>✦ Entrega pela Hotmart</span></div>
  <HotmartCheckout label="Ver oferta e comprar na Hotmart"/>
  <p className="small-print">O preço final, a moeda e as formas de pagamento aparecem no checkout oficial da Hotmart. O acesso é enviado conforme a configuração do produto na plataforma.</p>
  </div><BookArt variant="mounjaro" title="Tomei Mounjaro. E Agora?" subtitle="Informação para continuar com mais clareza." label="ME SENTIR LEVE · MSL001"/></div></section>
  <section className="section paper-section"><div className="container"><div className="section-heading"><span className="kicker">PARA QUEM É ESTE LIVRO</span><h2>Mais informação. <em>Menos ruído.</em></h2><p>Uma leitura para quem quer transformar dúvidas em conversas produtivas, sem atalhos nem promessas irreais.</p></div>
  <div className="benefit-grid"><div><span className="benefit-no">01</span><h3>Organizar perguntas</h3><p>Encontrar espaço para reconhecer as dúvidas que merecem uma conversa com a sua equipa de saúde.</p></div><div><span className="benefit-no">02</span><h3>Olhar para o contexto</h3><p>Compreender a importância de informação, acompanhamento profissional e rotinas possíveis.</p></div><div><span className="benefit-no">03</span><h3>Respeitar o próprio caminho</h3><p>Abordar escolhas de cuidado sem comparação, culpabilização ou soluções universais.</p></div></div>
  </div></section>
  <section className="section dark-section"><div className="container centered-narrow"><span className="kicker">EDIÇÃO DIGITAL</span><h2>Um livro que acompanha a conversa. <em>Não a substitui.</em></h2><p>O conteúdo tem caráter informativo. Não fornece prescrição, diagnóstico ou orientação para alterar doses ou tratamentos. Para decisões clínicas, procure o seu profissional de saúde.</p><HotmartCheckout label="Conhecer a oferta Hotmart"/></div></section>
  <section className="section faq-section"><div className="container"><div className="section-heading left-heading"><span className="kicker">ANTES DE COMPRAR</span><h2>Perguntas <em>frequentes.</em></h2></div><div className="faq-list"><details><summary>Como recebo o eBook?<span>+</span></summary><p>O pagamento e a entrega são administrados pela Hotmart. Verifique as instruções de acesso apresentadas após a aprovação e no e-mail utilizado na compra.</p></details><details><summary>Preciso de criar uma conta no LIA.DOCTOR?<span>+</span></summary><p>Não. A compra e o acesso a este produto são geridos na plataforma Hotmart, sem login próprio neste site.</p></details><details><summary>Este livro substitui aconselhamento médico?<span>+</span></summary><p>Não. É uma publicação educativa e não substitui avaliação clínica, prescrição ou acompanhamento profissional.</p></details><details><summary>Posso pagar em reais?<span>+</span></summary><p>As moedas e opções de pagamento disponíveis dependem do checkout Hotmart para o seu país. Confirme a moeda e o valor total antes de concluir a compra.</p></details></div></div></section>
 </>;
}
