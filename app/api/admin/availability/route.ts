import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { readAvailability, writeAvailability } from '@/lib/availability-store';

export const dynamic = 'force-dynamic';

export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});return NextResponse.json(await readAvailability())}
export async function PATCH(request:Request){
  if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const {date,time,blocked}=await request.json();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))||typeof blocked!=='boolean')return NextResponse.json({error:'Geçersiz seçim.'},{status:400});
  if(time!==undefined&&!/^\d{2}:\d{2}$/.test(String(time)))return NextResponse.json({error:'Geçersiz saat.'},{status:400});
  const availability=await readAvailability();
  if(time===undefined){availability.closedDates=blocked?[...new Set([...availability.closedDates,date])]:availability.closedDates.filter(item=>item!==date)}
  else {const slots=availability.blockedSlots[date]||[];availability.blockedSlots[date]=blocked?[...new Set([...slots,time])]:slots.filter(item=>item!==time);if(!availability.blockedSlots[date].length)delete availability.blockedSlots[date]}
  await writeAvailability(availability);
  return NextResponse.json(availability);
}
