import type {NailDesign} from './nail-designs';
export function NailArtwork({design,className=''}:{design:NailDesign;className?:string}){return <div className={`nail-artwork photo-artwork ${className}`}><img src={design.photo} alt={`${design.code} ${design.name}`} loading="lazy" decoding="async"/></div>}
