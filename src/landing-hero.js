/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Landing Hero
   New landing page with parallax title, CTA buttons,
   and scroll indicator. Uses GSAP ScrollTrigger for parallax.
   ═══════════════════════════════════════════════════════ */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * @param {object|null} lenis – Lenis instance for smooth scroll-to
 */
export function initLandingHero(lenis) {
  const section = document.getElementById('landing');
  if (!section) return;

  const title = section.querySelector('.landing-title');

  // ── Parallax — title moves at 0.3x scroll speed (subtle) ──
  if (title) {
    gsap.to(title, {
      y: 150,          // translateY 150px over the section scroll
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // ── Smooth-scroll CTA buttons ──
  section.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.scrollTo);
      if (!target) return;
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.5 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Entry reveals (staggered) ──
  gsap.from('.landing-title', {
    opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.2,
  });
  gsap.from('.landing-tagline', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.5,
  });
  gsap.from('.landing-buttons', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.7,
  });
  gsap.from('.landing-scroll-indicator', {
    opacity: 0, duration: 1, ease: 'power2.out', delay: 1.2,
  });
}
