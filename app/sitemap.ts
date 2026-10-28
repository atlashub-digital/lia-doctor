import type {MetadataRoute} from 'next';
import {espelho} from '@/lib/catalog';
import {products} from '@/lib/products';
export default function sitemap():MetadataRoute.Sitemap{
 const base='https://www.lia.doctor';
 const routes=['','/colecoes','/me-sentir-leve','/me-sentir-leve/tomei-mounjaro-e-agora','/me-sentir-leve/corpo-forte','/espelho-meu'];
 return [...routes.map(p=>({url:base+p,changeFrequency:'weekly' as const,priority:p===''?1:0.8})),...espelho.map(b=>({url:base+'/espelho-meu/'+b.slug,changeFrequency:'monthly' as const,priority:0.7})),...products.map(p=>({url:base+'/livros/'+p.slug,changeFrequency:'weekly' as const,priority:0.9}))];
}
