/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Timeline Roadmap Line
   Horizontal connector along the BOTTOM BORDER of cards,
   with glowing dots at each card edge + text labels.
   ═══════════════════════════════════════════════════════ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initTimelineLine() {
  const track = document.getElementById('timeline-track');
  if (!track) return;

  /* ensure track has position context */
  track.style.position = 'relative';

  const cards = track.querySelectorAll('.timeline-card');
  if (cards.length < 2) return;

  /* ── measurements (at bottom border of cards) ── */
  const firstCard = cards[0];
  const lastCard = cards[cards.length - 1];

  /* bottom of card = offsetTop + offsetHeight */
  const bottomY = firstCard.offsetTop + firstCard.offsetHeight;

  /* x positions: left edge of first card to right edge of last card */
  const startX = firstCard.offsetLeft;
  const endX = lastCard.offsetLeft + lastCard.offsetWidth;
  const lineWidth = endX - startX;

  /* ── connector line (sits at the bottom border) ── */
  const line = document.createElement('div');
  line.className = 'timeline-connector';
  line.style.cssText = `
    left: ${startX}px;
    top: ${bottomY}px;
    width: ${lineWidth}px;
  `;
  track.appendChild(line);

  /* ── dots + labels at each card's bottom center ── */
  const labels = ['Begin', 'Explore', 'Ship', 'Expand', 'Beyond'];

  cards.forEach((card, i) => {
    const cardCenterX = card.offsetLeft + card.offsetWidth / 2;

    /* glowing dot */
    const dot = document.createElement('div');
    dot.className = 'timeline-dot';
    dot.style.left = `${cardCenterX}px`;
    dot.style.top = `${bottomY}px`;
    track.appendChild(dot);

    /* text label */
    const label = document.createElement('span');
    label.className = 'timeline-label';
    label.textContent = labels[i] || '';
    label.style.left = `${cardCenterX}px`;
    label.style.top = `${bottomY + 14}px`;
    track.appendChild(label);
  });

  /* ── animate: line draws, then dots + labels pop in ── */
  const dots = track.querySelectorAll('.timeline-dot');
  const labelEls = track.querySelectorAll('.timeline-label');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#timeline-wrapper',
      start: 'top 70%',
      once: true,
    },
  });

  /* line draws left → right */
  tl.to(line, {
    scaleX: 1,
    duration: 1.2,
    ease: 'power2.out',
    onStart: () => {
      line.style.transform = 'translateY(-50%) scaleX(0)';
    },
  });

  /* dots pop in with stagger */
  tl.to(
    dots,
    {
      scale: 1,
      duration: 0.4,
      stagger: 0.12,
      ease: 'back.out(1.7)',
      onStart: function () {
        dots.forEach((d) => {
          d.style.transform = 'translate(-50%, -50%) scale(0)';
        });
      },
    },
    '-=0.6',
  );

  /* labels fade in with stagger */
  tl.to(
    labelEls,
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.1, ease: 'power2.out' },
    '-=0.4',
  );
}
