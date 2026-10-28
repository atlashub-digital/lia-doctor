import {hotmartMounjaro} from '@/lib/catalog';

/**
 * Direct link to the official Hotmart payment page. The Hotmart modal widget (`hotmart-fb`, checkoutMode=2) is
 * deliberately not loaded: on 28/10/2026 it was observed removing the buy buttons from the page (including the live
 * Mounjaro page) and it pulls jQuery over plain http, which https pages block. The payment page is the same checkout.
 */
export function HotmartCheckout({label='Quero conhecer a oferta',checkout=hotmartMounjaro,className='btn btn-primary',fallback=true}:{label?:string;checkout?:string;className?:string;fallback?:boolean}){
 const href=checkout.split('?')[0];
 return <div className="checkout-actions">
  <a className={className} href={href} rel="noopener noreferrer">{label}<span aria-hidden="true">↗</span></a>
  {fallback?<a className="text-link checkout-fallback" href={href} target="_blank" rel="noopener noreferrer">Abrir checkout Hotmart em nova aba</a>:null}
 </div>;
}
