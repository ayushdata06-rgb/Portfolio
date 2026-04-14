/* PARALLAX.VOID — Skills Orbital System
   3D perspective tilted orbits, Z-axis depth oscillation,
   bubble-expand on click (no flat modal), mouse parallax */

import gsap from 'gsap';

const SKILLS = [
  { name: 'Flutter', pct: 78, color: '#222222', cat: 'Mobile', orbit: 0, r: 58, desc: 'Cross-platform mobile framework for building natively compiled apps.' },
  { name: 'Dart', pct: 72, color: '#444444', cat: 'Mobile', orbit: 0, r: 50, desc: 'Client-optimized language powering Flutter applications.' },
  { name: 'UI/UX', pct: 84, color: '#333333', cat: 'Design', orbit: 1, r: 60, desc: 'User interface and experience design with a focus on mobile-first.' },
  { name: 'Figma', pct: 75, color: '#555555', cat: 'Design', orbit: 1, r: 48, desc: 'Collaborative design tool for prototyping and design systems.' },
  { name: 'Framer', pct: 38, color: '#333333', cat: 'Design', orbit: 1, r: 40, desc: 'Interactive design tool for high-fidelity prototypes with code.' },
  { name: 'Supabase', pct: 55, color: '#111111', cat: 'Backend', orbit: 2, r: 46, desc: 'Open-source Firebase alternative with Postgres, auth, and realtime.' },
  { name: 'React', pct: 40, color: '#666666', cat: 'Frontend', orbit: 2, r: 42, desc: 'UI library for building component-based web interfaces.' },

];

const ORBIT_RADII = [140, 230, 315, 395];
const ORBIT_SPEEDS = [0.006, 0.005, 0.004, 0.0035];
const ORBIT_COLORS = ['#222222', '#333333', '#111111', '#555555'];
const ORBIT_Y_SCALE = 0.35; // Perspective tilt — ellipses
const Z_OSC_AMPLITUDE = 0.08;
const Z_OSC_PERIOD_MIN = 4;
const Z_OSC_PERIOD_MAX = 6;

let canvas, ctx, cw, ch;
let mouse = { x: -999, y: -999, normX: 0, normY: 0 };
let hovered = null;
let angles = [];
let zPhases = [];
let animId = null;
let expandedBubble = null; // DOM overlay for expanded skill
let containerEl = null;

function init() {
  const orbitCounts = [0, 0, 0, 0];
  SKILLS.forEach((s) => orbitCounts[s.orbit]++);
  const orbitIdx = [0, 0, 0, 0];
  SKILLS.forEach((s) => {
    const count = orbitCounts[s.orbit];
    const idx = orbitIdx[s.orbit]++;
    angles.push((idx / count) * Math.PI * 2 + Math.random() * 0.3);
    zPhases.push({
      period: Z_OSC_PERIOD_MIN + Math.random() * (Z_OSC_PERIOD_MAX - Z_OSC_PERIOD_MIN),
      offset: Math.random() * Math.PI * 2,
    });
  });
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio, 2);
  cw = rect.width; ch = rect.height;
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

let time = 0;

function draw() {
  ctx.clearRect(0, 0, cw, ch);
  const cx = cw / 2, cy = ch / 2;
  time += 0.016;

  // Draw orbit rings as ellipses (3D perspective)
  ORBIT_RADII.forEach((r, i) => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * ORBIT_Y_SCALE, 0, 0, Math.PI * 2);
    ctx.strokeStyle = ORBIT_COLORS[i] + '18';
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Draw connector lines between same-orbit skills
  for (let o = 0; o < 4; o++) {
    const orbSkills = SKILLS.map((s, i) => ({ ...s, i })).filter((s) => s.orbit === o);
    if (orbSkills.length < 2) continue;
    ctx.beginPath();
    ctx.strokeStyle = ORBIT_COLORS[o] + '20';
    ctx.lineWidth = 0.5;
    orbSkills.forEach((s, j) => {
      const a = angles[s.i];
      const x = cx + Math.cos(a) * ORBIT_RADII[o];
      const y = cy + Math.sin(a) * ORBIT_RADII[o] * ORBIT_Y_SCALE;
      j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // Sort bubbles by Z for proper depth rendering (back to front)
  const bubbleData = SKILLS.map((skill, i) => {
    const orbit = skill.orbit;
    const radius = ORBIT_RADII[orbit];
    const zp = zPhases[i];
    const zOsc = Math.sin((time / zp.period) * Math.PI * 2 + zp.offset);
    const zScale = 1 + Z_OSC_AMPLITUDE * zOsc;

    // 3D depth: outer orbits appear smaller/more transparent
    const depthFactor = 1 - (orbit / (ORBIT_RADII.length)) * 0.1;
    const depthOpacity = 1 - (orbit / ORBIT_RADII.length) * 0.2;

    const x = cx + Math.cos(angles[i]) * radius;
    const y = cy + Math.sin(angles[i]) * radius * ORBIT_Y_SCALE;

    // Z-sorting: behind if sin(angle) > 0 (bottom half of ellipse = farther)
    const zSort = Math.sin(angles[i]);

    return { skill, i, x, y, zScale, depthFactor, depthOpacity, zOsc, zSort };
  }).sort((a, b) => a.zSort - b.zSort); // Draw far bubbles first

  // Draw bubbles
  hovered = null;
  bubbleData.forEach((bd) => {
    const { skill, i, x, y, zScale, depthFactor, depthOpacity, zOsc } = bd;
    // Larger base render size (was 0.5, now 0.7)
    const br = skill.r * 0.7 * depthFactor * zScale;

    // Check hover — bigger hit area
    const dx = mouse.x - x, dy = mouse.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isHovered = dist < br + 8;
    if (isHovered) hovered = i;

    const scale = isHovered ? 1.15 : 1;
    const sr = br * scale;
    const alpha = depthOpacity * (isHovered ? 1 : 0.9);

    // Glow shadow when at closest Z point (zOsc > 0.5)
    if (zOsc > 0.3) {
      const glowAlpha = (zOsc - 0.3) * 0.25 * depthOpacity;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, sr * 2.5);
      grad.addColorStop(0, skill.color + Math.round(glowAlpha * 255).toString(16).padStart(2, '0'));
      grad.addColorStop(1, skill.color + '00');
      ctx.beginPath();
      ctx.arc(x, y, sr * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Bubble background — more opaque for visibility
    ctx.beginPath();
    ctx.arc(x, y, sr, 0, Math.PI * 2);
    ctx.fillStyle = skill.color + (isHovered ? '40' : '22');
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.strokeStyle = isHovered ? skill.color : skill.color + '60';
    ctx.lineWidth = isHovered ? 2.5 : 1.5;
    ctx.stroke();

    // Arc ring showing percentage
    const pctAngle = (skill.pct / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(x, y, sr + 4, -Math.PI / 2, -Math.PI / 2 + pctAngle);
    ctx.strokeStyle = skill.color + (isHovered ? 'dd' : '80');
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Name label — bigger font
    ctx.fillStyle = isHovered ? '#fff' : skill.color;
    ctx.font = `${isHovered ? '600' : '500'} ${Math.max(11, sr * 0.38)}px "Space Grotesk"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(skill.name, x, y - 5);

    // Percentage — bigger font
    ctx.font = `500 ${Math.max(9, sr * 0.3)}px "JetBrains Mono"`;
    ctx.fillStyle = skill.color + 'bb';
    ctx.fillText(`${skill.pct}%`, x, y + sr * 0.35);

    ctx.globalAlpha = 1;

    // Update angle (pause if hovered)
    if (!isHovered) {
      angles[i] += ORBIT_SPEEDS[skill.orbit];
    }
  });

  canvas.style.cursor = hovered !== null ? 'pointer' : 'default';
}

function loop() {
  draw();
  animId = requestAnimationFrame(loop);
}

// ── BUBBLE EXPAND (replaces flat modal) ──
function showExpandedBubble(skill, canvasX, canvasY) {
  // Remove existing expanded bubble if any
  hideExpandedBubble(true);

  const section = document.getElementById('skills');
  if (!section) return;

  // Create expanded bubble DOM element
  const backdrop = document.createElement('div');
  backdrop.className = 'skill-expand-backdrop';
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 55;
    background: rgba(0,0,0,0); backdrop-filter: blur(0px);
    pointer-events: all; cursor: pointer;
    opacity: 0;
  `;

  const bubble = document.createElement('div');
  bubble.className = 'skill-expand-bubble';

  // Position at canvas coordinates
  const canvasRect = canvas.getBoundingClientRect();
  const startX = canvasRect.left + canvasX;
  const startY = canvasRect.top + canvasY;
  const startSize = skill.r * 0.7;

  // Target center and size
  const targetSize = 360;
  const targetX = window.innerWidth / 2;
  const targetY = window.innerHeight / 2;

  // Place bubble at center with fixed size, use transform to start at original position
  const dx = startX - targetX;
  const dy = startY - targetY;
  const scaleFrom = (startSize * 2) / targetSize;

  bubble.style.cssText = `
    position: fixed;
    left: ${targetX}px;
    top: ${targetY}px;
    width: ${targetSize}px;
    height: ${targetSize}px;
    transform: translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scaleFrom});
    border-radius: 50%;
    background: ${skill.color}15;
    border: 2px solid ${skill.color};
    z-index: 56;
    pointer-events: all;
    overflow: hidden;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    box-shadow: 0 0 60px ${skill.color}40;
  `;

  // Inner content (hidden initially)
  bubble.innerHTML = `
    <div class="expand-content" style="opacity:0; text-align:center; padding: 1.2rem; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
      <svg class="expand-ring" width="80" height="80" viewBox="0 0 80 80" style="flex-shrink:0; margin-bottom:10px;">
        <circle cx="40" cy="40" r="32" fill="none" stroke="${skill.color}20" stroke-width="4"/>
        <circle class="expand-ring-fill" cx="40" cy="40" r="32" fill="none" stroke="${skill.color}" stroke-width="4"
          stroke-linecap="round" stroke-dasharray="${2 * Math.PI * 32}" stroke-dashoffset="${2 * Math.PI * 32}"
          transform="rotate(-90 40 40)"/>
        <text x="40" y="44" text-anchor="middle" fill="#e8e4ff" font-family="Space Grotesk" font-weight="600" font-size="18">${skill.pct}%</text>
      </svg>
      <h3 style="font-family:'Space Grotesk'; font-size:1.25rem; font-weight:600; color:#e8e4ff; margin-bottom:4px; line-height:1.2;" class="expand-name">${skill.name}</h3>
      <span style="font-family:'JetBrains Mono'; font-size:0.6rem; letter-spacing:0.12em; text-transform:uppercase; color:${skill.color}; display:block; margin-bottom:8px;" class="expand-cat">${skill.cat}</span>
      <p style="font-size:0.8rem; color:rgba(255,255,255,0.6); margin:0; line-height:1.5; max-width:90%;" class="expand-desc">${skill.desc}</p>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(bubble);
  expandedBubble = { backdrop, bubble, dx, dy, scaleFrom, skill };

  // Animate expand using ONLY transform + opacity (GPU composited)
  gsap.to(backdrop, { opacity: 1, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', duration: 0.3, ease: 'power2.out' });

  gsap.to(bubble, {
    transform: 'translate(-50%, -50%) translate(0px, 0px) scale(1)',
    duration: 0.4,
    ease: 'power3.out',
    force3D: true,
  });

  // Content fades in slightly delayed
  const content = bubble.querySelector('.expand-content');
  gsap.to(content, { opacity: 1, duration: 0.25, delay: 0.2 });

  // Ring fill
  const ringFill = bubble.querySelector('.expand-ring-fill');
  const circumference = 2 * Math.PI * 32;
  const targetOffset = circumference * (1 - skill.pct / 100);
  gsap.to(ringFill, { strokeDashoffset: targetOffset, duration: 0.6, ease: 'power2.out', delay: 0.25 });

  // Click backdrop to close
  backdrop.addEventListener('click', () => hideExpandedBubble());
  bubble.addEventListener('click', (e) => e.stopPropagation());
}

function hideExpandedBubble(immediate = false) {
  if (!expandedBubble) return;
  const { backdrop, bubble, dx, dy, scaleFrom } = expandedBubble;

  if (immediate) {
    backdrop.remove();
    bubble.remove();
    expandedBubble = null;
    return;
  }

  // Fast close with transform only
  gsap.to(backdrop, { opacity: 0, duration: 0.2 });

  const content = bubble.querySelector('.expand-content');
  if (content) gsap.to(content, { opacity: 0, duration: 0.1 });

  gsap.to(bubble, {
    transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scaleFrom})`,
    opacity: 0,
    duration: 0.3,
    ease: 'power3.in',
    force3D: true,
    onComplete: () => {
      backdrop.remove();
      bubble.remove();
      expandedBubble = null;
    }
  });
}

export function initSkills() {
  canvas = document.getElementById('skills-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Wrap canvas in a container for perspective transform
  containerEl = canvas.parentElement;

  init();
  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    // Normalized for parallax
    mouse.normX = (e.clientX - rect.left) / rect.width * 2 - 1;
    mouse.normY = (e.clientY - rect.top) / rect.height * 2 - 1;
    // Apply perspective tilt to canvas container
    if (containerEl) {
      const tiltX = -mouse.normY * 8;
      const tiltY = mouse.normX * 8;
      containerEl.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -999; mouse.y = -999;
    if (containerEl) {
      containerEl.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      containerEl.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
      setTimeout(() => { if (containerEl) containerEl.style.transition = ''; }, 600);
    }
  });

  canvas.addEventListener('click', () => {
    if (hovered === null) return;
    const skill = SKILLS[hovered];
    // Get bubble position on screen
    const orbit = skill.orbit;
    const radius = ORBIT_RADII[orbit];
    const cx = cw / 2, cy = ch / 2;
    const bx = cx + Math.cos(angles[hovered]) * radius;
    const by = cy + Math.sin(angles[hovered]) * radius * ORBIT_Y_SCALE;
    showExpandedBubble(skill, bx, by);
  });

  // Hide old modal system
  const oldModal = document.getElementById('skills-modal');
  if (oldModal) oldModal.style.display = 'none';

  loop();

  // Scroll reveal
  gsap.from('#skills-canvas', {
    opacity: 0, scale: 0.95, duration: 1, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '#skills', start: 'top 75%' },
  });
}

export function destroySkills() {
  if (animId) cancelAnimationFrame(animId);
}
