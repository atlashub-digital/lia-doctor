'use client';

import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useLayoutEffect, useRef, useState } from 'react';
import { canonicalImage } from '@/lib/immersive';
import './entry.css';

// Camera keyframes over the canonical master, as [scale, focus x, focus y] in image fractions. The focus point is
// brought to the viewport centre: approach on the four doors, reveal the room, arrive on LIA with the doors behind.
type Shot = { scale: number; fx: number; fy: number };
const SHOTS: Record<'desktop' | 'mobile', Shot[]> = {
  desktop: [{ scale: 2.5, fx: .69, fy: .4 }, { scale: 1.4, fx: .6, fy: .46 }, { scale: 1, fx: .5, fy: .5 }],
  mobile: [{ scale: 1.9, fx: .69, fy: .4 }, { scale: 1.25, fx: .52, fy: .46 }, { scale: 1, fx: .31, fy: .5 }],
};
const frame = ({ scale, fx, fy }: Shot) => ({ scale, xPercent: -50 - (fx - .5) * 100 * scale, yPercent: -50 - (fy - .5) * 100 * scale });

export function CinematicEntry() {
  const root = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const scope = root.current, lens = camera.current;
    if (!scope || !lens) return;
    const shots = window.matchMedia('(max-width: 767px)').matches ? SHOTS.mobile : SHOTS.desktop;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduced) {
        // No camera move: the final composition, CTA visible, nothing to skip.
        gsap.set(lens, { ...frame(shots[2]), filter: 'none' });
        gsap.set('.entry-curtain', { autoAlpha: 0 });
        gsap.set('.entry-arrival', { autoAlpha: 1, y: 0 });
        setDone(true);
        return;
      }
      gsap.set(lens, { ...frame(shots[0]), filter: 'blur(7px) brightness(.72)' });
      gsap.set('.entry-arrival', { autoAlpha: 0, y: 14 });
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      tl.to('.entry-line', { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out' })
        .to('.entry-line', { autoAlpha: 0, duration: .45, ease: 'power1.in' }, '+=.55')
        .to('.entry-curtain', { autoAlpha: 0, duration: 1.1, ease: 'power2.inOut' }, '-=.2')
        .to(lens, { filter: 'blur(0px) brightness(1)', duration: 1.4, ease: 'power2.out' }, '<')
        .to(lens, { ...frame(shots[1]), duration: 1.9, ease: 'power2.inOut' }, '<.2')
        .to(lens, { ...frame(shots[2]), duration: 1.7, ease: 'power3.inOut' }, '-=.25')
        .to('.entry-arrival', { autoAlpha: 1, y: 0, duration: .6, ease: 'power2.out' }, '-=.35');
      timeline.current = tl;
    }, scope);
    return () => ctx.revert();
  }, []);

  function skip() {
    timeline.current?.progress(1);
    setDone(true);
    requestAnimationFrame(() => cta.current?.focus());
  }

  return <div ref={root} className={`entry ${done ? 'is-done' : ''}`}>
    <h1 className="entry-sr">LIA.doctor — entrada</h1>
    <div className="entry-viewport" aria-hidden="true">
      <div ref={camera} className="entry-camera">
        <Image src={canonicalImage} alt="" fill priority quality={90} sizes="(max-width: 767px) 300vw, 150vw" />
      </div>
    </div>
    <div className="entry-curtain" aria-hidden="true"><p className="entry-line">Um espaço seu.</p></div>
    {!done ? <button type="button" className="entry-skip" onClick={skip}>Saltar introdução</button> : null}
    <div className="entry-arrival">
      <p className="entry-sr">No átrio, a LIA, assistente de inteligência artificial da LIA.doctor, dá as boas-vindas. Ao fundo, quatro portas: EspelhoMeu, Me Sentir Leve, Corpo e Mente &amp; Calma.</p>
      <Link ref={cta} href="/experiencia" className="entry-cta">Entrar no átrio <span aria-hidden="true">→</span></Link>
    </div>
  </div>;
}
