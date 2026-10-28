import type {Offer} from '@/lib/offers';
const live=(id:string):Offer['commerce']=>({status:'live',checkout:'https://pay.hotmart.com/'+id,hotlink:'https://go.hotmart.com/'+id+'?dp=1',widget:{enabled:false}});
export const leveOffers:Offer[]=[
 {slug:'tomei-mounjaro-e-agora',code:'MSL001',productCode:'MSL001',title:'Tomei Mounjaro. E Agora?',eyebrow:'Informação sem promessas',
 description:'O peso pode mudar. Mas como cuidar de tudo o resto? Uma leitura educativa e independente sobre questões durante um tratamento com tirzepatida, para além dos números na balança.',
 details:'Expectativas, segurança, alimentação, rotina, força, imagem corporal e acompanhamento profissional. Não ensina doses nem substitui consulta médica. Obra sem afiliação ou endosso do fabricante.',
 collection:'Me Sentir Leve',includes:['Guia educativo digital','Reflexões e perguntas para levar à equipa de saúde'],commerce:live('S108189606N'),cover:{status:'pending-editorial'},banner:'/products/banner-leve-mounjaro.png'},
 {slug:'corpo-forte',code:'MSL002',productCode:'MSL002 + MSL003',title:'Corpo Forte — Além da Balança',eyebrow:'Livro + workbook incluído',
 description:'Uma jornada editorial de oito semanas para explorar força, autonomia, recuperação, organização e evolução, para além da balança.',
 details:'Método F.O.R.T.E.: Força, Organização, Recuperação, Trajetória e Evolução. Conteúdo educativo, não é prescrição de exercício, dieta ou orientação médica.',
 collection:'Me Sentir Leve',includes:['eBook Corpo Forte — Além da Balança','Workbook O Meu Corpo em Construção incluído','Propostas de continuidade para os próximos 90 dias'],commerce:live('K108189729W'),cover:{status:'pending-editorial'},banner:'/products/banner-leve-corpo-forte.png'}
];
export function findLeveOffer(slug?:string|null){return leveOffers.find(o=>o.slug===slug);}
