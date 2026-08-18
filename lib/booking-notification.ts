type BookingNotification = {
  id: string; service: string; date: string; time: string;
  name: string; phone: string; email?: string; note?: string; designCode?: string;
};

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] || character));

const salonMapsUrl = 'https://maps.app.goo.gl/obLueTsnoeQAs3Xk8';
const salonLocationHtml = '<div style="margin-top:24px;padding:20px;border:1px solid #dfcec0;background:#fffaf7"><small style="letter-spacing:1.5px;color:#9a704e">ELAY NAIL BAR · KONUM</small><p style="margin:10px 0 16px;line-height:1.6;font-size:13px;color:#655348">Tevfik Bey Mahallesi<br>Şehit Erol Olçok Cd. 21-23E<br>34295 Küçükçekmece / İstanbul</p><a href="' + salonMapsUrl + '" style="display:block;padding:14px;text-align:center;background:#765235;color:#fff;text-decoration:none;font-size:12px;letter-spacing:1px">YOL TARİFİ AL →</a></div>';

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
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:34px 32px;background:#2d241e;color:#f8eee5;text-align:center"><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR</small><h1 style="margin:14px 0 6px;font-family:Georgia,serif;font-weight:400">Randevu talebinizi aldık.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Merhaba ' + safe.name + ', görüşmek üzere.</p></div><div style="padding:28px 32px"><p style="margin-top:0;line-height:1.7;color:#655348">Talebiniz bize ulaştı. Randevunuzu onaylamak için kısa süre içinde size ulaşacağız.</p><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table>' + salonLocationHtml + '<div style="margin-top:24px;padding:18px;background:#f5e7dd;text-align:center"><small style="letter-spacing:1.3px;color:#9a704e">ÖNEMLİ</small><p style="margin:8px 0 0;line-height:1.6;font-size:13px">Bu e-posta talebinizin alındığını gösterir. Randevunuz henüz kesinleşmemiştir.</p></div><p style="margin:25px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-customer-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Randevu talebinizi aldık · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking receipt failed (' + response.status + ')');
  return { sent: true } as const;
}

export async function sendCustomerBookingConfirmation(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from || !booking.email) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const rows = [
    ['Hizmet', safe.service], ['Tarih', safe.date], ['Saat', safe.time],
    ...(safe.designCode ? [['Tasarım kodu', safe.designCode]] : []),
  ].map(([label,value]) => '<tr><td style="padding:12px 0;border-bottom:1px solid #eaded5;color:#8b7565">' + label + '</td><td style="padding:12px 0;border-bottom:1px solid #eaded5;text-align:right;font-weight:bold">' + value + '</td></tr>').join('');
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:34px 32px;background:#2d241e;color:#f8eee5;text-align:center"><div style="width:52px;height:52px;line-height:52px;margin:0 auto 18px;border:1px solid #ca9f75;border-radius:50%;color:#ca9f75;font-size:24px">✓</div><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR</small><h1 style="margin:14px 0 6px;font-family:Georgia,serif;font-weight:400">Randevunuz onaylandı.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Merhaba ' + safe.name + ', sizi ağırlamak için sabırsızlanıyoruz.</p></div><div style="padding:28px 32px"><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table>' + salonLocationHtml + '<div style="margin-top:24px;padding:18px;background:#f5e7dd;text-align:center"><p style="margin:0;line-height:1.6;font-size:13px">Planınızda bir değişiklik olursa lütfen bizimle iletişime geçin.</p></div><p style="margin:25px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Görüşmek üzere · Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-confirmed-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Randevunuz onaylandı · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking confirmation failed (' + response.status + ')');
  return { sent: true } as const;
}

export async function sendCustomerBookingCancellation(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from || !booking.email) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const rows = [
    ['Hizmet', safe.service], ['Tarih', safe.date], ['Saat', safe.time],
    ...(safe.designCode ? [['Tasarım kodu', safe.designCode]] : []),
  ].map(([label,value]) => '<tr><td style="padding:12px 0;border-bottom:1px solid #eaded5;color:#8b7565">' + label + '</td><td style="padding:12px 0;border-bottom:1px solid #eaded5;text-align:right;font-weight:bold">' + value + '</td></tr>').join('');
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:34px 32px;background:#2d241e;color:#f8eee5;text-align:center"><div style="width:52px;height:52px;line-height:50px;margin:0 auto 18px;border:1px solid #ca9f75;border-radius:50%;color:#ca9f75;font-size:23px">×</div><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR</small><h1 style="margin:14px 0 6px;font-family:Georgia,serif;font-weight:400">Randevunuz iptal edildi.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Merhaba ' + safe.name + ', randevu durumunuz güncellendi.</p></div><div style="padding:28px 32px"><p style="margin-top:0;line-height:1.7;color:#655348">Aşağıdaki randevunuz iptal edilmiştir. Yeni bir tarih planlamak isterseniz sizi yeniden ağırlamaktan mutluluk duyarız.</p><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table><a href="https://elaynailbar.com/randevu" style="display:block;margin-top:24px;padding:15px;text-align:center;background:#765235;color:#fff;text-decoration:none;font-size:12px;letter-spacing:1px">YENİ RANDEVU PLANLA →</a><div style="margin-top:24px;padding:18px;background:#f5e7dd;text-align:center"><p style="margin:0;line-height:1.6;font-size:13px">Bu işlemin bir hata olduğunu düşünüyorsanız lütfen bizimle iletişime geçin.</p></div><p style="margin:25px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-cancelled-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Randevunuz iptal edildi · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking cancellation failed (' + response.status + ')');
  return { sent: true } as const;
}

export async function sendCustomerBookingCompletion(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from || !booking.email) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:40px 32px;background:#2d241e;color:#f8eee5;text-align:center"><div style="width:58px;height:58px;line-height:58px;margin:0 auto 20px;border:1px solid #ca9f75;border-radius:50%;color:#ca9f75;font-family:Georgia,serif;font-size:26px">E</div><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR</small><h1 style="margin:14px 0 8px;font-family:Georgia,serif;font-weight:400">Güzelliğinize eşlik etmek bir ayrıcalıktı.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Teşekkür ederiz, ' + safe.name + '.</p></div><div style="padding:32px"><p style="margin:0;text-align:center;line-height:1.8;color:#655348;font-size:15px">Bugün bizi tercih ettiğiniz için teşekkür ederiz. Elay Nail Bar deneyiminizden memnun kaldığınızı umuyor, sizi yeniden ağırlamayı sabırsızlıkla bekliyoruz.</p><div style="margin:26px 0;padding:22px;border-top:1px solid #dfcec0;border-bottom:1px solid #dfcec0;text-align:center"><small style="letter-spacing:1.4px;color:#9a704e">TAMAMLANAN HİZMET</small><p style="margin:10px 0 0;font-family:Georgia,serif;font-size:20px;color:#35291f">' + safe.service + '</p></div><a href="https://elaynailbar.com/randevu" style="display:block;padding:15px;text-align:center;background:#765235;color:#fff;text-decoration:none;font-size:12px;letter-spacing:1px">YENİ RANDEVU PLANLA →</a>' + salonLocationHtml + '<p style="margin:28px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Yine bekleriz · Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-completed-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Teşekkür ederiz · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking completion failed (' + response.status + ')');
  return { sent: true } as const;
}

export async function sendCustomerBookingReminder(booking: BookingNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !from || !booking.email) return { sent: false, reason: 'not-configured' } as const;

  const safe = Object.fromEntries(Object.entries(booking).map(([key,value]) => [key, escapeHtml(String(value || ''))]));
  const rows = [
    ['Hizmet', safe.service], ['Tarih', safe.date], ['Saat', safe.time],
    ...(safe.designCode ? [['Tasarım kodu', safe.designCode]] : []),
  ].map(([label,value]) => '<tr><td style="padding:12px 0;border-bottom:1px solid #eaded5;color:#8b7565">' + label + '</td><td style="padding:12px 0;border-bottom:1px solid #eaded5;text-align:right;font-weight:bold">' + value + '</td></tr>').join('');
  const html = '<div style="margin:0;background:#f5ede6;padding:32px 16px;font-family:Arial,sans-serif;color:#35291f"><div style="max-width:620px;margin:auto;background:#fffaf7;border:1px solid #dfcec0"><div style="padding:38px 32px;background:#2d241e;color:#f8eee5;text-align:center"><div style="width:58px;height:58px;line-height:58px;margin:0 auto 20px;border:1px solid #ca9f75;border-radius:50%;color:#ca9f75;font-family:Georgia,serif;font-size:26px">E</div><small style="letter-spacing:2px;color:#ca9f75">ELAY NAIL BAR · HATIRLATMA</small><h1 style="margin:14px 0 8px;font-family:Georgia,serif;font-weight:400">Randevunuzu hatırlatmak istedik.</h1><p style="margin:0;color:#d9c9bc;font-size:13px">Merhaba ' + safe.name + ', yarın sizi bekliyoruz.</p></div><div style="padding:30px 32px"><p style="margin-top:0;text-align:center;line-height:1.7;color:#655348">Randevunuza yaklaşık 24 saat kaldı. Planlanan hizmetinizin ayrıntılarını aşağıda bulabilirsiniz.</p><table style="width:100%;border-collapse:collapse;font-size:14px">' + rows + '</table>' + salonLocationHtml + '<div style="margin-top:24px;padding:18px;background:#f5e7dd;text-align:center"><p style="margin:0;line-height:1.6;font-size:13px">Planınızda bir değişiklik varsa lütfen en kısa sürede bizimle iletişime geçin.</p></div><p style="margin:25px 0 0;text-align:center;font-family:Georgia,serif;font-size:20px;color:#765235">Görüşmek üzere · Elay Nail Bar</p></div></div></div>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'elay-reminder-booking-' + booking.id },
    body: JSON.stringify({ from, to: [booking.email], subject: 'Yarınki randevunuzu hatırlatalım · Elay Nail Bar', html }),
  });
  if (!response.ok) throw new Error('Customer booking reminder failed (' + response.status + ')');
  return { sent: true } as const;
}
