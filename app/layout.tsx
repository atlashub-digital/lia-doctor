import type {Metadata,Viewport} from 'next';
import {SiteHeader} from '@/components/SiteHeader';
import {SiteFooter} from '@/components/SiteFooter';
import './globals.css';
export const metadata:Metadata={
 metadataBase:new URL('https://www.lia.doctor'),
 title:{default:'LIA.DOCTOR — Leituras que acompanham',template:'%s | LIA.DOCTOR'},
 description:'Conheça as coleções Me Sentir Leve e EspelhoMeu. eBooks e conteúdos editoriais para acompanhar o seu próximo capítulo.',
 alternates:{canonical:'/'},
 openGraph:{title:'LIA.DOCTOR — Leituras que acompanham',description:'Duas coleções, muitas formas de se reencontrar.',type:'website',locale:'pt_BR'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f5f0e8'};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="pt-BR"><body><a className="skip" href="#conteudo">Ir para o conteúdo</a><SiteHeader/><main id="conteudo">{children}</main><SiteFooter/></body></html>;
}
