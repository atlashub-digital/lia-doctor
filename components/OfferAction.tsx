import Link from 'next/link';
import type { Offer } from '@/lib/offers';

/** Purchase affordance for an EspelhoMeu volume. Only Direction-confirmed Hotmart checkouts become buttons. */
export function OfferAction({ offer, libraryHref }: { offer: Offer; libraryHref: string }) {
  return <div className="checkout-actions">
    {offer.commerce.status === 'live'
      ? <a className="btn btn-primary" href={offer.commerce.checkout} rel="noopener noreferrer">Comprar na Hotmart <span aria-hidden="true">↗</span></a>
      : <p className="product-note offer-pending" role="note">Compra deste volume nesta loja em preparação.</p>}
    <Link className="text-link" href={libraryHref}>Ver na Livraria EspelhoMeu <span aria-hidden="true">→</span></Link>
  </div>;
}
