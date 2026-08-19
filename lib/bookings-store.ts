import { supabaseRequest } from './supabase';

export type StoredBooking = {
  id: string; service: string; date: string; time: string; name: string;
  phone: string; email?: string; note: string; designCode?: string;
  designColor?: string; status: string; createdAt: string; reminderSentAt?: string;
};

type BookingRow = {
  id: string; service: string; date: string; time: string; name: string;
  phone: string; email: string | null; note: string; design_code: string | null;
  design_color: string | null; status: string; created_at: string; reminder_sent_at: string | null;
};

const fromRow = (row: BookingRow): StoredBooking => ({
  id: row.id, service: row.service, date: row.date, time: row.time, name: row.name,
  phone: row.phone, email: row.email || undefined, note: row.note,
  designCode: row.design_code || undefined, designColor: row.design_color || undefined,
  status: row.status, createdAt: row.created_at, reminderSentAt: row.reminder_sent_at || undefined,
});

const toRow = (booking: StoredBooking) => ({
  id: booking.id, service: booking.service, date: booking.date, time: booking.time,
  name: booking.name, phone: booking.phone, email: booking.email || null, note: booking.note,
  design_code: booking.designCode || null, design_color: booking.designColor || null,
  status: booking.status, created_at: booking.createdAt,
  reminder_sent_at: booking.reminderSentAt || null,
});

export async function readBookings(): Promise<StoredBooking[]> {
  const rows = await supabaseRequest<BookingRow[]>('bookings?select=*&order=created_at.desc');
  return rows.map(fromRow);
}

export async function createBooking(booking: StoredBooking) {
  const rows = await supabaseRequest<BookingRow[]>('bookings', {
    method: 'POST', body: toRow(booking), prefer: 'return=representation',
  });
  return fromRow(rows[0]);
}

export async function updateBookingStatus(id: string, status: string) {
  const rows = await supabaseRequest<BookingRow[]>(`bookings?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', body: { status }, prefer: 'return=representation',
  });
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function markBookingReminderSent(id: string, reminderSentAt: string) {
  await supabaseRequest(`bookings?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', body: { reminder_sent_at: reminderSentAt }, prefer: 'return=minimal',
  });
}
