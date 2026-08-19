import { NextResponse } from 'next/server';
import { runBookingReminders } from '@/lib/booking-reminders';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  }
  return NextResponse.json(await runBookingReminders());
}
