const channels=[
 {label:'Facebook',href:'https://web.facebook.com/lia.levelab',icon:'facebook',color:'1877F2'},
 {label:'YouTube',href:'https://www.youtube.com/@LIA.Doctor',icon:'youtube',color:'FF0000'},
 {label:'TikTok',href:'https://tiktok.com/@lia.doctor',icon:'tiktok',color:'000000'},
 {label:'Instagram',href:'https://www.instagram.com/lia.levelab',icon:'instagram',color:'E4405F'},
 {label:'Grupo WhatsApp',href:'https://chat.whatsapp.com/FHzvr72KCiYCzlQ7klCTN3',icon:'whatsapp',color:'25D366'},
 {label:'WhatsApp da LIA',href:'https://wa.me/5515981383291',icon:'whatsapp',color:'25D366'}
] as const;
export function SocialLinks({compact=false}:{compact?:boolean}){
 return <nav className={'lia-social-links '+(compact?'lia-social-compact':'')} aria-label="Redes sociais e WhatsApp oficiais">
  {channels.map(c=><a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" title={c.label} aria-label={c.label}>
   <img src={'https://cdn.simpleicons.org/'+c.icon+'/'+c.color} width="23" height="23" loading="lazy" alt="" aria-hidden="true"/>
   <span>{compact?c.label.replace('Grupo WhatsApp','Grupo WA').replace('WhatsApp da LIA','LIA WA'):c.label}</span>
  </a>)}
 </nav>;
}
