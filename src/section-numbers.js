/* PARALLAX.VOID — Section Background Numbers
   Large faded "01" "02" etc behind each section.
   Scramble-count on scroll into view. */

const SCRAMBLE = '0123456789';

function scrambleToNumber(el, target) {
  const str = String(target).padStart(2, '0');
  let frame = 0;
  const totalFrames = 18;
  const interval = setInterval(() => {
    frame++;
    if (frame >= totalFrames) {
      el.textContent = str;
      clearInterval(interval);
      return;
    }
    // Mix random digits -> real digit
    el.textContent = str.split('').map((ch, i) => {
      const lockAt = Math.floor((i + 1) * totalFrames / str.length);
      return frame >= lockAt
        ? ch
        : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
    }).join('');
  }, 40);
}

export function initSectionNumbers() {
  const defs = [
    { sectionId: 'about',    num: 1 },
    { sectionId: 'skills',   num: 2 },
    { sectionId: 'projects', num: 3 },
    { sectionId: 'contact',  num: 4 },
  ];

  defs.forEach(({ sectionId, num }) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Set section to position: relative if not already
    const pos = getComputedStyle(section).position;
    if (pos === 'static') section.style.position = 'relative';

    // Create the bg number element
    const el = document.createElement('span');
    el.className = 'section-bg-num';
    el.textContent = String(num).padStart(2, '0');
    el.setAttribute('aria-hidden', 'true');
    section.appendChild(el);

    // IntersectionObserver to trigger scramble
    let triggered = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          scrambleToNumber(el, num);
          obs.unobserve(section);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(section);
  });
}
