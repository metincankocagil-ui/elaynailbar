'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const selectors = [
  '.statement > p',
  '.section-head',
  '.service-card',
  '.page-title > *',
  '.treatment',
  '.gallery figure',
  '.split > *',
  '.values > div',
  '.reviews blockquote',
  '.contact > section > *',
  '.contact-grid > div',
  '.map',
  '.booking form > *',
  '.booking-summary',
  '.success > *',
  '.inspiration header > *',
  '.inspiration .masonry',
  '.showcase-foot'
].join(',');

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));

    document.documentElement.classList.add('reveal-ready');
    elements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      const parent = element.parentElement;
      const siblings = parent ? Array.from(parent.children).filter(child => child.matches(selectors)) : [];
      const siblingIndex = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', `${Math.min(siblingIndex * 85, 340)}ms`);
    });

    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('is-revealed'));
      return () => document.documentElement.classList.remove('reveal-ready');
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

    elements.forEach(element => observer.observe(element));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
      elements.forEach(element => {
        element.classList.remove('scroll-reveal', 'is-revealed');
        element.style.removeProperty('--reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
