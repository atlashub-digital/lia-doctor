type BookArtProps = {variant:'mounjaro'|'corpo'|'espelho';title:string;subtitle?:string;label?:string};
export function BookArt({variant,title,subtitle,label}:BookArtProps){
 return <div className={'book-scene scene-'+variant} aria-label={'Representação gráfica do livro '+title} role="img">
  <div className="orbit orbit-one" aria-hidden="true"/><div className="orbit orbit-two" aria-hidden="true"/>
  <div className={'book book-'+variant}><div className="book-top"><span>EDIÇÕES LIA</span><span>●</span></div>
    <div className="book-title">{title}</div><div className="book-subtitle">{subtitle||'Uma leitura para acompanhar o seu momento'}</div>
    <div className="book-mark" aria-hidden="true">✧</div><div className="book-bottom">{label||'COLEÇÃO EDITORIAL'}</div>
   </div>
  </div>;
}
