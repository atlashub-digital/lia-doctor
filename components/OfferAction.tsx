import Link from 'next/link';
import type { Offer } from '@/lib/offers';
import { HotmartCheckout } from '@/components/HotmartCheckout';

/** Purchase affordance for an EspelhoMeu volume. Only Direction-confirmed Hotmart checkouts become buttons. */
export function OfferAction({ offer, libraryHref }: { offer: Offer; libraryHref: string }) {
  return <>
    {offer.commerce.status === 'live'
      ? <HotmartCheckout label="Comprar na Hotmart" checkout={offer.commerce.checkout} />
      : <p className="product-note offer-pending" role="note">Compra deste volume nesta loja em preparação.</p>}
    <Link className="text-link" href={libraryHref}>Ver na Livraria EspelhoMeu <span aria-hidden="true">→</span></Link>
  </>;
}
