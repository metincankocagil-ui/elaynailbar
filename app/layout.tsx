import type { Metadata } from 'next';
import './globals.css';
import './inspiration.css';
import './mobile.css';
import './contact.css';
import './reveal.css';
import './statement.css';
import './intro.css';
import './services-motion.css';
import './reviews.css';
import './reviews-sort.css';
import './booking.css';
import './design-gallery.css';
import './photo-gallery.css';
import './about.css';
import { SiteChrome } from './site-chrome';
import { ScrollReveal } from './scroll-reveal';
import { PageIntro } from './page-intro';

export const metadata: Metadata = { title: 'Elay Nail Bar', description: 'Güzellik, en ince detaylarda.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body><PageIntro/><ScrollReveal/><SiteChrome>{children}</SiteChrome></body></html>;
}
