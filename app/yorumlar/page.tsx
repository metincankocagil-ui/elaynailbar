'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Review = { id: string; text: string; name: string; service: string; rating: number; createdAt?: string };

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [sort, setSort] = useState('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sortOptions = [['newest','En yeni'],['highest','En yüksek puan'],['lowest','En düşük puan'],['oldest','En eski']];
  const sortedReviews = [...reviews].sort((a, b) => sort === 'highest' ? b.rating - a.rating : sort === 'lowest' ? a.rating - b.rating : sort === 'oldest' ? (a.createdAt || '').localeCompare(b.createdAt || '') : (b.createdAt || '').localeCompare(a.createdAt || ''));

  useEffect(() => {
    fetch('/api/reviews').then(response => response.json()).then(setReviews).catch(() => setMessage('Yorumlar şu anda yüklenemedi.')).finally(() => setLoading(false));
  }, []);

  useEffect(()=>{
    function closeSort(event: PointerEvent) { if (!sortRef.current?.contains(event.target as Node)) setSortOpen(false); }
    document.addEventListener('pointerdown',closeSort);
    return ()=>document.removeEventListener('pointerdown',closeSort);
  },[]);

  useEffect(() => {
    if (!open && !selectedReview) return;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open, selectedReview]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true); setMessage('');
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Yorum kaydedilemedi.');
      form.reset(); setOpen(false); setMessage('Teşekkürler. Yorumunuz yönetici onayına gönderildi.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Bir hata oluştu.'); }
    finally { setSending(false); }
  }

  return <div className="page section reviews-page">
    <header className="page-title"><i></i><h1>Yorumlar</h1><p>Elay deneyimini misafirlerimizin gözünden keşfedin.</p></header>
    {message && <p className="review-notice" role="status">{message}</p>}
    {!loading && <div className="reviews-toolbar"><span><b>{reviews.length}</b> misafir yorumu</span><div className="review-top-actions"><button className="review-top-add" onClick={()=>setOpen(true)}>YORUM EKLE <b>＋</b></button><div className="review-sort" ref={sortRef}><span>YORUMLARI SIRALA</span><button type="button" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={()=>setSortOpen(value=>!value)}>{sortOptions.find(option=>option[0]===sort)?.[1]} <i>⌄</i></button>{sortOpen&&<div className="review-sort-menu" role="listbox">{sortOptions.map(([value,label])=><button type="button" role="option" aria-selected={sort===value} className={sort===value?'active':''} onClick={()=>{setSort(value);setSortOpen(false)}} key={value}><span>{label}</span><b>{sort===value?'✓':''}</b></button>)}</div>}</div></div></div>}
    {loading ? <div className="review-loading">Yorumlar yükleniyor…</div> : <div className="reviews">{sortedReviews.map(review => <blockquote role="button" tabIndex={0} aria-label={`${review.name} yorumunu aç`} onClick={()=>setSelectedReview(review)} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelectedReview(review)}}} key={review.id}>
      <div className="review-stars" aria-label={`5 üzerinden ${review.rating} yıldız`}>{'★'.repeat(review.rating)}<i>{'★'.repeat(5 - review.rating)}</i></div>
      <p>“{review.text}”</p>
      <footer><cite>{review.name}</cite><small>{review.service}</small></footer>
    </blockquote>)}</div>}
    <div className="add-review"><span>Deneyiminizi paylaşın</span><h2>Sizin yorumunuz da burada yer alsın.</h2><button className="button" onClick={() => setOpen(true)}>YORUM EKLE <b>＋</b></button></div>
    {selectedReview && typeof document !== 'undefined' && createPortal(<div className="review-detail-modal" role="dialog" aria-modal="true" aria-labelledby="review-detail-title" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedReview(null)}}><article><button onClick={()=>setSelectedReview(null)} aria-label="Yorumu kapat">×</button><span>ELAY / GUEST BOOK</span><div className="review-detail-stars" aria-label={`5 üzerinden ${selectedReview.rating} yıldız`}>{'★'.repeat(selectedReview.rating)}<i>{'★'.repeat(5-selectedReview.rating)}</i></div><blockquote id="review-detail-title">“{selectedReview.text}”</blockquote><footer><cite>{selectedReview.name}</cite><small>{selectedReview.service}</small></footer></article></div>, document.body)}
    {open && <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="review-dialog">
        <button className="modal-close" onClick={() => setOpen(false)} aria-label="Pencereyi kapat">×</button>
        <div className="dialog-heading"><span>ELAY / GUEST BOOK</span><h2 id="review-title">Deneyiminizi<br/><em>bizimle paylaşın.</em></h2><p>Birkaç kelimeniz, yeni misafirlerimize ilham olabilir.</p></div>
        <form onSubmit={submit}>
          <div className="form-pair">
            <label className="lux-field"><span><b>01</b> ADINIZ</span><input name="name" required minLength={2} maxLength={40} placeholder="Örn. Ayşe K."/></label>
            <label className="lux-field"><span><b>02</b> ALDIĞINIZ HİZMET</span><select name="service" required defaultValue=""><option value="" disabled>Bir hizmet seçin</option><option>Protez Tırnak</option><option>Kuru Manikür</option><option>Kalıcı Oje</option><option>Spa Pedikür</option><option>Nail Art</option><option>Bakım & Güçlendirme</option><option>İpek Kirpik</option><option>Kaş Laminasyonu</option><option>Diğer</option></select></label>
          </div>
          <fieldset className="rating-field"><legend><b>03</b> DENEYİMİNİZİ PUANLAYIN</legend><div className="star-picker">{[5,4,3,2,1].map(value => <span key={value}><input id={`star-${value}`} type="radio" name="rating" value={value} defaultChecked={value===5}/><label htmlFor={`star-${value}`} aria-label={`${value} yıldız`}>★</label></span>)}</div><small>Bir yıldız seçin</small></fieldset>
          <label className="lux-field comment-field"><span><b>04</b> YORUMUNUZ</span><textarea name="text" required minLength={10} maxLength={600} rows={4} placeholder="Elay deneyiminizi kendi kelimelerinizle anlatın…"></textarea></label>
          <div className="dialog-submit"><p>Yorumunuz gönderildikten sonra<br/>ziyaretçilerimizle paylaşılır.</p><button className="button" disabled={sending}>{sending ? 'YAYINLANIYOR…' : 'YORUMU YAYINLA'} <i>→</i></button></div>
        </form>
      </div>
    </div>}
  </div>;
}
