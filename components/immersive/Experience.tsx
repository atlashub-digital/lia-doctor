'use client';

import { getImageProps } from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { Component, useEffect, useRef, useState, type CSSProperties, type ErrorInfo, type ReactNode } from 'react';
import { books, canonicalImage, cropStyle, findRoom, hotspotStyle, mirrorReflection, rooms, sceneManifest, type RoomId } from '@/lib/immersive';
import { espelhoOffers, findOffer, type Offer } from '@/lib/offers';
import { bannerForEspelho } from '@/lib/editorial-banners';
import { HotmartCheckout } from '@/components/HotmartCheckout';
import Image from 'next/image';
import { ChatPanel } from './ChatPanel';
import { FocusDialog } from './FocusDialog';
import { SocialLinks } from '@/components/SocialLinks';
import './experience.css';

const PortalScene = dynamic(() => import('./PortalScene'), { ssr: false });
const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const desktopPhoto = getImageProps({ src: canonicalImage, width: 1672, height: 941, sizes: '100vw', quality: 90, alt: 'LIA sentada numa sala mediterrânea, quatro portas arqueadas em pêssego, verde profundo, marfim e sálvia; três livros e a Comunidade LIA.' }).props;
const mobilePhoto = getImageProps({ src: '/immersive/lia-cutout.png', width: 1200, height: 1297, sizes: '100vw', alt: '' }).props;
type Panel = 'about' | 'areas' | 'books' | 'search' | null;

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function Experience({ enabled, voiceEnabled }: { enabled: boolean; voiceEnabled: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = findRoom(pathname.split('/')[2]);
  // Shareable selection: /experiencia/espelho-meu/<volume> opens that volume's editorial sheet.
  const roomBook = selected?.id === 'espelho-meu' ? findOffer(pathname.split('/')[3]) : undefined;
  const [travelling, setTravelling] = useState<RoomId | null>(null);
  const [phase, setPhase] = useState('idle');
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chat, setChat] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);
  const [focusBook, setFocusBook] = useState<string | null>(null);
  const roomHeading = useRef<HTMLHeadingElement>(null);
  const sheetHeading = useRef<HTMLHeadingElement>(null);
  const roomOrigin = useRef(selected?.id ?? null);
  const bookOrigin = useRef(roomBook?.slug ?? null);
  // True when the open sheet was pushed from this room, so closing can pop history instead of adding an entry.
  const openedHere = useRef(false);
  const canRender = enabled && webgl && !reduced && !failed;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 767px)');
    const update = () => { setReduced(motion.matches); setMobile(narrow.matches); };
    update();
    motion.addEventListener('change', update); narrow.addEventListener('change', update);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    setWebgl(Boolean(context));
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return () => { motion.removeEventListener('change', update); narrow.removeEventListener('change', update); };
  }, []);

  useEffect(() => {
    const roomId = selected?.id ?? null;
    if (roomOrigin.current !== roomId) {
      roomOrigin.current = roomId;
      setTravelling(null); setPhase('idle'); setFocusBook(null);
      if (selected) requestAnimationFrame(() => roomHeading.current?.focus());
    }
  }, [selected]);

  useEffect(() => {
    const slug = roomBook?.slug ?? null, previous = bookOrigin.current;
    if (previous === slug) return;
    bookOrigin.current = slug;
    // Focus follows the book: into the sheet when it opens, back to the volume's link when it returns to the shelf.
    if (slug) requestAnimationFrame(() => sheetHeading.current?.focus());
    else { openedHere.current = false; if (previous) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-volume="${previous}"]`)?.focus()); }
  }, [roomBook]);

  function openBook(slug: string) {
    if (slug === roomBook?.slug) return;
    openedHere.current = !roomBook;
    if (roomBook) router.replace(`/experiencia/espelho-meu/${slug}`, { scroll: false });
    else router.push(`/experiencia/espelho-meu/${slug}`, { scroll: false });
  }
  function closeBook() {
    if (openedHere.current) router.back();
    else router.push('/experiencia/espelho-meu', { scroll: false });
  }

  useEffect(() => {
    if (!travelling) return;
    // Navigation remains available even if loading WebGL/assets stalls.
    const fallback = window.setTimeout(() => { setTravelling(null); router.push(`/experiencia/${travelling}`); }, 7000);
    return () => window.clearTimeout(fallback);
  }, [travelling, router]);

  function enter(id: RoomId) {
    if (travelling) return;
    if (!canRender || !ready) { router.push(`/experiencia/${id}`); return; }
    setPhase('preparing-room'); setTravelling(id);
  }
  function sceneFailed() { setFailed(true); setReady(false); }
  const current = travelling ?? selected?.id ?? null;
  const activeScene = Boolean(travelling || selected);
  const status = travelling ? `A entrar em ${findRoom(travelling)?.label}…` : selected ? `Sala ${selected.label}` : '';
  const searchItems = [...books.map(book => ({ title: book.title, href: book.href })), ...rooms.map(room => ({ title: room.label, href: `/experiencia/${room.id}` }))].filter(item => item.title.toLocaleLowerCase('pt').includes(query.toLocaleLowerCase('pt')));

  return <div className={`lia-experience ${selected ? 'is-room' : ''} ${travelling ? 'is-travelling' : ''} ${roomBook ? 'has-book' : ''}`} data-phase={phase} data-mode={canRender ? 'webgl' : 'html'} data-scene-ready={ready}>
    <h1 className="lia-sr">LIA.doctor — A companheira da sua jornada</h1>
    <div className="lia-announcement lia-sr" role="status" aria-live="polite">{status}</div>
    <div className="lia-stage" aria-label="Sala mediterrânea LIA">
      <div className={`lia-reference ${activeScene && canRender ? 'is-hidden' : ''}`}>
        <picture><source media="(min-width: 768px)" srcSet={desktopPhoto.srcSet} sizes="100vw" /><img src={transparentPixel} alt={desktopPhoto.alt} fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></picture>
      </div>

      {canRender ? <div className={`lia-canvas ${activeScene ? 'is-active' : ''} ${selected?.id === 'espelho-meu' && !travelling ? 'is-interactive' : ''}`} aria-hidden="true">
        <SceneBoundary onFailure={sceneFailed}><PortalScene room={current} travelling={travelling !== null} mobile={mobile} focusBook={focusBook} selectedBook={roomBook?.slug ?? null} onHoverBook={setFocusBook} onSelectBook={openBook} onReady={() => setReady(true)} onFailure={sceneFailed} onPhase={setPhase} onArrive={() => { if (travelling) { setPhase('room-ready'); router.push(`/experiencia/${travelling}`); } }} /></SceneBoundary>
      </div> : null}

      {!selected ? <>
        <nav className="lia-photo-nav" aria-label="Navegação da experiência">
          <Link className="lia-hotspot" style={hotspotStyle([670, 10, 739, 64])} href="/experiencia"><span className="lia-sr">Início</span></Link>
          <button className="lia-hotspot" style={hotspotStyle([757, 10, 830, 64])} onClick={() => setPanel('about')}><span className="lia-sr">Sobre a LIA</span></button>
          <button className="lia-hotspot" style={hotspotStyle([842, 10, 974, 64])} onClick={() => setPanel('areas')}><span className="lia-sr">Nossas áreas</span></button>
          <button className="lia-hotspot" style={hotspotStyle([993, 10, 1088, 64])} onClick={() => setPanel('books')}><span className="lia-sr">Produtos</span></button>
          <a className="lia-hotspot" style={hotspotStyle([1102, 10, 1225, 64])} href={sceneManifest.community.url} target="_blank" rel="noopener noreferrer"><span className="lia-sr">Comunidade — abrir WhatsApp</span></a>
          <button className="lia-hotspot" style={hotspotStyle([1359, 5, 1402, 65])} onClick={() => setPanel('search')}><span className="lia-sr">Pesquisar leituras e áreas</span></button>
        </nav>
        <div className="lia-desktop-actions" inert={travelling ? true : undefined}>
          {rooms.map(room => <Link key={room.id} href={`/experiencia/${room.id}`} className="lia-hotspot lia-door-hit" style={hotspotStyle(room.boundsPx)} aria-label={`Entrar em ${room.label}`} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); enter(room.id); } }}><span className="lia-door-tip">Entrar em {room.label} <span aria-hidden="true">→</span></span></Link>)}
          <button className="lia-hotspot lia-person-hit" style={hotspotStyle(sceneManifest.hotspots[0].boundsPx)} aria-label="Conversar com a LIA, assistente IA" aria-haspopup="dialog" onClick={() => setChat(true)}><span className="lia-person-tip">Olá, sou a LIA. Vamos conversar? <span aria-hidden="true">↗</span></span></button>
          <button className="lia-hotspot lia-chat-hit" style={hotspotStyle(sceneManifest.hotspots[1].boundsPx)} aria-label="Abrir conversa com a LIA" aria-haspopup="dialog" onClick={() => setChat(true)} />
          {books.map((book, i) => <Link key={book.id} href={book.href} className="lia-hotspot lia-book-hit" style={hotspotStyle(sceneManifest.hotspots[i + 2].boundsPx)} aria-label={`Conhecer ${book.title}`} />)}
          {[sceneManifest.hotspots[5], sceneManifest.hotspots[6]].map(hotspot => <a key={hotspot.id} className="lia-hotspot lia-community-hit" style={hotspotStyle(hotspot.boundsPx)} href={sceneManifest.community.url} target="_blank" rel="noopener noreferrer" aria-label="Entrar na Comunidade LIA — WhatsApp" />)}
        </div>
      </> : null}

      {selected ? <div className={`lia-room-overlay ${!canRender ? 'lia-room-fallback' : ''}`} style={{ '--room-color': selected.material } as CSSProperties}>
        <Link href="/experiencia" className="lia-back">← Voltar ao lobby</Link>
        <article className="lia-room-copy">
          <span className="lia-eyebrow">O UNIVERSO LIA / {selected.id === 'mente-e-calma' ? 'EM BREVE' : 'UM ESPAÇO SEU'}</span>
          <h2 ref={roomHeading} tabIndex={-1}>{selected.label}</h2>
          <p className="lia-room-subtitle">{selected.subtitle}</p>
          <p>{selected.description}</p>
          <a href={selected.destination} className="lia-pill" {...(selected.destination.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{selected.cta} <span aria-hidden="true">→</span></a>
          <button className="lia-text-button" onClick={() => setChat(true)}>Conversar com a LIA <span aria-hidden="true">↗</span></button>
        </article>
        {selected.id === 'espelho-meu' ? <LivingLibrary active={focusBook} selectedSlug={roomBook?.slug ?? null} onFocus={setFocusBook} onOpen={openBook} mirrorShown={canRender && !mobile} /> : null}
        {roomBook ? <BookSheet key={roomBook.slug} offer={roomBook} headingRef={sheetHeading} onClose={closeBook} showCover={!canRender || mobile} /> : null}
        <nav className="lia-room-switcher" aria-label="Outras salas">{rooms.filter(room => room.id !== selected.id).map(room => <Link key={room.id} href={`/experiencia/${room.id}`}>{room.label} <span aria-hidden="true">↗</span></Link>)}</nav>
      </div> : null}
      {travelling ? <button className="lia-cancel" onClick={() => { setTravelling(null); setPhase('idle'); }}>Cancelar entrada</button> : null}
    </div>

    {!selected ? <div className="lia-mobile-content">
      <header className="lia-mobile-header"><Link href="/experiencia" className="lia-wordmark">LIA.doctor</Link><button onClick={() => setPanel('search')} aria-label="Pesquisar">⌕</button><a href={sceneManifest.community.url} target="_blank" rel="noopener noreferrer" aria-label="Comunidade LIA no WhatsApp">Comunidade ↗</a></header>
      <section className="lia-mobile-welcome"><div className="lia-mobile-portrait" role="img" aria-label="LIA, assistente de inteligência artificial"><picture><source media="(max-width: 767px)" srcSet={mobilePhoto.srcSet} sizes="100vw" /><img src={transparentPixel} alt="" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></picture></div><div><span className="lia-eyebrow">UM ESPAÇO SEU</span><h2>A companheira<br /><em>da sua jornada.</em></h2><p>Mais conhecimento.<br />Mais equilíbrio. Mais tu.</p><button className="lia-pill" onClick={() => setChat(true)}>Olá, sou a LIA. Conversamos? ↗</button><small>Assistente de inteligência artificial</small></div></section>
      <section className="lia-mobile-areas" aria-labelledby="areas-heading"><span className="lia-eyebrow">QUATRO CAMINHOS PARA SI</span><h2 id="areas-heading">Por onde vamos começar?</h2><div className="lia-mobile-doors">{rooms.map((room, i) => <Link key={room.id} href={`/experiencia/${room.id}`} className="lia-mobile-door" style={{ '--door-tone': room.material } as CSSProperties} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey) { event.preventDefault(); enter(room.id); } }}><div className="lia-door-view" style={cropStyle([room.boundsPx[0] + (i === 0 ? 63 : 15), 320, room.boundsPx[2] - 8, 525])} /><span className="lia-door-number">0{i + 1}</span><strong>{room.label}</strong><span>{room.subtitle}</span><span className="lia-door-arrow" aria-hidden="true">→</span></Link>)}</div></section>
      <section className="lia-mobile-books" id="leituras"><span className="lia-eyebrow">LEITURAS QUE ACOMPANHAM</span><h2>Um livro para cada momento.</h2><div className="lia-reading-list">{books.map(book => <Link href={book.href} key={book.id}><span className="lia-cover" style={cropStyle(book.cover)} /><span><strong>{book.title}</strong><small>{book.note}</small><span className="lia-reading-cta">Conhecer →</span></span></Link>)}</div></section>
      <a className="lia-community-card" href={sceneManifest.community.url} target="_blank" rel="noopener noreferrer"><span className="lia-eyebrow">UM ESPAÇO PARA PARTILHAR</span><h2>Comunidade LIA <span aria-hidden="true">↗</span></h2><p>Aprender, partilhar e evoluir juntas.</p><span>Entrar na comunidade →</span></a>
    </div> : null}

    <footer className="lia-footer"><Link href="/">LIA.doctor <span>Leituras & experiências</span></Link><SocialLinks compact /><Link href="/privacidade">Privacidade</Link><button className="lia-text-button" onClick={() => setPanel('about')}>Sobre a LIA</button></footer>

    {chat ? <ChatPanel voiceEnabled={voiceEnabled} onClose={() => setChat(false)} /> : null}
    {panel ? <FocusDialog title={panel === 'about' ? 'Sobre a LIA' : panel === 'areas' ? 'Quatro caminhos para si' : panel === 'books' ? 'Leituras que acompanham' : 'O que procura?'} onClose={() => { setPanel(null); setQuery(''); }}>
      {panel === 'about' ? <><p>Um espaço editorial para conhecer, refletir e encontrar leituras que façam sentido para si.</p><p>A LIA é uma assistente de inteligência artificial. Não substitui acompanhamento profissional. Evite partilhar dados pessoais ou clínicos no chat público.</p><Link className="lia-pill" href="/privacidade">Ler a política de privacidade →</Link></> : null}
      {panel === 'search' ? <label className="lia-search">Pesquisar<input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Um livro, uma área…" /></label> : null}
      {panel === 'areas' ? <div className="lia-dialog-links">{rooms.map(room => <Link key={room.id} href={`/experiencia/${room.id}`} onClick={() => setPanel(null)}>{room.label} <span aria-hidden="true">→</span></Link>)}</div> : null}
      {panel === 'books' || panel === 'search' ? <div className="lia-dialog-links">{(panel === 'books' ? books.map(book => ({ title: book.title, href: book.href })) : searchItems).map(item => <Link key={item.href} href={item.href} onClick={() => setPanel(null)}>{item.title} <span aria-hidden="true">→</span></Link>)}{panel === 'search' && !searchItems.length ? <p role="status">Nenhum resultado. Experimente outra palavra.</p> : null}</div> : null}
    </FocusDialog> : null}
  </div>;
}

// Signature move of the Golden Room: focusing a volume here pulls the same volume out of the 3D niche; choosing it
// carries the book to the visitor and opens its sheet. The list is the keyboard/screen-reader path to the same state.
function LivingLibrary({ active, selectedSlug, onFocus, onOpen, mirrorShown }: { active: string | null; selectedSlug: string | null; onFocus: (slug: string | null) => void; onOpen: (slug: string) => void; mirrorShown: boolean }) {
  const book = espelhoOffers.find(item => item.slug === active);
  return <section className="lia-library" aria-labelledby="lia-library-heading" onMouseLeave={() => onFocus(null)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onFocus(null); }}>
    <p className={mirrorShown ? 'lia-sr' : 'lia-library-reflection'}>{mirrorReflection}</p>
    <h3 id="lia-library-heading" className="lia-eyebrow">Livraria EspelhoMeu · Cinco volumes</h3>
    <ol className="lia-library-list">
      {espelhoOffers.map(item => <li key={item.slug}><Link href={`/experiencia/espelho-meu/${item.slug}`} scroll={false} data-volume={item.slug}
        aria-current={selectedSlug === item.slug ? 'true' : undefined} aria-describedby={active === item.slug ? 'lia-library-label' : undefined}
        className={active === item.slug || selectedSlug === item.slug ? 'is-focused' : undefined} onMouseEnter={() => onFocus(item.slug)} onFocus={() => onFocus(item.slug)}
        onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) { event.preventDefault(); onOpen(item.slug); } }}>
        <span className="lia-library-code">{item.code}</span>{item.title}</Link></li>)}
    </ol>
    <div id="lia-library-label" className="lia-library-label" aria-live="polite">
      {book ? <><span className="lia-eyebrow">{book.eyebrow}</span><p>{book.description}</p><small>{book.details}</small></> : <small>Escolha um volume para o ver de perto.</small>}
    </div>
  </section>;
}

// Editorial sheet for the presented volume: printed-paper treatment, real catalogue copy, Hotmart only when confirmed.
function BookSheet({ offer, headingRef, onClose, showCover }: { offer: Offer; headingRef: React.RefObject<HTMLHeadingElement | null>; onClose: () => void; showCover: boolean }) {
  const close = useRef(onClose); close.current = onClose;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Chat and panels are modal dialogs with their own Escape; never close the book underneath them.
      if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector('dialog[open]')) return;
      close.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const live = offer.commerce.status === 'live' ? offer.commerce : null;
  return <section className="lia-book-sheet" role="dialog" aria-modal="false" aria-labelledby="lia-book-title">
    <button className="lia-book-close" onClick={onClose} aria-label="Fechar a ficha e devolver o livro à estante"><span aria-hidden="true">×</span></button>
    {/* Without the 3D book (no WebGL, reduced motion, mobile layout), the official banner carries the cover art. */}
    {showCover ? <Image className="lia-book-banner" src={bannerForEspelho(offer.slug)} alt={`Banner oficial: ${offer.title}`} width={2172} height={724} sizes="(max-width: 767px) 92vw, 420px" /> : null}
    <span className="lia-eyebrow">{offer.collection} · Volume {offer.code}</span>
    <h2 id="lia-book-title" ref={headingRef} tabIndex={-1}>{offer.title}</h2>
    <p className="lia-book-kicker">{offer.eyebrow}</p>
    <p className="lia-book-synopsis">{offer.synopsis}</p>
    <h3 className="lia-eyebrow">Inclui</h3>
    <ul className="lia-book-includes">{offer.includes.map(item => <li key={item}>{item}</li>)}</ul>
    <dl className="lia-book-facts">
      <div><dt>Coleção</dt><dd>{offer.collection}</dd></div>
      <div><dt>Referência</dt><dd>{offer.productCode}</dd></div>
      <div><dt>Compra e entrega</dt><dd>{live ? 'Hotmart' : 'Em preparação nesta loja'}</dd></div>
    </dl>
    <p className="lia-book-notice">{offer.notice}</p>
    {live ? <>
      <HotmartCheckout label="Comprar na Hotmart" checkout={live.checkout} className="lia-pill lia-book-buy" fallback={false} />
      <p className="lia-book-fineprint">Pagamento seguro e entrega feitos pela Hotmart.</p>
    </> : <p className="lia-book-pending" role="note">A compra deste volume nesta loja está em preparação.</p>}
    <button className="lia-text-button lia-book-return" onClick={onClose}>Devolver à estante</button>
  </section>;
}
