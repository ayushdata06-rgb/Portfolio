/* PARALLAX.VOID — About Section
   Cursor reveal, GSAP pinned section with horizontal card auto-scroll, stats */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ── CURSOR REVEAL ──
export function initCursorReveal() {
  const zone = document.getElementById('cursor-reveal-zone');
  const glow = document.getElementById('reveal-text-glow');
  if (!zone || !glow) return;

  let ticking = false;
  zone.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = zone.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.clipPath = `circle(80px at ${x}px ${y}px)`;
        ticking = false;
      });
      ticking = true;
    }
  });

  zone.addEventListener('mouseleave', () => {
    gsap.to(glow, { clipPath: 'circle(0px at 50% 50%)', duration: 0.5, ease: 'power2.inOut' });
  });
}

// ── TIMELINE — Pin About section, auto-scroll cards horizontally, then unpin ──
export function initTimeline() {
  const section = document.getElementById('about');
  const wrapper = document.getElementById('timeline-wrapper');
  const track   = document.getElementById('timeline-track');
  const cards   = document.querySelectorAll('.timeline-card');
  if (!section || !wrapper || !track || !cards.length) return;

  // How far the track needs to slide so the last card is fully visible
  function getScrollDistance() {
    return Math.max(0, track.scrollWidth - wrapper.offsetWidth + 40);
  }

  // Pin duration based on actual scroll needed — just enough to show all cards
  // If cards already fit (scrollDistance ≈ 0), use a minimal pin for the fade-in
  function getPinDistance() {
    const scrollDist = getScrollDistance();
    // Minimum 400px for fade-in animation, plus scroll distance, plus 200px breathing room
    return Math.max(400, scrollDist + 600);
  }

  // Pin the entire About section while cards scroll horizontally
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${getPinDistance()}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    }
  });

  // Phase 1 (0 → 0.15): Fade in the heading row + bio text
  tl.from('.about-top-row', {
    y: 40, opacity: 0,
    duration: 0.15,
    ease: 'power3.out',
  }, 0);

  tl.from('.cursor-reveal-zone', {
    y: 30, opacity: 0,
    duration: 0.15,
    ease: 'power3.out',
  }, 0.05);

  // Phase 2 (0.15 → 0.35): Cards fade in from right, staggered
  tl.from(cards, {
    x: 200,
    opacity: 0,
    rotateY: -15,
    duration: 0.2,
    stagger: 0.04,
    ease: 'power3.out',
  }, 0.15);

  // Phase 3 (0.35 → 0.85): Scroll the track to the left smoothly
  // Only if there's actual distance to scroll
  const scrollDist = getScrollDistance();
  if (scrollDist > 10) {
    tl.to(track, {
      x: () => -getScrollDistance(),
      duration: 0.5,
      ease: 'power2.inOut',
    }, 0.35);
  }

  // Phase 4 (0.85 → 1.0): Natural pause before releasing the pin

  // Click to flip cards (only if already in view / animated in)
  cards.forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

// Scroll-entry flip removed to prevent conflict with GSAP ScrollTrigger

  // Refresh on resize so measurements stay correct
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}

// ── STAT COUNTERS ──
export function initStats() {
  const numbers = document.querySelectorAll('.stat-number');
  if (!numbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current;
      }, 25);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  numbers.forEach((n) => observer.observe(n));
}

// ── ABOUT SCROLL REVEAL ──
export function initAboutReveal() {
  // The pinned timeline handles the main reveal now
  // This just provides a subtle entrance if ScrollTrigger pin hasn't kicked in
  gsap.from('.about-top-row', {
    y: 40, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: '#about', start: 'top 85%' },
  });
}
