type BookingNotification = {
  id: string; service: string; date: string; time: string;
  name: string; phone: string; email?: string; note?: string; designCode?: string;
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] || character));

export async function sendBookingNotification(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFICATION_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !to || !from) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const rows = [
    ['Müşteri', safe.name], ['Telefon', safe.phone], ...(safe.email ? [['E-posta', safe.email]] : []), ['Tarih / Saat', safe.date + ' · ' + safe.time],
    ['Hizmet', safe.service], ...(safe.designCode ? [['Tasarım', safe.designCode]] : []),
  ].map(([label,value]) => '<tr><td style="padding:11px 0;border-bottom:1px solid #eaded5;color:#8b7565">' + label + '</td><td style="padding:11px 0;border-bottom:1px solid #eaded5;text-align:right;font-weight:bold">' + value + '</td></tr>').join('');
  const note = safe.note ? '<div style="margin-top:22px;padding:18px;background:#f5e7dd"><small style="letter-spacing:1.5px;color:#9a704e">MÜŞTERİ NOTU</small><p style="line-height:1.6">' + safe.note + '</p></div>' : '';
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:30px 32px;background:#2d241e;color:#f8eee5"><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR · YENİ TALEP</small><h1 style="font-family:Georgia,serif;font-weight:400">Yeni randevu talebi</h1></div><div style="padding:28px 32px"><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table>' + note + '<a href="tel:' + safe.phone + '" style="display:block;margin-top:24px;padding:15px;text-align:center;background:#765235;color:white;text-decoration:none">MÜŞTERİYİ ARA</a></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-booking-' + booking.id },
    body: JSON.stringify({ from, to: [to], subject: 'Yeni randevu · ' + booking.date + ' ' + booking.time + ' · ' + booking.name, html }),
  });
  if (!response.ok) throw new Error('Booking notification failed (' + response.status + ')');
  return { sent: true } as const;
}

export async function sendCustomerBookingReceipt(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from || !booking.email) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const rows = [
    ['Hizmet', safe.service], ['Tarih', safe.date], ['Saat', safe.time],
    ...(safe.designCode ? [['Tasarım kodu', safe.designCode]] : []),
  ].map(([label,value]) => '<tr><td style="padding:12px 0;border-bottom:1px solid #eaded5;color:#8b7565">' + label + '</td><td style="padding:12px 0;border-bottom:1px solid #eaded5;text-align:right;font-weight:bold">' + value + '</td></tr>').join('');
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:34px 32px;background:#2d241e;color:#f8eee5;text-align:center"><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR</small><h1 style="margin:14px 0 6px;font-family:Georgia,serif;font-weight:400">Randevu talebinizi aldık.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Merhaba ' + safe.name + ', görüşmek üzere.</p></div><div style="padding:28px 32px"><p style="margin-top:0;line-height:1.7;color:#655348">Talebiniz bize ulaştı. Randevunuzu onaylamak için kısa süre içinde size ulaşacağız.</p><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table><div style="margin-top:24px;padding:18px;background:#f5e7dd;text-align:center"><small style="letter-spacing:1.3px;color:#9a704e">ÖNEMLİ</small><p style="margin:8px 0 0;line-height:1.6;font-size:13px">Bu e-posta talebinizin alındığını gösterir. Randevunuz henüz kesinleşmemiştir.</p></div><p style="margin:25px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-customer-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Randevu talebinizi aldık · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking receipt failed (' + response.status + ')');
  return { sent: true } as const;
}
