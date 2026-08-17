'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [['/','Ana Sayfa','⌂'],['/hizmetler','Hizmetler','♧'],['/galeri','Galeri','▦'],['/hakkimizda','Hakkımızda','○'],['/yorumlar','Yorumlar','☆'],['/iletisim','İletişim','✉']];

export function SiteChrome({children}:{children:React.ReactNode}) {
 const path=usePathname();
 if(path.startsWith('/admin')) return <>{children}</>;
 return <><header className="topbar"><Link className="logo" href="/" aria-label="Elay Nail Bar ana sayfa"><img src="/elay-logo.png" alt="Elay Nail Bar" /></Link><nav>{links.map(([href,label])=><Link className={path===href?'active':''} href={href} key={href}>{label}</Link>)}</nav><Link href="/randevu" className="button header-cta">RANDEVU AL</Link><span className="profile">♙</span></header><main>{children}</main><nav className="bottom-nav">{links.filter((_,i)=>i<3||i===5).map(([href,label,icon])=><Link className={path===href?'active':''} href={href} key={href}><b>{icon}</b><span>{label}</span></Link>)}</nav></>;
}
