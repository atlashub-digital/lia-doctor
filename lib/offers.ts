import {espelho,type Book} from '@/lib/catalog';
export type Commerce={status:'live';checkout:string;hotlink:string;widget:{enabled:false}}|{status:'pending';reason:string};
export type Cover={status:'pending-editorial'}|{status:'approved';src:string;width:number;height:number};
export type Offer=Book&{productCode:string;collection:string;includes:string[];commerce:Commerce;cover:Cover;banner:string};
const live=(id:string):Commerce=>({status:'live',checkout:'https://pay.hotmart.com/'+id,hotlink:'https://go.hotmart.com/'+id+'?dp=1',widget:{enabled:false}});
const data:Record<string,{id:string;includes:string[];banner:string}>={
 '01':{id:'A108182228Y',includes:['eBook 7 Dias Para Me Escolher','Workbook complementar de reflexão'],banner:'/products/banner-espelho-p01.png'},
 '02':{id:'A108182278G',includes:['Livro de sete capítulos','Caderno da Minha Assinatura','Sete fichas e cartões de reflexão'],banner:'/products/banner-espelho-p02.png'},
 '03':{id:'E108183347V',includes:['Livro de vinte e um encontros','Caderno Meu Melhor Reflexo','Cartões de reflexão'],banner:'/products/banner-espelho-p03.png'},
 '04':{id:'D108183354F',includes:['Livro de sete capítulos','Mapa de Novos Capítulos','Cartões de reflexão'],banner:'/products/banner-espelho-p04.png'},
 '05':{id:'E108186873J',includes:['Diário de trinta encontros','Caderno complementar','Cartões de reflexão'],banner:'/products/banner-espelho-p05.png'}
};
export const espelhoOffers:Offer[]=espelho.map(book=>({...book,productCode:'P'+book.code,collection:'EspelhoMeu Editions',includes:data[book.code].includes,commerce:live(data[book.code].id),cover:{status:'pending-editorial'},banner:data[book.code].banner}));
export function findOffer(slug?:string|null){return espelhoOffers.find(o=>o.slug===slug);}
