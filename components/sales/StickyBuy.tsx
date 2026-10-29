'use client';
import { useEffect, useState } from 'react';
import { CheckoutLink } from './CheckoutLink';

// Mobile purchase bar: appears once the hero CTA has scrolled out of view, hides again at the final CTA.
export function StickyBuy({ checkout, title, label }: { checkout: string; title: string; label: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('[data-checkout="hero"]'), final = document.querySelector('[data-checkout="final"]');
    if (!hero || !final) return;
    const state = { hero: true, final: false };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) { if (entry.target === hero) state.hero = entry.isIntersecting; else state.final = entry.isIntersecting; }
      setVisible(!state.hero && !state.final);
    });
    observer.observe(hero); observer.observe(final);
    return () => observer.disconnect();
  }, []);
  return <div className={`sp-sticky ${visible ? 'is-visible' : ''}`} aria-hidden={!visible}>
    <span>{title}</span>
    <CheckoutLink checkout={checkout} className="sp-btn sp-btn-sm" placement="sticky">{label}</CheckoutLink>
  </div>;
}
