import type { Metadata } from 'next';
import { CinematicEntry } from '@/components/entry/CinematicEntry';
export const metadata:Metadata={title:'LIA.doctor — Bem-vinda à casa da LIA',description:'Entre na casa LIA e descubra EspelhoMeu e Me Sentir Leve.'};
export default function Home(){return <><script dangerouslySetInnerHTML={{__html:"document.documentElement.classList.add('entry-js')"}}/><CinematicEntry autoEnter/></>;}
