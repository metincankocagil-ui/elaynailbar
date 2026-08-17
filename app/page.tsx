import Link from 'next/link';
import { images, services, serviceImage } from './data';

export default function Home() {
  const board = [
    ['/inspiration-gold-lines.png', 'Altın Çizgiler', 'Minimal'],
    ['/inspiration-espresso.png', 'Espresso', 'Zamansız'],
    ['/inspiration-french.png', 'Modern French', 'İmza'],
    ['/inspiration-swirl.png', 'Soft Architecture', 'Elay'],
  ];

  return <>
    <section className="hero" style={{ backgroundImage: `url(${images.hero})` }}>
      <div><p>Güzellik, en ince detaylarda.</p><h1>Size özel tasarlanmış<br/>premium tırnak bakımı.</h1><Link className="button" href="/randevu">RANDEVU AL</Link></div>
    </section>
    <section className="statement"><p>Bir tırnak randevusundan fazlası.<br/>Kendiniz için bir an.</p></section>
    <section className="section">
      <div className="section-head"><h2>Hizmetlerimiz</h2><Link href="/hizmetler">TÜMÜNÜ GÖR</Link></div>
      <div className="service-strip">{services.map((service, index) => <Link className="service-card" href="/hizmetler" key={service[0]}><div className="service-visual"><img src={serviceImage(service[0],index)} alt={`${service[0]} uygulaması`}/><span className="service-glow"></span></div><div className="service-copy"><small>{service[1]} · {service[2]}</small><h3>{service[0]}</h3><span className="service-more">Detaylı Bilgi <b>→</b></span></div></Link>)}</div>
    </section>
    <section className="section inspiration">
      <span className="gold-orbit" aria-hidden="true"></span>
      <header><span>SEÇİLİ ÇALIŞMALAR</span><h2>İlham Panosu</h2><p>Zarafetin detaylarla buluştuğu seçkimiz · @elaynailbar</p></header>
      <div className="masonry">{board.map((item, index) => <Link className="inspiration-card" href="/galeri" key={item[0]}><img src={item[0]} alt={`Elay Nail Bar ${item[1]} tasarımı`}/><span className="card-shade"></span><span className="card-number">0{index + 1}</span><span className="card-meta"><small>{item[2]}</small><strong>{item[1]}</strong><b>Projeyi İncele <i>↗</i></b></span></Link>)}</div>
      <div className="showcase-foot"><span>ELAY — SIGNATURE EDIT</span><Link className="gallery-link" href="/galeri">TÜM TASARIMLARI KEŞFET <i>→</i></Link><span>ISTANBUL — 2026</span></div>
    </section>
  </>;
}
