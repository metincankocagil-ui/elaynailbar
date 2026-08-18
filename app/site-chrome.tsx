'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useLanguage } from './language';

const links = [['/','Ana Sayfa','⌂'],['/hizmetler','Hizmetler','♧'],['/galeri','Galeri','▦'],['/hakkimizda','Hakkımızda','○'],['/yorumlar','Yorumlar','☆'],['/iletisim','İletişim','✉']];
const mobileLinks = [['/','Ana Sayfa','⌂'],['/hizmetler','Hizmetler','◇'],['/randevu','Randevu Al','＋'],['/galeri','Galeri','▦'],['/iletisim','İletişim','⌖']];

export function SiteChrome({children}:{children:React.ReactNode}) {
 const path=usePathname();
 const router=useRouter();
 const {language,setLanguage}=useLanguage();
 const [menuOpen,setMenuOpen]=useState(false);
 const [bookingTransition,setBookingTransition]=useState(false);
 const [bookingTransitionExiting,setBookingTransitionExiting]=useState(false);
 const transitionTimer=useRef<number|null>(null);
 useEffect(()=>setMenuOpen(false),[path]);
 useEffect(()=>{document.body.classList.toggle('menu-open',menuOpen);return()=>document.body.classList.remove('menu-open')},[menuOpen]);
 useEffect(()=>{if(path==='/randevu'&&bookingTransition){setBookingTransitionExiting(true);const timer=window.setTimeout(()=>{setBookingTransition(false);setBookingTransitionExiting(false)},650);return()=>window.clearTimeout(timer)}},[path,bookingTransition]);
 useEffect(()=>()=>{if(transitionTimer.current)window.clearTimeout(transitionTimer.current)},[]);
 function openBooking(event:MouseEvent<HTMLAnchorElement>){
  if(path==='/randevu'||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();setBookingTransitionExiting(false);setBookingTransition(true);
  transitionTimer.current=window.setTimeout(()=>router.push('/randevu'),1250);
 }
 if(path.startsWith('/admin')) return <>{children}</>;
 return <><header className="topbar"><Link className="logo" href="/" aria-label="Elay Nail Bar ana sayfa"><img src="/elay-logo.png" alt="Elay Nail Bar" /></Link><nav>{links.map(([href,label])=><Link className={path===href?'active':''} href={href} key={href}>{label}</Link>)}</nav><div className="desktop-language" aria-label="Dil seçimi"><span>◎</span><button className={language==='tr'?'active':''} onClick={()=>setLanguage('tr')}>TR</button><i></i><button className={language==='en'?'active':''} onClick={()=>setLanguage('en')}>EN</button></div><Link href="/randevu" className="button header-cta">RANDEVU AL</Link><button className="menu-toggle" type="button" aria-label="Menüyü aç" aria-expanded={menuOpen} onClick={()=>setMenuOpen(value=>!value)}><span></span><span></span></button></header>
 <div className={`mobile-menu ${menuOpen?'open':''}`} aria-hidden={!menuOpen}><div className="mobile-menu-head"><small>ELAY NAIL BAR</small><div className="mobile-menu-tools"><div className="mobile-language" aria-label="Dil seçimi"><span>◎</span><button className={language==='tr'?'active':''} onClick={()=>setLanguage('tr')}>TR</button><i></i><button className={language==='en'?'active':''} onClick={()=>setLanguage('en')}>EN</button></div><button className="mobile-menu-close" type="button" onClick={()=>setMenuOpen(false)} aria-label="Menüyü kapat">×</button></div></div><nav>{links.map(([href,label],index)=><Link className={path===href?'active':''} href={href} key={href}><span>0{index+1}</span>{label}<b>→</b></Link>)}</nav><Link className="button" href="/randevu">RANDEVU OLUŞTUR</Link><p>Her gün · 09:30 — 20:30<br/>Küçükçekmece / İstanbul</p></div>
 <main className="route-content" key={path}>{children}</main><nav className="bottom-nav" aria-label="Mobil ana menü">{mobileLinks.map(([href,label,icon])=><Link className={`${path===href?'active ':''}${href==='/randevu'?'booking-tab':''}`} href={href} key={href} onClick={href==='/randevu'?openBooking:undefined}>{href==='/randevu'?<b className="booking-e"><img src="/elay-e-mark.png" alt=""/></b>:<b>{icon}</b>}<span>{label}</span></Link>)}</nav><div className={`booking-transition ${bookingTransition?'is-active':''} ${bookingTransitionExiting?'is-exiting':''}`} aria-hidden="true"><em className="transition-mark"><img src="/elay-e-mark.png" alt=""/></em><span>ELAY NAIL BAR</span><strong>Randevunuz<br/>hazırlanıyor.</strong><i></i></div></>;
}
