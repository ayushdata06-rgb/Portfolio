/* PARALLAX.VOID — About Section
   Cursor reveal, GSAP pinned section with horizontal card auto-scroll, stats
   + SplitType heading reveals + countUp via GSAP */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';



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


// ── ABOUT SCROLL REVEAL — SplitType heading + paragraph ──
export function initAboutReveal() {
  // Heading clip-path reveal via SplitType lines
  const headingEl = document.querySelector('.about-heading');
  if (headingEl) {
    const heading = new SplitType(headingEl, { types: 'lines' });
    gsap.from(heading.lines, {
      clipPath: 'inset(0 0 100% 0)',
      y: 40,
      stagger: 0.15,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: headingEl,
        start: 'top 80%',
      },
    });
  }



  // Timeline lines: each row wipes in
  gsap.from('.timeline-card', {
    opacity: 0,
    x: -30,
    stagger: 0.18,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.timeline-wrapper',
      start: 'top 78%',
    },
  });
}
