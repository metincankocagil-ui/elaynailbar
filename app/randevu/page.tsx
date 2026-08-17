'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { images, services } from '../data';
import { NailArtwork } from '../nail-artwork';
import { nailDesigns } from '../nail-designs';
import { BookingInterval, hasWorkerCapacity } from '@/lib/booking-capacity';

const slots = ['09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'];
const dayNames = ['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export default function Booking() {
  const { days, monthKeys } = useMemo(() => {
    const today = new Date(); today.setHours(12,0,0,0);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0, 12);
    const all: Date[] = [];
    for (const cursor = new Date(today); cursor <= end; cursor.setDate(cursor.getDate() + 1)) all.push(new Date(cursor));
    return { days: all, monthKeys: [...new Set(all.map(d => `${d.getFullYear()}-${d.getMonth()}`))] };
  }, []);
  const [date, setDate] = useState(days[0]);
  const [activeMonth, setActiveMonth] = useState(monthKeys[0]);
  const [time, setTime] = useState('');
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [done, setDone] = useState(false), [sending, setSending] = useState(false), [error, setError] = useState('');
  const [designCode,setDesignCode]=useState('');
  const [dailyCounts,setDailyCounts]=useState<Record<string,number>>({});
  const [closedDates,setClosedDates]=useState<string[]>([]);
  const [blockedSlots,setBlockedSlots]=useState<Record<string,string[]>>({});
  const [schedules,setSchedules]=useState<Record<string,BookingInterval[]>>({});
  const chosenDesign=nailDesigns.find(design=>design.code===designCode.trim().toUpperCase());
  useEffect(()=>{const params=new URLSearchParams(window.location.search);const code=params.get('design');if(code)setDesignCode(code)},[]);
  useEffect(()=>{fetch('/api/bookings/availability',{cache:'no-store'}).then(response=>response.json()).then(result=>{setDailyCounts(result.counts||{});setClosedDates(result.closedDates||[]);setBlockedSlots(result.blockedSlots||{});setSchedules(result.schedules||{})}).catch(()=>{})},[]);
  const selected = services.filter(service => selectedNames.includes(service[0]));
  const visibleDays = days.filter(d => `${d.getFullYear()}-${d.getMonth()}` === activeMonth);
  const totalMinutes = selected.reduce((sum, service) => sum + Number(service[1].replace(/\D/g,'')), 0);
  const totalPrice = selected.reduce((sum, service) => sum + Number(service[2].replace(/\D/g,'')), 0);
  const duration = totalMinutes ? `${Math.floor(totalMinutes/60) ? `${Math.floor(totalMinutes/60)} sa ` : ''}${totalMinutes%60 ? `${totalMinutes%60} dk` : ''}` : '—';
  const dateValue = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const selectedDayFull=(dailyCounts[dateValue]||0)>=8||closedDates.includes(dateValue);

  function toggleService(name: string) { setSelectedNames(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selectedDayFull) { setError('Seçtiğiniz gün randevuya kapalı. Lütfen başka bir gün seçin.'); return; }
    if (blockedSlots[dateValue]?.includes(time)||!hasWorkerCapacity(schedules[dateValue]||[],time,totalMinutes||30,2)) { setError('Seçtiğiniz zaman aralığında müsaitlik yok. Lütfen başka bir saat seçin.'); return; }
    if (!selectedNames.length || !time) { setError('Lütfen en az bir hizmet ve saat seçin.'); return; }
    setSending(true); setError('');
    const body = { ...Object.fromEntries(new FormData(event.currentTarget)), service: selectedNames.join(', '), date: dateValue, time, designCode:chosenDesign?.code||'' };
    try { const response = await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const result=await response.json(); if(!response.ok) throw new Error(result.error); setDone(true); }
    catch(err){ setError(err instanceof Error ? err.message : 'Bir hata oluştu.'); }
    finally { setSending(false); }
  }

  if (done) return <div className="booking-success"><div><b>✓</b><span>RANDEVU TALEBİ ALINDI</span><h1>Görüşmek üzere.</h1><p>{date.getDate()} {months[date.getMonth()]}, saat {time} için talebinizi aldık. Onay için kısa süre içinde sizi arayacağız.</p><button className="button" onClick={()=>setDone(false)}>YENİ RANDEVU OLUŞTUR</button></div></div>;

  return <div className="booking-page">
    <header className="booking-heading"><div><span>ELAY / BOOKING</span><h1>Randevunuzu<br/><em>planlayın.</em></h1></div><ol><li className={selectedNames.length?'done':'active'}>HİZMETLER</li><li className={time?'done':selectedNames.length?'active':''}>TARİH & SAAT</li><li className={time?'active':''}>BİLGİLER</li></ol></header>
    <form onSubmit={submit}><div className="booking-main">
      <section className="booking-stage service-stage"><div className="stage-title"><span>01</span><div><h2>Hizmetlerinizi seçin</h2><p>Birden fazla bakım seçebilirsiniz.</p></div></div><div className="service-options">{services.map(service=><label className={selectedNames.includes(service[0])?'selected':''} key={service[0]}><input type="checkbox" checked={selectedNames.includes(service[0])} onChange={()=>toggleService(service[0])}/><div><h3>{service[0]}</h3><small>{service[1]} · {service[2]}</small></div><b>✓</b></label>)}</div></section>
      <section className="booking-stage calendar-stage"><div className="stage-title"><span>02</span><div><h2>Tarih ve saati seçin</h2><p>Seçtiğiniz işlemlerin süresine ve iki uzmanımızın programına göre müsait saatler gösterilir.</p></div></div><div className="month-tabs">{monthKeys.map(key=>{const [year,month]=key.split('-').map(Number);return <button type="button" className={activeMonth===key?'active':''} onClick={()=>setActiveMonth(key)} key={key}>{months[month]} <small>{year}</small></button>})}</div><div className="calendar-weekdays">{dayNames.map(day=><span key={day}>{day}</span>)}</div><div className="calendar-grid" style={{'--first-day':visibleDays[0]?.getDay()+1} as React.CSSProperties}>{visibleDays.map(day=>{const key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;const full=(dailyCounts[key]||0)>=8||closedDates.includes(key);return <button type="button" disabled={full} className={`${day.toDateString()===date.toDateString()?'selected ':''}${full?'full':''}`} onClick={()=>{setDate(day);setTime('');setError('')}} key={day.toISOString()}><strong>{day.getDate()}</strong><small>{full?'DOLU':day.toDateString()===new Date().toDateString()?'BUGÜN':''}</small></button>})}</div>{selectedDayFull&&<p className="calendar-full-notice">Bu gün randevuya kapalı. Lütfen farklı bir gün seçin.</p>}<div className="slot-group"><h3><span>☼</span> Sabah</h3><div>{slots.filter(slot=>slot<'12:00').map(slot=>{const blocked=blockedSlots[dateValue]?.includes(slot)||!hasWorkerCapacity(schedules[dateValue]||[],slot,totalMinutes||30,2);return <button type="button" disabled={blocked} className={`${time===slot?'selected ':''}${blocked?'blocked':''}`} onClick={()=>setTime(slot)} key={slot}><span>{slot}</span>{blocked&&<small>MÜSAİTLİK YOK</small>}</button>})}</div></div><div className="slot-group"><h3><span>◌</span> Öğleden Sonra</h3><div>{slots.filter(slot=>slot>='12:00').map(slot=>{const blocked=blockedSlots[dateValue]?.includes(slot)||!hasWorkerCapacity(schedules[dateValue]||[],slot,totalMinutes||30,2);return <button type="button" disabled={blocked} className={`${time===slot?'selected ':''}${blocked?'blocked':''}`} onClick={()=>setTime(slot)} key={slot}><span>{slot}</span>{blocked&&<small>MÜSAİTLİK YOK</small>}</button>})}</div></div></section>
      <section className="booking-stage design-code-stage"><div className="stage-title"><span>03</span><div><h2>Elay tasarım kodu</h2><p>İsteğe bağlıdır. Galeride beğendiğiniz tasarımın kodunu girin.</p></div></div><div className="design-code-box"><label>TASARIM KODU<input value={designCode} onChange={e=>setDesignCode(e.target.value.toUpperCase())} placeholder="Örn. ELAY-024" maxLength={8}/>{designCode&&!chosenDesign&&<small>Bu kodla eşleşen bir tasarım bulunamadı.</small>}</label>{chosenDesign&&<div className="booking-design-preview"><NailArtwork design={chosenDesign}/><div><span>{chosenDesign.code}</span><h3>{chosenDesign.name}</h3><p>Seçtiğiniz model randevu talebinize görseliyle birlikte eklenecek.</p></div></div>}</div></section>
      <section className="booking-stage details-stage"><div className="stage-title"><span>04</span><div><h2>İletişim bilgileriniz</h2><p>Randevunuzu onaylamak için size ulaşalım.</p></div></div>{error&&<p className="form-error">{error}</p>}<div className="detail-fields"><label>AD SOYAD<input name="name" required placeholder="Adınız ve soyadınız"/></label><label>TELEFON<input name="phone" required type="tel" placeholder="0531 000 00 00"/></label><label className="full">NOTUNUZ<textarea name="note" rows={3} placeholder="Eklemek istediğiniz bir not…"/></label></div></section>
    </div><aside className="booking-summary"><img src={images.hero} alt="Elay Nail Bar"/><span>SEÇİMLERİNİZ · {selected.length} HİZMET</span><h2>{selected.length ? selected.map(item=>item[0]).join(' · ') : 'Hizmet seçiniz'}</h2>{selected.length>0&&<p>Kişisel bakım ritüeliniz hazır.</p>}<dl><div><dt>TARİH</dt><dd>{date.getDate()} {months[date.getMonth()]} {date.getFullYear()}</dd></div><div><dt>SAAT</dt><dd>{time||'—'}</dd></div><div><dt>TOPLAM SÜRE</dt><dd>{duration}</dd></div><div className="total"><dt>TOPLAM</dt><dd>{totalPrice ? `₺${totalPrice.toLocaleString('tr-TR')}` : '—'}</dd></div></dl><button className="button" disabled={sending||!selected.length||!time||selectedDayFull}>{selectedDayFull?'SEÇİLEN GÜN DOLU':sending?'GÖNDERİLİYOR…':'RANDEVU TALEBİ GÖNDER'} <i>→</i></button><small>Talebiniz sonrası telefonla onaylanacaktır.</small></aside></form>
  </div>;
}
