import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/admin';

const file=path.join(process.cwd(),'data','availability.json');
type Availability={closedDates:string[];blockedSlots:Record<string,string[]>};
async function read():Promise<Availability>{try{return JSON.parse(await fs.readFile(file,'utf8'))}catch{return {closedDates:[],blockedSlots:{}}}}

export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});return NextResponse.json(await read())}
export async function PATCH(request:Request){
  if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});
  const {date,time,blocked}=await request.json();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date))||typeof blocked!=='boolean')return NextResponse.json({error:'Geçersiz seçim.'},{status:400});
  if(time!==undefined&&!/^\d{2}:\d{2}$/.test(String(time)))return NextResponse.json({error:'Geçersiz saat.'},{status:400});
  const availability=await read();
  if(time===undefined){availability.closedDates=blocked?[...new Set([...availability.closedDates,date])]:availability.closedDates.filter(item=>item!==date)}
  else {const slots=availability.blockedSlots[date]||[];availability.blockedSlots[date]=blocked?[...new Set([...slots,time])]:slots.filter(item=>item!==time);if(!availability.blockedSlots[date].length)delete availability.blockedSlots[date]}
  await fs.writeFile(file,JSON.stringify(availability,null,2),'utf8');
  return NextResponse.json(availability);
}
