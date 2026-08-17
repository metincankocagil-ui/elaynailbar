export const SERVICE_MINUTES:Record<string,number>={
  'Protez Tırnak':90,'Kuru Manikür':60,'Kalıcı Oje':75,'Spa Pedikür':75,'Nail Art':30,
  'Bakım & Güçlendirme':45,'İpek Kirpik':120,'Kaş Laminasyonu':60,'Cilt Bakımı':75
};

export type BookingInterval={time:string;duration:number};

export function durationForServices(value:string){
  const names=value.split(',').map(item=>item.trim());
  return names.reduce((total,name)=>total+(Object.entries(SERVICE_MINUTES).find(([service])=>name===service||name.startsWith(`${service} `)||name.startsWith(`${service} —`))?.[1]||60),0);
}

export function timeToMinutes(value:string){const [hour,minute]=value.split(':').map(Number);return hour*60+minute}

export function hasWorkerCapacity(existing:BookingInterval[],time:string,duration:number,workers=2){
  const start=timeToMinutes(time),end=start+Math.max(duration,30);
  const intervals=existing.map(item=>({start:timeToMinutes(item.time),end:timeToMinutes(item.time)+item.duration}));
  const checkpoints=[start,...intervals.flatMap(item=>[item.start,item.end])].filter(point=>point>=start&&point<end);
  return checkpoints.every(point=>intervals.filter(item=>item.start<=point&&item.end>point).length<workers);
}
