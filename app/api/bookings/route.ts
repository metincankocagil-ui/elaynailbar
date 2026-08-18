import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { readAvailability } from '@/lib/availability-store';
import { durationForServices, hasWorkerCapacity } from '@/lib/booking-capacity';
import { sendBookingNotification, sendCustomerBookingCancellation, sendCustomerBookingCompletion, sendCustomerBookingConfirmation, sendCustomerBookingReceipt } from '@/lib/booking-notification';
import { readBookings, StoredBooking, writeBookings } from '@/lib/bookings-store';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  return NextResponse.json(await readBookings());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const service = String(body.service || '').trim();
    const date = String(body.date || '');
    const time = String(body.time || '');
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const note = String(body.note || '').trim();
    const designCode = String(body.designCode || '').trim();
    const designColor = String(body.designColor || '').trim();
    if (!service || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || name.length < 2 || phone.length < 10) {
      return NextResponse.json({ error: 'Lütfen zorunlu alanları doldurun.' }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Lütfen geçerli bir e-posta adresi girin.' }, { status: 400 });
    }

    const availability = await readAvailability();
    if (availability.closedDates?.includes(date) || availability.blockedSlots?.[date]?.includes(time)) {
      return NextResponse.json({ error: 'Seçtiğiniz tarih veya saat randevuya kapalıdır.' }, { status: 409 });
    }
    const items = await readBookings();
    const activeItems = items.filter((item: {date:string;status:string}) => item.date === date && item.status !== 'cancelled');
    if (activeItems.length >= 8) {
      return NextResponse.json({ error: 'Seçtiğiniz günün randevu kapasitesi dolmuştur. Lütfen başka bir gün seçin.' }, { status: 409 });
    }
    const schedule = activeItems.map((item: {time:string;service:string}) => ({ time: item.time, duration: durationForServices(item.service) }));
    if (!hasWorkerCapacity(schedule, time, durationForServices(service), 2)) {
      return NextResponse.json({ error: 'Bu zaman aralığında iki uzmanımız da dolu. Lütfen başka bir saat seçin.' }, { status: 409 });
    }

    const booking = { id: crypto.randomUUID(), service, date, time, name, phone, email, note: note.slice(0,600), designCode, designColor, status: 'new', createdAt: new Date().toISOString() };
    items.unshift(booking);
    await writeBookings(items);
    try {
      const results = await Promise.allSettled([
        sendBookingNotification(booking),
        sendCustomerBookingReceipt(booking),
      ]);
      results.forEach(result => {
        if (result.status === 'rejected') console.error('Booking email error', result.reason);
      });
    } catch (error) {
      console.error('Booking notification error', error);
    }
    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Randevu kaydedilemedi.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const { id, status } = await request.json();
  if (!['new','confirmed','completed','cancelled'].includes(status)) return NextResponse.json({ error: 'Geçersiz durum.' }, { status: 400 });
  const items = await readBookings();
  const item = items.find((entry: {id:string}) => entry.id === id);
  if (!item) return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
  const previousStatus = item.status;
  const customerStatusEmails = {
    confirmed: sendCustomerBookingConfirmation,
    completed: sendCustomerBookingCompletion,
    cancelled: sendCustomerBookingCancellation,
  } as const;
  const sendCustomerStatusEmail = customerStatusEmails[status as keyof typeof customerStatusEmails];
  if (sendCustomerStatusEmail && previousStatus !== status && item.email) {
    try {
      await sendCustomerStatusEmail(item);
    } catch (error) {
      console.error('Customer booking status email error', error);
      return NextResponse.json({ error: 'Müşteriye e-posta gönderilemediği için randevu durumu değiştirilemedi.' }, { status: 502 });
    }
  }
  item.status = status;
  await writeBookings(items as StoredBooking[]);
  return NextResponse.json(item);
}
