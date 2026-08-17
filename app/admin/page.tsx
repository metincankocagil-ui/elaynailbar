'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { nailDesigns } from '../nail-designs';

type Review = { id:string; name:string; text:string; service:string; rating:number; status?:string; createdAt?:string };
type Booking = { id:string; name:string; phone:string; service:string; date:string; time:string; note:string; designCode?:string; designColor?:string; status:string; createdAt:string };
type BookingStatus = 'new'|'confirmed'|'completed'|'cancelled';
type Availability = {closedDates:string[];blockedSlots:Record<string,string[]>};
type Confirmation = {title:string;description:string;confirmLabel:string;tone?:'danger'|'default';action:()=>Promise<void>};

const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const weekdays = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const slots = ['09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];
const statusText:Record<string,string> = { new:'Yeni talep', confirmed:'Onaylandı', completed:'Tamamlandı', cancelled:'İptal edildi' };

const dateKey = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const parseDate = (value:string) => { const [year,month,day]=value.split('-').map(Number); return new Date(year,month-1,day,12); };
const prettyDate = (value:string) => parseDate(value).toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric',weekday:'long'});

export default function Admin() {
  const [auth,setAuth]=useState<boolean|null>(null);
  const [reviews,setReviews]=useState<Review[]>([]);
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [tab,setTab]=useState<'bookings'|'reviews'>('bookings');
  const [error,setError]=useState('');
  const today=useMemo(()=>{const value=new Date();value.setHours(12,0,0,0);return value},[]);
  const [month,setMonth]=useState(()=>new Date(today.getFullYear(),today.getMonth(),1,12));
  const [selectedDate,setSelectedDate]=useState(()=>dateKey(today));
  const [filter,setFilter]=useState<'all'|BookingStatus>('all');
  const [reviewFilter,setReviewFilter]=useState<'all'|'pending'|'approved'|'rejected'>('all');
  const [availability,setAvailability]=useState<Availability>({closedDates:[],blockedSlots:{}});
  const [confirmation,setConfirmation]=useState<Confirmation|null>(null);
  const [confirming,setConfirming]=useState(false);

  async function load(){
    const [r,b,a]=await Promise.all([fetch('/api/admin/reviews'),fetch('/api/bookings'),fetch('/api/admin/availability')]);
    if(r.status===401||b.status===401||a.status===401){setAuth(false);return}
    setReviews(await r.json());setBookings(await b.json());setAvailability(await a.json());setAuth(true);
  }
  useEffect(()=>{load()},[]);
  async function login(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');const password=String(new FormData(e.currentTarget).get('password'));const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});if(!r.ok){setError('Parola hatalı.');return}await load()}
  function reviewAction(id:string,status:'approved'|'rejected'|'delete'){const review=reviews.find(item=>item.id===id);const labels={approved:'Yorumu yayınlamak',rejected:'Yorumu reddetmek',delete:'Yorumu kalıcı olarak silmek'};setConfirmation({title:status==='delete'?'Yorumu sil?':'Yorum durumunu değiştir?',description:`${review?.name||'Bu müşteri'} tarafından yazılan yorumu değiştirmek üzeresiniz. ${labels[status]} istediğinize emin misiniz?`,confirmLabel:status==='approved'?'EVET, YAYINLA':status==='rejected'?'EVET, REDDET':'EVET, SİL',tone:status==='delete'||status==='rejected'?'danger':'default',action:async()=>{await fetch('/api/admin/reviews',{method:status==='delete'?'DELETE':'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});await load()}})}
  function bookingStatus(id:string,status:string){const booking=bookings.find(item=>item.id===id);setConfirmation({title:'Randevu durumu değişsin mi?',description:`${booking?.name||'Müşteri'} adına kayıtlı randevu “${statusText[status]}” durumuna alınacak. Bu değişikliği onaylıyor musunuz?`,confirmLabel:'DEĞİŞİKLİĞİ ONAYLA',tone:status==='cancelled'?'danger':'default',action:async()=>{const response=await fetch('/api/bookings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});if(response.ok)setBookings(current=>current.map(item=>item.id===id?{...item,status}:item));else await load()}})}
  function setBlocked(date:string,blocked:boolean,time?:string){setConfirmation({title:blocked?'Randevuya kapatılsın mı?':'Tekrar randevuya açılsın mı?',description:time?`${prettyDate(date)} günü saat ${time}, yeni randevu taleplerine ${blocked?'kapatılacak':'açılacak'}. Onaylıyor musunuz?`:`${prettyDate(date)} tarihinin tamamı yeni randevu taleplerine ${blocked?'kapatılacak':'açılacak'}. Onaylıyor musunuz?`,confirmLabel:blocked?'EVET, KAPAT':'EVET, AÇ',tone:blocked?'danger':'default',action:async()=>{const response=await fetch('/api/admin/availability',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({date,time,blocked})});if(response.ok)setAvailability(await response.json())}})}
  function logout(){setConfirmation({title:'Yönetim panelinden çıkılsın mı?',description:'Oturumunuz güvenli biçimde sonlandırılacak ve giriş ekranına yönlendirileceksiniz.',confirmLabel:'EVET, ÇIKIŞ YAP',tone:'danger',action:async()=>{await fetch('/api/admin/login',{method:'DELETE'});setAuth(false)}})}
  async function confirmAction(){if(!confirmation)return;setConfirming(true);try{await confirmation.action();setConfirmation(null)}finally{setConfirming(false)}}

  const sorted=useMemo(()=>[...bookings].sort((a,b)=>`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),[bookings]);
  const selectedBookings=sorted.filter(item=>item.date===selectedDate);
  const filteredBookings=sorted.filter(item=>filter==='all'||item.status===filter);
  const calendarDays=useMemo(()=>{
    const first=new Date(month.getFullYear(),month.getMonth(),1,12);
    const startOffset=(first.getDay()+6)%7;
    const start=new Date(month.getFullYear(),month.getMonth(),1-startOffset,12);
    return Array.from({length:42},(_,index)=>new Date(start.getFullYear(),start.getMonth(),start.getDate()+index,12));
  },[month]);
  const pending=reviews.filter(r=>r.status==='pending');
  const approvedReviews=reviews.filter(r=>(r.status||'approved')==='approved');
  const rejectedReviews=reviews.filter(r=>r.status==='rejected');
  const filteredReviews=reviews.filter(r=>reviewFilter==='all'||(r.status||'approved')===reviewFilter);
  const averageRating=reviews.length?(reviews.reduce((total,item)=>total+item.rating,0)/reviews.length).toFixed(1):'0.0';
  const upcoming=bookings.filter(item=>item.date>=dateKey(today)&&item.status!=='cancelled'&&item.status!=='completed').length;

  if(auth===null)return <div className="admin-loading">Panel yükleniyor…</div>;
  if(!auth)return <main className="admin-login"><form onSubmit={login}><img src="/elay-logo.png" alt="Elay Nail Bar"/><span>YÖNETİM PANELİ</span><h1>Tekrar hoş geldiniz.</h1><p>Devam etmek için yönetici parolanızı girin.</p>{error&&<b>{error}</b>}<label>PAROLA<input name="password" type="password" required autoFocus placeholder="••••••••••"/></label><button className="button">GİRİŞ YAP →</button></form></main>;

  return <main className="admin-page">
    <header className="admin-header"><div className="admin-brand"><img src="/elay-logo.png" alt=""/><div><span>ELAY NAIL BAR · OPERASYON</span><h1>Yönetim Merkezi</h1></div></div><div className="admin-header-actions"><p><i/> Sistem aktif</p><button onClick={logout}>Güvenli çıkış ↗</button></div></header>
    <nav className="admin-tabs"><button className={tab==='bookings'?'active':''} onClick={()=>setTab('bookings')}>Randevu Yönetimi <b>{bookings.filter(b=>b.status==='new').length}</b></button><button className={tab==='reviews'?'active':''} onClick={()=>setTab('reviews')}>Yorum Onayları <b>{pending.length}</b></button></nav>

    {tab==='bookings'?<>
      <section className="admin-overview">
        <div><span>BUGÜN</span><strong>{bookings.filter(item=>item.date===dateKey(today)&&item.status!=='cancelled').length}</strong><p>planlanmış randevu</p></div>
        <div><span>YENİ TALEPLER</span><strong>{bookings.filter(item=>item.status==='new').length}</strong><p>yanıt bekliyor</p></div>
        <div><span>YAKLAŞAN</span><strong>{upcoming}</strong><p>aktif randevu</p></div>
        <div><span>TOPLAM KAYIT</span><strong>{bookings.length}</strong><p>tüm zamanlar</p></div>
      </section>

      <section className="admin-calendar-layout">
        <div className="calendar-panel">
          <header><div><span>RANDEVU TAKVİMİ</span><h2>{months[month.getMonth()]} <em>{month.getFullYear()}</em></h2></div><div className="calendar-controls"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1,12))} aria-label="Önceki ay">←</button><button className="today" onClick={()=>{setMonth(new Date(today.getFullYear(),today.getMonth(),1,12));setSelectedDate(dateKey(today))}}>Bugün</button><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1,12))} aria-label="Sonraki ay">→</button></div></header>
          <div className="admin-weekdays">{weekdays.map(day=><span key={day}>{day}</span>)}</div>
          <div className="admin-calendar-grid">{calendarDays.map(day=>{const key=dateKey(day);const items=sorted.filter(item=>item.date===key);const isCurrent=day.getMonth()===month.getMonth();const closed=availability.closedDates.includes(key);return <button key={key} className={`${!isCurrent?'outside ':''}${selectedDate===key?'selected ':''}${key===dateKey(today)?'today ':''}${closed?'closed':''}`} onClick={()=>setSelectedDate(key)}><time>{day.getDate()}</time><div>{closed&&<span className="calendar-closed">KAPALI</span>}{items.slice(0,3).map(item=><span className={`calendar-event ${item.status}`} key={item.id}><b>{item.time}</b> {item.name.split(' ')[0]}</span>)}{items.length>3&&<small>+{items.length-3} randevu</small>}</div></button>})}</div>
        </div>

        <aside className="day-panel"><header><span>GÜNÜN PROGRAMI</span><h2>{prettyDate(selectedDate)}</h2><p>{selectedBookings.length} randevu</p></header><div className="availability-control"><div><span>RANDEVU AYARLARI</span><strong>{availability.closedDates.includes(selectedDate)?'Gün randevuya kapalı':'Gün randevuya açık'}</strong></div><button className={availability.closedDates.includes(selectedDate)?'open':''} onClick={()=>setBlocked(selectedDate,!availability.closedDates.includes(selectedDate))}>{availability.closedDates.includes(selectedDate)?'GÜNÜ AÇ':'TÜM GÜNÜ KAPAT'}</button><details className="slot-manager"><summary><div><span>SAATLERİ YÖNET</span><small>{availability.blockedSlots[selectedDate]?.length||0} kapalı saat</small></div><b>⌄</b></summary><div className="slot-blocker">{slots.map(slot=>{const blocked=availability.blockedSlots[selectedDate]?.includes(slot);return <button className={blocked?'blocked':''} disabled={availability.closedDates.includes(selectedDate)} onClick={()=>setBlocked(selectedDate,!blocked,slot)} key={slot}><span>{slot}</span><small>{blocked?'Kapalı':'Açık'}</small></button>})}</div></details></div><div className="day-agenda">{selectedBookings.length===0?<div className="day-empty"><b>◇</b><h3>Program boş</h3><p>Bu tarih için kayıtlı bir randevu bulunmuyor.</p></div>:selectedBookings.map(item=><BookingCard booking={item} compact onStatus={bookingStatus} key={item.id}/>)}</div></aside>
      </section>

      <section className="appointment-list"><div className="admin-title"><div><span>TÜM KAYITLAR</span><h2>Randevu talepleri</h2></div><div className="booking-filters">{(['all','new','confirmed','completed','cancelled'] as const).map(value=><button className={filter===value?'active':''} onClick={()=>setFilter(value)} key={value}>{value==='all'?'Tümü':statusText[value]}</button>)}</div></div>{filteredBookings.length===0?<div className="empty">Bu filtrede randevu bulunmuyor.</div>:<div className="booking-cards">{filteredBookings.map(item=><BookingCard booking={item} onStatus={bookingStatus} key={item.id}/>)}</div>}</section>
    </>:<section className="admin-list review-list"><header className="review-hero"><div><span>MÜŞTERİ DENEYİMİ</span><h2>Yorumları yönetin,<br/><em>itibarınızı güçlendirin.</em></h2><p>Müşterilerden gelen değerlendirmeleri inceleyin ve yayına alın.</p></div><div className="rating-summary"><strong>{averageRating}</strong><span>{'★'.repeat(Math.round(Number(averageRating)))}</span><small>{reviews.length} değerlendirme</small></div></header><div className="review-overview"><div><i className="pending">●</i><span>ONAY BEKLEYEN</span><strong>{pending.length}</strong><small>İncelenmeyi bekliyor</small></div><div><i className="approved">✓</i><span>YAYINDA</span><strong>{approvedReviews.length}</strong><small>Sitede görüntüleniyor</small></div><div><i className="rejected">×</i><span>REDDEDİLEN</span><strong>{rejectedReviews.length}</strong><small>Yayına alınmadı</small></div></div><div className="review-toolbar"><div><span>YORUM ARŞİVİ</span><h3>Tüm değerlendirmeler</h3></div><div className="review-filters">{(['all','pending','approved','rejected'] as const).map(value=><button className={reviewFilter===value?'active':''} onClick={()=>setReviewFilter(value)} key={value}>{value==='all'?'Tümü':value==='pending'?'Bekleyen':value==='approved'?'Yayında':'Reddedilen'} <b>{value==='all'?reviews.length:value==='pending'?pending.length:value==='approved'?approvedReviews.length:rejectedReviews.length}</b></button>)}</div></div>{filteredReviews.length===0?<div className="empty">Bu filtrede yorum bulunmuyor.</div>:<div className="review-grid">{filteredReviews.map(r=><article className={`moderation-row ${r.status||'approved'}`} key={r.id}><header><div className="review-avatar">{r.name.trim().charAt(0).toUpperCase()}</div><div><h3>{r.name}</h3><small>{r.service}</small></div><i className={`review-state ${r.status||'approved'}`}>{r.status==='pending'?'● ONAY BEKLİYOR':r.status==='rejected'?'× REDDEDİLDİ':'✓ YAYINDA'}</i></header><div className="review-rating"><span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span><b>{r.rating}.0</b>{r.createdAt&&<time>{new Date(r.createdAt).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'})}</time>}</div><blockquote>“{r.text}”</blockquote><footer>{r.status==='pending'&&<><button className="review-approve" onClick={()=>reviewAction(r.id,'approved')}><b>✓</b><span>Yayınla</span></button><button className="review-reject" onClick={()=>reviewAction(r.id,'rejected')}><b>×</b><span>Reddet</span></button></>}<button className="delete" onClick={()=>reviewAction(r.id,'delete')}><b>⌫</b><span>Sil</span></button></footer></article>)}</div>}</section>}
    {confirmation&&<div className="confirm-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!confirming)setConfirmation(null)}}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><button className="confirm-close" onClick={()=>setConfirmation(null)} disabled={confirming} aria-label="Kapat">×</button><div className={`confirm-icon ${confirmation.tone||'default'}`}>{confirmation.tone==='danger'?'!':'✓'}</div><span>YÖNETİCİ ONAYI</span><h2 id="confirm-title">{confirmation.title}</h2><p>{confirmation.description}</p><footer><button className="confirm-cancel" onClick={()=>setConfirmation(null)} disabled={confirming}>VAZGEÇ</button><button className={`confirm-submit ${confirmation.tone||'default'}`} onClick={confirmAction} disabled={confirming}>{confirming?'İŞLENİYOR…':confirmation.confirmLabel}</button></footer></section></div>}
  </main>;
}

function BookingCard({booking,compact=false,onStatus}:{booking:Booking;compact?:boolean;onStatus:(id:string,status:string)=>void}){
  const design=nailDesigns.find(item=>item.code===booking.designCode?.toUpperCase());
  if(compact)return <details className="agenda-item">
    <summary><time>{booking.time}</time><div><small>{booking.service}</small><strong>{booking.name}</strong></div><i className={booking.status}>{statusText[booking.status]}</i><b aria-hidden="true">⌄</b></summary>
    <div className="agenda-details"><div className="agenda-contact"><a href={`tel:${booking.phone.replace(/\s/g,'')}`}>{booking.phone}</a>{booking.note&&<p>“{booking.note}”</p>}</div>{booking.designCode&&<div className="agenda-design">{design&&<img src={design.photo} alt={design.name}/>}<div><span>SEÇİLEN TASARIM</span><strong>{booking.designCode}</strong>{design&&<small>{design.name}</small>}</div></div>}<StatusControl booking={booking} onStatus={onStatus}/></div>
  </details>;
  return <article className={`booking-card ${compact?'compact':''}`}>
    <div className="booking-time"><strong>{booking.time}</strong>{!compact&&<span>{prettyDate(booking.date)}</span>}<i className={booking.status}>{statusText[booking.status]}</i></div>
    <div className="booking-person"><small>{booking.service}</small><h3>{booking.name}</h3><a href={`tel:${booking.phone.replace(/\s/g,'')}`}>{booking.phone}</a>{booking.note&&<p>“{booking.note}”</p>}</div>
    {booking.designCode?<div className="booking-design">{design?<img src={design.photo} alt={`${design.code} ${design.name}`}/>:<div className="design-placeholder">◇</div>}<div><span>SEÇİLEN TASARIM</span><strong>{booking.designCode}</strong>{design&&<small>{design.name}</small>}</div></div>:<div className="booking-design no-design"><div><span>TASARIM</span><small>Model seçilmedi</small></div></div>}
    <StatusControl booking={booking} onStatus={onStatus}/>
  </article>
}

function StatusControl({booking,onStatus}:{booking:Booking;onStatus:(id:string,status:string)=>void}){
  const actions:BookingStatus[]=['new','confirmed','completed','cancelled'];
  const icons:Record<BookingStatus,string>={new:'○',confirmed:'✓',completed:'◆',cancelled:'×'};
  return <div className="status-control"><span>RANDEVU DURUMU</span><div>{actions.map(status=><button type="button" className={`${status} ${booking.status===status?'active':''}`} onClick={()=>booking.status!==status&&onStatus(booking.id,status)} aria-pressed={booking.status===status} key={status}><b>{icons[status]}</b>{statusText[status]}</button>)}</div></div>
}
