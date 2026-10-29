'use client';
import { useEffect, useState } from 'react';

// Campaign parameters forwarded from the landing URL to the Hotmart checkout, so paid-traffic sales are attributed
// (Hotmart reads src/sck and utm_* on the payment page). Only an allowlist is forwarded; nothing personal.
const FORWARD = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck', 'xcod'];

export function withCampaign(checkout: string, search: string) {
  const incoming = new URLSearchParams(search);
  const url = new URL(checkout);
  for (const key of FORWARD) { const value = incoming.get(key); if (value) url.searchParams.set(key, value.slice(0, 120)); }
  return url.toString();
}

export function CheckoutLink({ checkout, className, children, placement }: { checkout: string; className: string; children: React.ReactNode; placement: string }) {
  const [href, setHref] = useState(checkout);
  useEffect(() => { setHref(withCampaign(checkout, window.location.search)); }, [checkout]);
  return <a className={className} href={href} rel="noopener noreferrer" data-checkout={placement}>{children}</a>;
}
