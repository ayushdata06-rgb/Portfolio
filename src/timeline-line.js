/* ═══════════════════════════════════════════════════════
   PARALLAX.VOID — Timeline Roadmap Line
   Horizontal connector threading through card borders:
   right border of card → dots (spacer) → left border of next card.
   Extra dots between years for adding info later.
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

  /* ── measurements ── */
  // Line runs through the vertical middle of the cards
  const midY = cards[0].offsetTop + cards[0].offsetHeight / 2;

  /* ── Build connector segments between each pair of cards ── */
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardLeft = card.offsetLeft;
    const cardRight = card.offsetLeft + card.offsetWidth;
    const cardMidY = card.offsetTop + card.offsetHeight / 2;

    // Dot on the RIGHT border of this card
    const rightDot = document.createElement('div');
    rightDot.className = 'timeline-dot timeline-border-dot';
    rightDot.style.left = `${cardRight}px`;
    rightDot.style.top = `${cardMidY}px`;
    track.appendChild(rightDot);

    // Dot on the LEFT border of this card
    const leftDot = document.createElement('div');
    leftDot.className = 'timeline-dot timeline-border-dot';
    leftDot.style.left = `${cardLeft}px`;
    leftDot.style.top = `${cardMidY}px`;
    track.appendChild(leftDot);

    // If there's a next card, draw connector line with extra dots between them
    if (i < cards.length - 1) {
      const nextCard = cards[i + 1];
      const nextCardLeft = nextCard.offsetLeft;
      const gapStart = cardRight;
      const gapEnd = nextCardLeft;
      const gapWidth = gapEnd - gapStart;

      // Connector line between cards
      const connLine = document.createElement('div');
      connLine.className = 'timeline-connector';
      connLine.style.cssText = `
        left: ${gapStart}px;
        top: ${cardMidY}px;
        width: ${gapWidth}px;
      `;
      track.appendChild(connLine);

      // Extra dots in the gap (3 dots spaced evenly for adding info)
      const dotCount = 3;
      for (let d = 1; d <= dotCount; d++) {
        const dotX = gapStart + (gapWidth / (dotCount + 1)) * d;
        const extraDot = document.createElement('div');
        extraDot.className = 'timeline-dot timeline-extra-dot';
        extraDot.dataset.insertPoint = `between-${cards[i].dataset.year}-${nextCard.dataset.year}-${d}`;
        extraDot.style.left = `${dotX}px`;
        extraDot.style.top = `${cardMidY}px`;
        track.appendChild(extraDot);

        // Add alternating labels for 2025 -> 2026 gap
        if (cards[i].dataset.year === '2025') {
          const descText = [
            'Learned the core fundamentals of Python programming, focusing on syntax and data structures.',
            'Studied the basics of version control, repository management, and standard Git workflows.',
            'Explored modern AI platforms to understand their capabilities, limitations, and use cases in technology.'
          ];

          if (descText[d - 1]) {
            extraDot.classList.add('timeline-milestone-dot');

            const dotDesc = document.createElement('div');
            dotDesc.className = 'timeline-dot-desc';
            dotDesc.innerText = descText[d - 1];
            
            const stalk = document.createElement('div');
            stalk.className = 'timeline-stalk';
            
            dotDesc.style.left = `${dotX}px`;
            stalk.style.left = `${dotX}px`;
            stalk.style.transform = `translateX(-50%)`;

            // Alternate above (d=1,3) and below (d=2)
            if (d % 2 !== 0) {
              dotDesc.style.top = `${cardMidY - 34}px`;
              dotDesc.style.transform = 'translate(-50%, -100%)';
              stalk.style.top = `${cardMidY - 30}px`;
            } else {
              dotDesc.style.top = `${cardMidY + 34}px`;
              dotDesc.style.transform = 'translate(-50%, 0)';
              stalk.style.top = `${cardMidY + 6}px`;
            }
            track.appendChild(stalk);
            track.appendChild(dotDesc);
          }
        }
      }
    }
  }

  /* ── Also draw a line THROUGH each card (left to right border) ── */
  cards.forEach((card) => {
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const cardMidY = card.offsetTop + card.offsetHeight / 2;

    const throughLine = document.createElement('div');
    throughLine.className = 'timeline-connector timeline-through-card';
    throughLine.style.cssText = `
      left: ${cardLeft}px;
      top: ${cardMidY}px;
      width: ${cardWidth}px;
      z-index: 0;
    `;
    track.appendChild(throughLine);
  });

  /* ── animate ── */
  const allConnectors = track.querySelectorAll('.timeline-connector');
  const allDots = track.querySelectorAll('.timeline-dot');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#timeline-wrapper',
      start: 'top 70%',
      once: true,
    },
  });

  /* Lines draw left → right */
  allConnectors.forEach((line, i) => {
    gsap.set(line, { transform: 'translateY(-50%) scaleX(0)' });
    tl.to(line, {
      scaleX: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, i * 0.15);
  });

  /* Dots pop in with stagger */
  gsap.set(allDots, { transform: 'translate(-50%, -50%) scale(0)' });
  tl.to(allDots, {
    scale: 1,
    duration: 0.4,
    stagger: 0.06,
    ease: 'back.out(1.7)',
  }, 0.3);

  /* Dot descriptions and stalks fade in */
  const allDescs = track.querySelectorAll('.timeline-dot-desc');
  const allStalks = track.querySelectorAll('.timeline-stalk');
  
  tl.to(allStalks, {
    opacity: 1,
    scaleY: 1,
    duration: 0.4,
    stagger: 0.1,
    ease: 'power2.out',
  }, 0.5);

  tl.to(allDescs, {
    opacity: 0.7, // dim slightly
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
  }, 0.6);
}
