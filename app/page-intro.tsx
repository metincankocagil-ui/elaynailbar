'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function PageIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (pathname.startsWith('/admin')) { setVisible(false); return; }
    document.documentElement.classList.add('intro-running');
    const finish = window.setTimeout(() => {
      document.documentElement.classList.remove('intro-running');
      document.documentElement.classList.add('intro-finished');
      setVisible(false);
    }, 1750);
    return () => {
      window.clearTimeout(finish);
      document.documentElement.classList.remove('intro-running');
    };
  }, [pathname]);

  if (!visible || pathname.startsWith('/admin')) return null;
  return <div className="page-intro" aria-hidden="true"><span className="intro-line"></span><img src="/elay-logo.png" alt=""/><small>Güzellik, En İnce Detaylarda</small></div>;
}
