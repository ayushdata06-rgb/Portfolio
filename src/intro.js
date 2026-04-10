/* ═══════════════════════════════════════════════════════
   THE VOID — Intro Animation
   GSAP kinetic text with custom SplitText utility.
   ═══════════════════════════════════════════════════════ */

import gsap from 'gsap';

function splitTextIntoChars(element) {
  const text = element.textContent;
  element.textContent = '';
  element.setAttribute('aria-label', text);
  const chars = [];
  const words = text.split(' ');

  words.forEach((word, wi) => {
    for (let i = 0; i < word.length; i++) {
      const s = document.createElement('span');
      s.className = 'char';
      s.textContent = word[i];
      s.setAttribute('aria-hidden', 'true');
      element.appendChild(s);
      chars.push(s);
    }
    if (wi < words.length - 1) {
      const sp = document.createElement('span');
      sp.className = 'char';
      sp.innerHTML = '&nbsp;';
      sp.setAttribute('aria-hidden', 'true');
      element.appendChild(sp);
      chars.push(sp);
    }
  });
  return chars;
}

let introTimeline = null;

export function initIntro() {
  return new Promise((resolve) => {
    const headline = document.getElementById('hero-headline');
    const subtitle = document.getElementById('hero-subtitle');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const ctaGroup = document.querySelector('.hero-cta-group');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!headline) { resolve(); return; }

    headline.style.opacity = '1';
    const chars = splitTextIntoChars(headline);

    introTimeline = gsap.timeline({ onComplete: () => { introTimeline = null; resolve(); } });

    introTimeline.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });

    introTimeline.from(chars, {
      opacity: 0,
      y: () => gsap.utils.random(-80, 80),
      x: () => gsap.utils.random(-40, 40),
      rotationX: () => gsap.utils.random(-90, 90),
      rotationY: () => gsap.utils.random(-45, 45),
      rotationZ: () => gsap.utils.random(-15, 15),
      scale: () => gsap.utils.random(0.3, 0.8),
      duration: 0.9,
      stagger: 0.04,
      ease: 'power4.out',
      transformOrigin: '50% 50%',
    }, '-=0.3');

    gsap.set(subtitle, { y: 20 });
    introTimeline.to(subtitle, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');

    gsap.set(ctaGroup, { y: 15 });
    introTimeline.to(ctaGroup, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');

    introTimeline.to(scrollIndicator, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2');
  });
}

export function skipIntro() {
  if (introTimeline) { introTimeline.progress(1); introTimeline = null; }
  [document.getElementById('hero-headline'), document.getElementById('hero-subtitle'),
   document.querySelector('.hero-eyebrow'), document.querySelector('.hero-cta-group'),
   document.querySelector('.scroll-indicator')].forEach((el) => {
    if (el) gsap.set(el, { opacity: 1, y: 0 });
  });
}
