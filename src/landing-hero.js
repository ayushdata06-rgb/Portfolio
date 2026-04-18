/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Landing Hero
   New landing page with parallax title, CTA buttons,
   and scroll indicator. Uses GSAP ScrollTrigger for parallax.
   + SplitType char/word animations for hero brand + tagline.
   ═══════════════════════════════════════════════════════ */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

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

  // ── SplitType + GSAP Hero Entry ──
  const brand = document.querySelector('.hero-brand');
  const tagline = document.querySelector('.hero-tagline');
  const scrollIndicator = section.querySelector('.landing-scroll-indicator');

  let brandSplit = null;
  let taglineSplit = null;

  const tl = gsap.timeline();

  // 1. Brand name: chars stagger up + blur
  if (brand) {
    brandSplit = new SplitType(brand, { types: 'chars' });
    tl.from(brandSplit.chars, {
      y: 100,
      opacity: 0,
      filter: 'blur(12px)',
      stagger: 0.035,
      duration: 1.1,
      ease: 'power4.out',
    });
  }

  // 2. Tagline: words fade in one by one
  if (tagline) {
    taglineSplit = new SplitType(tagline, { types: 'words' });
    tl.from(taglineSplit.words, {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.4');
  }

  // 3. Buttons stagger in
  tl.from('.landing-buttons', {
    opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
  }, '-=0.3');

  // 4. Scroll indicator pulses in
  if (scrollIndicator) {
    tl.from(scrollIndicator, {
      opacity: 0,
      y: 10,
      duration: 0.5,
      ease: 'power1.out',
    }, '-=0.2');
  }

  // Refresh ScrollTrigger after fonts load to recalc positions
  setTimeout(() => ScrollTrigger.refresh(), 500);
}
