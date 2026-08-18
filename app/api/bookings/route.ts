import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/admin';
import { durationForServices, hasWorkerCapacity } from '@/lib/booking-capacity';
import { sendBookingNotification, sendCustomerBookingReceipt } from '@/lib/booking-notification';

const file = path.join(process.cwd(), 'data', 'bookings.json');
const availabilityFile = path.join(process.cwd(), 'data', 'availability.json');
const read = async () => JSON.parse(await fs.readFile(file, 'utf8'));

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  return NextResponse.json(await read());
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

    const availability = JSON.parse(await fs.readFile(availabilityFile, 'utf8').catch(() => '{"closedDates":[],"blockedSlots":{}}'));
    if (availability.closedDates?.includes(date) || availability.blockedSlots?.[date]?.includes(time)) {
      return NextResponse.json({ error: 'Seçtiğiniz tarih veya saat randevuya kapalıdır.' }, { status: 409 });
    }
    const items = await read();
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
    await fs.writeFile(file, JSON.stringify(items, null, 2));
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
  const items = await read();
  const item = items.find((entry: {id:string}) => entry.id === id);
  if (!item) return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
  item.status = status;
  await fs.writeFile(file, JSON.stringify(items, null, 2));
  return NextResponse.json(item);
}
