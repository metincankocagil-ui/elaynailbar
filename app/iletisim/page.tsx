const mapsUrl = 'https://maps.app.goo.gl/obLueTsnoeQAs3Xk8';
const embedUrl = 'https://www.google.com/maps?q=41.01107,28.8073456&z=18&output=embed';

export default function Contact() {
  return <div className="page contact">
    <section>
      <i></i><h1>İletişim.</h1>
      <p>Randevu planlamak veya stüdyomuzu ziyaret etmek için bize ulaşın.</p>
      <div className="contact-grid">
        <div><b>STÜDYO</b><p>Tevfik Bey Mahallesi<br/>Şehit Erol Olçok Cd. 21-23E<br/>34295 Küçükçekmece / İstanbul</p></div>
        <div><b>TELEFON</b><p className="phone"><a href="tel:+905316138105">0531 613 81 05</a></p></div>
        <div><b>ÇALIŞMA SAATLERİ</b><p>Her gün<br/><strong>09:30 — 20:30</strong></p></div>
      </div>
      <div className="social-block">
        <b>SOSYAL MEDYA</b>
        <div className="social-links">
          <a href="https://www.instagram.com/elaynailbar_/" target="_blank" rel="noreferrer" aria-label="Elay Nail Bar Instagram hesabı"><span className="social-icon">◎</span><span><strong>Instagram</strong><small>@elaynailbar_</small></span><i>↗</i></a>
          <a href="https://www.tiktok.com/@elaynailbar" target="_blank" rel="noreferrer" aria-label="Elay Nail Bar TikTok hesabı"><span className="social-icon">♪</span><span><strong>TikTok</strong><small>@elaynailbar</small></span><i>↗</i></a>
          <div className="social-disabled" aria-disabled="true"><span className="social-icon">𝕏</span><span><strong>X</strong><small>@elaynailbar</small></span><i>YAKINDA</i></div>
        </div>
      </div>
      <div className="contact-actions">
        <a className="button" href="https://wa.me/905316138105" target="_blank" rel="noreferrer">WHATSAPP RANDEVU</a>
        <a className="direction-link" href={mapsUrl} target="_blank" rel="noreferrer">YOL TARİFİ AL <span>↗</span></a>
      </div>
    </section>
    <div className="map">
      <iframe src={embedUrl} title="Elay Nail Bar Google Maps konumu" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen></iframe>
      <span>ELAY — KÜÇÜKÇEKMECE</span>
    </div>
  </div>;
}
