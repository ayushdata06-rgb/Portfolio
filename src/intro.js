/* ═══════════════════════════════════════════════════════
   THE VOID — Intro Animation
   Character scramble decode → GSAP kinetic text reveal.
   ═══════════════════════════════════════════════════════ */

import gsap from 'gsap';

const SCRAMBLE_CHARS = '#@$%&!?░▒▓█▀▄■□◆◇●○';

function splitTextIntoChars(element) {
  const fullText = element.textContent;
  element.setAttribute('aria-label', fullText);

  // Collect child nodes before clearing
  const childNodes = Array.from(element.childNodes);
  element.innerHTML = '';
  const chars = [];
  let isFirstNode = true;

  childNodes.forEach((node) => {
    // If it's a text node, split into words/chars
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const words = text.split(' ');
      words.forEach((word, wi) => {
        // Add space before word if not first word (and not first node starting with space)
        if (wi > 0 || (!isFirstNode && text.startsWith(' '))) {
          if (wi > 0) {
            const sp = document.createElement('span');
            sp.className = 'char';
            sp.innerHTML = '&nbsp;';
            sp.setAttribute('aria-hidden', 'true');
            element.appendChild(sp);
            chars.push(sp);
          }
        }
        for (let i = 0; i < word.length; i++) {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = word[i];
          s.setAttribute('aria-hidden', 'true');
          s.dataset.letter = word[i]; // store real letter for scramble
          element.appendChild(s);
          chars.push(s);
        }
      });
      // If text ends with space, add trailing space
      if (text.endsWith(' ') && !text.trim() === '') {
        const sp = document.createElement('span');
        sp.className = 'char';
        sp.innerHTML = '&nbsp;';
        sp.setAttribute('aria-hidden', 'true');
        element.appendChild(sp);
        chars.push(sp);
      }
    }
    // If it's an element (like <span class="glitch-text">), preserve wrapper and split inner text
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = node.cloneNode(false); // clone without children
      wrapper.textContent = '';
      const innerText = node.textContent;
      for (let i = 0; i < innerText.length; i++) {
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = innerText[i];
        s.setAttribute('aria-hidden', 'true');
        s.dataset.letter = innerText[i]; // store real letter for scramble
        wrapper.appendChild(s);
        chars.push(s);
      }
      element.appendChild(wrapper);
    }
    isFirstNode = false;
  });
  return chars;
}

/**
 * Scramble decode effect — each char cycles through random glyphs
 * then locks to the real letter, staggered left-to-right.
 */
function scrambleDecode(chars) {
  return new Promise((resolve) => {
    const CYCLE_INTERVAL = 30;  // ms between random char swaps
    const LOCK_STAGGER = 60;    // ms delay between each char locking
    const CYCLES_BEFORE_LOCK = 8; // how many random chars before locking

    let resolved = 0;

    chars.forEach((charEl, index) => {
      const realLetter = charEl.dataset.letter || charEl.textContent;

      // Skip spaces
      if (realLetter.trim() === '' || charEl.innerHTML === '&nbsp;') {
        resolved++;
        if (resolved >= chars.length) resolve();
        return;
      }

      let cycleCount = 0;
      const startDelay = index * LOCK_STAGGER;

      // Initially show a random char
      charEl.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      charEl.style.opacity = '1';

      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          cycleCount++;
          if (cycleCount >= CYCLES_BEFORE_LOCK) {
            clearInterval(interval);
            charEl.textContent = realLetter;
            charEl.style.color = '';
            resolved++;
            if (resolved >= chars.length) resolve();
          } else {
            charEl.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }, CYCLE_INTERVAL);
      }, startDelay);
    });
  });
}

let introTimeline = null;

export function initIntro() {
  return new Promise((resolve) => {
    const headline = document.getElementById('hero-headline');
    const subtitle = document.getElementById('hero-subtitle');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!headline) { resolve(); return; }

    headline.style.opacity = '1';
    const chars = splitTextIntoChars(headline);

    // Hide all chars initially
    chars.forEach((c) => { c.style.opacity = '0'; });

    introTimeline = gsap.timeline({ onComplete: () => { introTimeline = null; resolve(); } });

    // Phase 0: Fade in eyebrow
    introTimeline.to(eyebrow, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });

    // Phase 1: Scramble decode — chars appear one by one with glitch cycling
    introTimeline.add(() => {
      // Make chars visible with stagger
      chars.forEach((c, i) => {
        gsap.to(c, { opacity: 1, duration: 0.05, delay: i * 0.04 });
      });
      return scrambleDecode(chars);
    }, '+=0.1');

    // Phase 2: After scramble, do the kinetic burst for extra punch
    introTimeline.from(chars, {
      y: () => gsap.utils.random(-20, 20),
      scale: () => gsap.utils.random(0.9, 1.1),
      duration: 0.5,
      stagger: 0.02,
      ease: 'power4.out',
      transformOrigin: '50% 50%',
    }, '+=0.3');

    // Phase 3: Subtitle
    gsap.set(subtitle, { y: 20 });
    introTimeline.to(subtitle, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.2');

    // Phase 4: Scroll indicator
    introTimeline.to(scrollIndicator, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2');
  });
}

export function skipIntro() {
  if (introTimeline) { introTimeline.progress(1); introTimeline = null; }
  [document.getElementById('hero-headline'), document.getElementById('hero-subtitle'),
   document.querySelector('.hero-eyebrow'),
   document.querySelector('.scroll-indicator')].forEach((el) => {
    if (el) gsap.set(el, { opacity: 1, y: 0 });
  });
}
