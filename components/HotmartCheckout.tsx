'use client';
import {useEffect} from 'react';
import {hotmartMounjaro} from '@/lib/catalog';

/** Hotmart supplies the payment modal; if the script is blocked, the href still works. */
export function HotmartCheckout({label='Quero conhecer a oferta'}:{label?:string}){
 useEffect(()=>{
  const cssId='hotmart-widget-css';
  if(!document.getElementById(cssId)){
    const link=document.createElement('link');link.id=cssId;link.rel='stylesheet';
    link.href='https://static.hotmart.com/css/hotmart-fb.min.css';document.head.appendChild(link);
  }
  const jsId='hotmart-widget-js';
  if(!document.getElementById(jsId)){
    const script=document.createElement('script');script.id=jsId;script.src='https://static.hotmart.com/checkout/widget.min.js';script.async=true;document.head.appendChild(script);
  }
 },[]);
 return <div className="checkout-actions">
  <a className="btn btn-primary hotmart-fb hotmart__button-checkout" href={hotmartMounjaro} rel="noopener noreferrer">
   {label}<span aria-hidden="true">↗</span>
  </a>
  <a className="text-link checkout-fallback" href={hotmartMounjaro} target="_blank" rel="noopener noreferrer">Abrir checkout Hotmart em nova aba</a>
 </div>;
}
