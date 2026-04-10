/* PARALLAX.VOID — White Screen-Crack Transition
   SVG glass shattering effect. Triggers ONLY when scrolling DOWN from top.
   One-shot animation — plays once, stays visible briefly, then fades. */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function generateJaggedPath(startX, startY, angle, length, segments) {
  let points = [{ x: startX, y: startY }];
  let currentX = startX;
  let currentY = startY;
  const segLen = length / segments;

  for (let i = 0; i < segments; i++) {
    const jitterAngle = angle + (Math.random() - 0.5) * 0.6;
    const jitterLen = segLen * (0.7 + Math.random() * 0.6);
    currentX += Math.cos(jitterAngle) * jitterLen;
    currentY += Math.sin(jitterAngle) * jitterLen;
    points.push({ x: Math.round(currentX), y: Math.round(currentY) });
  }
  return points;
}

function pointsToPolyline(points) {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

function generateBranch(fromPoint, parentAngle, length) {
  const branchAngle = parentAngle + (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 6 + Math.random() * Math.PI / 6);
  return generateJaggedPath(fromPoint.x, fromPoint.y, branchAngle, length, 3 + Math.floor(Math.random() * 3));
}

export function initCrackTransition() {
  const overlay = document.getElementById('crack-overlay');
  if (!overlay) return;

  overlay.innerHTML = '';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 1920 1080');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.width = '100%';
  svg.style.height = '100%';

  // Glow filter
  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'crack-glow-white');
  const feGauss = document.createElementNS(svgNS, 'feGaussianBlur');
  feGauss.setAttribute('stdDeviation', '2');
  feGauss.setAttribute('result', 'blur');
  const feMerge = document.createElementNS(svgNS, 'feMerge');
  const node1 = document.createElementNS(svgNS, 'feMergeNode');
  node1.setAttribute('in', 'blur');
  const node2 = document.createElementNS(svgNS, 'feMergeNode');
  node2.setAttribute('in', 'SourceGraphic');
  feMerge.appendChild(node1);
  feMerge.appendChild(node2);
  filter.appendChild(feGauss);
  filter.appendChild(feMerge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const group = document.createElementNS(svgNS, 'g');
  group.setAttribute('filter', 'url(#crack-glow-white)');

  const originX = 820;
  const originY = 540;
  const numCracks = 10;
  const allPolylines = [];

  for (let i = 0; i < numCracks; i++) {
    const angle = (i / numCracks) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const length = 300 + Math.random() * 500;
    const segments = 5 + Math.floor(Math.random() * 5);
    const points = generateJaggedPath(originX, originY, angle, length, segments);

    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', pointsToPolyline(points));
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#ffffff');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('stroke-linecap', 'round');
    polyline.setAttribute('stroke-linejoin', 'round');
    polyline.classList.add('crack-line');
    group.appendChild(polyline);
    allPolylines.push(polyline);

    // Branches
    const branchCount = 1 + Math.floor(Math.random() * 2);
    for (let b = 0; b < branchCount; b++) {
      const branchIdx = 1 + Math.floor(Math.random() * (points.length - 2));
      const branchFrom = points[branchIdx];
      const branchLen = 80 + Math.random() * 180;
      const branchPoints = generateBranch(branchFrom, angle, branchLen);

      const branchPoly = document.createElementNS(svgNS, 'polyline');
      branchPoly.setAttribute('points', pointsToPolyline(branchPoints));
      branchPoly.setAttribute('fill', 'none');
      branchPoly.setAttribute('stroke', '#ffffff');
      branchPoly.setAttribute('stroke-width', '1');
      branchPoly.setAttribute('stroke-linecap', 'round');
      branchPoly.setAttribute('opacity', '0.6');
      branchPoly.classList.add('crack-line');
      group.appendChild(branchPoly);
      allPolylines.push(branchPoly);
    }
  }

  svg.appendChild(group);
  overlay.appendChild(svg);

  // Shard container
  const shardContainer = document.createElement('div');
  shardContainer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
  overlay.appendChild(shardContainer);

  // Set initial stroke-dasharray/offset
  allPolylines.forEach(pl => {
    const len = pl.getTotalLength ? pl.getTotalLength() : 500;
    pl.style.strokeDasharray = len;
    pl.style.strokeDashoffset = len;
  });

  // ONE-SHOT: Trigger only when scrolling DOWN from top
  // Uses ScrollTrigger.create with onEnter (fires only going down) + once: true
  let lastScrollY = 0;
  let crackPlayed = false;

  ScrollTrigger.create({
    trigger: '#hero',
    start: '60% top',  // when 60% of hero has scrolled past the top
    once: true,         // fire ONCE, never again
    onEnter: (self) => {
      // Only play if user is scrolling DOWN (self.direction === 1)
      if (crackPlayed) return;
      crackPlayed = true;

      // Show overlay
      gsap.set(overlay, { opacity: 1 });

      // Animate each crack with stagger
      allPolylines.forEach((pl, i) => {
        gsap.to(pl, {
          strokeDashoffset: 0,
          duration: 0.5,
          ease: 'power2.out',
          delay: i * 0.05,
        });
      });

      // Spawn shards after cracks finish
      const totalDelay = allPolylines.length * 0.05 + 0.3;
      setTimeout(() => {
        spawnShards(shardContainer, originX, originY);
      }, totalDelay * 1000);

      // Fade out after cracks fully drawn + shards done
      gsap.to(overlay, {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut',
        delay: totalDelay + 1.2,
      });
    },
  });
}

function spawnShards(container, originX, originY) {
  const shardCount = 12 + Math.floor(Math.random() * 5);
  for (let i = 0; i < shardCount; i++) {
    const shard = document.createElement('div');
    const size = 2 + Math.random() * 4;
    const startX = (originX / 1920) * 100;
    const startY = (originY / 1080) * 100;
    const offsetX = (Math.random() - 0.5) * 15;
    const offsetY = (Math.random() - 0.5) * 10;

    shard.style.cssText = `
      position: absolute;
      left: calc(${startX}% + ${offsetX}vw);
      top: calc(${startY / 1080 * 100}vh + ${offsetY}vh);
      width: ${size}px;
      height: ${size}px;
      background: #ffffff;
      opacity: 0.9;
      pointer-events: none;
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      filter: drop-shadow(0 0 3px rgba(255,255,255,0.8));
    `;
    container.appendChild(shard);

    gsap.to(shard, {
      y: 200 + Math.random() * 400,
      x: (Math.random() - 0.5) * 100,
      rotation: Math.random() * 360,
      opacity: 0,
      duration: 1 + Math.random() * 0.8,
      ease: 'power2.in',
      delay: Math.random() * 0.3,
      onComplete: () => shard.remove(),
    });
  }
}
