import { NextResponse } from 'next/server';
import { durationForServices } from '@/lib/booking-capacity';
import { readBookings } from '@/lib/bookings-store';
import { readAvailability } from '@/lib/availability-store';

export async function GET() {
  try {
    const bookings = await readBookings();
    const counts:Record<string,number> = {};
    const slotCounts:Record<string,Record<string,number>> = {};
    const schedules:Record<string,Array<{time:string;duration:number}>> = {};
    for (const booking of bookings) {
      if (booking.status !== 'cancelled') {
        counts[booking.date] = (counts[booking.date] || 0) + 1;
        const time=booking.time;
        if(time){slotCounts[booking.date] ||= {};slotCounts[booking.date][time]=(slotCounts[booking.date][time]||0)+1}
        schedules[booking.date] ||= [];
        schedules[booking.date].push({time,duration:durationForServices(booking.service)});
      }
    }
    const availability=await readAvailability();
    return NextResponse.json({capacity:8,workers:2,counts,slotCounts,schedules,...availability},{headers:{'Cache-Control':'no-store, max-age=0'}});
  } catch {
    return NextResponse.json({capacity:8,workers:2,counts:{},slotCounts:{},schedules:{},closedDates:[],blockedSlots:{}},{headers:{'Cache-Control':'no-store, max-age=0'}});
  }
}
