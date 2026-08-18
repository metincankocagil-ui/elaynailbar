'use client';

import Link from 'next/link';
import { UIEvent, useEffect, useState } from 'react';
import { services, serviceImage } from './data';

const heroSlides = [
  '/inspiration-gold-lines.png',
  '/inspiration-espresso.png',
  '/inspiration-french.png',
  '/design-gold-line.png',
  '/design-pearl-chrome.png',
  '/design-milky-french.png',
  '/design-mocha-swirl.png',
  '/design-burgundy.png',
];

export default function Home() {
  const [activeServicePage, setActiveServicePage] = useState(0);
  const [activeHero, setActiveHero] = useState(0);
  const board = [
    ['/inspiration-gold-lines.png', 'Altın Çizgiler', 'Minimal'],
    ['/inspiration-espresso.png', 'Espresso', 'Zamansız'],
    ['/inspiration-french.png', 'Modern French', 'İmza'],
    ['/inspiration-swirl.png', 'Soft Architecture', 'Elay'],
  ];
  const servicePages = Array.from({ length: Math.ceil(services.length / 4) }, (_, index) => services.slice(index * 4, index * 4 + 4));
  function trackServicePage(event: UIEvent<HTMLDivElement>) {
    const slider = event.currentTarget;
    setActiveServicePage(Math.min(servicePages.length - 1, Math.max(0, Math.round(slider.scrollLeft / slider.clientWidth))));
  }
  useEffect(() => {
    const timer = window.setInterval(() => setActiveHero(current => (current + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  return <>
    <section className="hero">
      <div className="hero-media" aria-hidden="true">{heroSlides.map((src,index)=><img className={activeHero===index?'active':''} src={src} alt="" key={src}/>)}</div>
      <div><p>Güzellik, en ince detaylarda.</p><h1>Size özel tasarlanmış<br/>premium tırnak bakımı.</h1><Link className="button" href="/randevu">RANDEVU AL</Link></div>
    </section>
    <section className="statement"><p><span>Bir tırnak randevusundan fazlası.</span><span>Kendiniz için bir an.</span></p></section>
    <section className="section">
      <div className="section-head"><h2>Hizmetlerimiz</h2><Link href="/hizmetler">TÜMÜNÜ GÖR</Link></div>
      <div className="service-strip" onScroll={trackServicePage}>{servicePages.map((page, pageIndex) => <div className="service-slide" key={pageIndex}>{page.map((service, index) => { const serviceIndex = pageIndex * 4 + index; return <Link className="service-card" href="/hizmetler" key={service[0]}><div className="service-visual"><img src={serviceImage(service[0],serviceIndex)} alt={`${service[0]} uygulaması`}/><span className="service-glow"></span></div><div className="service-copy"><small>{service[1]} · {service[2]}</small><h3>{service[0]}</h3><span className="service-more">Detaylı Bilgi <b>→</b></span></div></Link>})}</div>)}</div>
      <div className="service-pagination" aria-hidden="true">{servicePages.map((_,index)=><i className={activeServicePage===index?'active':''} key={index}></i>)}</div>
    </section>
    <section className="section inspiration">
      <span className="gold-orbit" aria-hidden="true"></span>
      <header><span>SEÇİLİ ÇALIŞMALAR</span><h2>İlham Panosu</h2><p>Zarafetin detaylarla buluştuğu seçkimiz · @elaynailbar</p></header>
      <div className="masonry">{board.map((item, index) => <Link className="inspiration-card" href="/galeri" key={item[0]}><img src={item[0]} alt={`Elay Nail Bar ${item[1]} tasarımı`}/><span className="card-shade"></span><span className="card-number">0{index + 1}</span><span className="card-meta"><small>{item[2]}</small><strong>{item[1]}</strong><b>Projeyi İncele <i>↗</i></b></span></Link>)}</div>
      <div className="showcase-foot"><span>ELAY — SIGNATURE EDIT</span><Link className="gallery-link" href="/galeri">TÜM TASARIMLARI KEŞFET <i>→</i></Link><span>ISTANBUL — 2026</span></div>
    </section>
  </>;
}
