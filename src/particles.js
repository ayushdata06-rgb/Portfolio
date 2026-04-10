/* PARALLAX.VOID — Hero Bubble Particle System
   65+ cursor-reactive purple bubbles with spring-return physics,
   repulsion field, gravity-well vortex on click-hold, explosion on release.
   Rendered on a 2D canvas above background, below text. */

export function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas || window.innerWidth < 768) return;

  const ctx = canvas.getContext('2d');
  const COUNT = 65;
  const REPULSION_RADIUS = 120;
  const SPRING_STIFFNESS = 80;
  const SPRING_DAMPING = 12;
  const GRAVITY_WELL_RADIUS = 200;
  const HOVER_BRIGHTEN_ALPHA = 0.7;
  const BASE_ALPHA_FACTOR = 0.15;
  const PULSE_SCALE = 1.3;
  const PULSE_DURATION = 0.3; // seconds

  let W, H, dpr;
  let mouse = { x: -9999, y: -9999, pressed: false, justReleased: false };
  let particles = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Bubble {
    constructor() {
      // Size: 4–28px radius
      this.baseR = 4 + Math.random() * 24;
      this.r = this.baseR;
      // Opacity inversely proportional to size
      this.baseAlpha = BASE_ALPHA_FACTOR + (1 - (this.baseR - 4) / 24) * 0.35;
      this.alpha = this.baseAlpha;
      // Position
      this.homeX = Math.random() * W;
      this.homeY = Math.random() * H;
      this.x = this.homeX;
      this.y = this.homeY;
      // Velocity for spring physics
      this.vx = 0;
      this.vy = 0;
      // Drift velocity (slow ambient motion)
      this.driftVx = (Math.random() - 0.5) * 0.45;
      this.driftVy = (Math.random() - 0.5) * 0.3 - 0.2; // slight upward bias
      // Mass proportional to size (bigger = heavier = slower)
      this.mass = 0.5 + (this.baseR / 28) * 1.5;
      // Pulse state
      this.pulseT = 0;
      this.isHovered = false;
      // For explosion
      this.explodeVx = 0;
      this.explodeVy = 0;
    }

    update(dt) {
      const dtS = dt / 1000;

      // Drift home position slowly so bubbles don't feel static
      this.homeX += this.driftVx * dtS * 28;
      this.homeY += this.driftVy * dtS * 28;

      // Wrap home position
      if (this.homeX < -40) this.homeX = W + 40;
      if (this.homeX > W + 40) this.homeX = -40;
      if (this.homeY < -40) this.homeY = H + 40;
      if (this.homeY > H + 40) this.homeY = -40;

      // Distance to cursor
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check hover
      const wasHovered = this.isHovered;
      this.isHovered = dist < REPULSION_RADIUS;

      if (this.isHovered && !wasHovered) {
        this.pulseT = PULSE_DURATION;
      }

      // Cursor interaction force
      let forceX = 0, forceY = 0;

      if (mouse.pressed && dist < GRAVITY_WELL_RADIUS && dist > 1) {
        // GRAVITY WELL: pull toward cursor
        const strength = (1 - dist / GRAVITY_WELL_RADIUS) * 600 / this.mass;
        forceX = -(dx / dist) * strength;
        forceY = -(dy / dist) * strength;
      } else if (!mouse.pressed && dist < REPULSION_RADIUS && dist > 1) {
        // REPULSION: push away from cursor
        // Smaller bubbles snap away faster (inversely proportional to mass)
        const strength = (1 - dist / REPULSION_RADIUS) * 400 / this.mass;
        forceX = (dx / dist) * strength;
        forceY = (dy / dist) * strength;
      }

      // On release explosion
      if (mouse.justReleased && dist < GRAVITY_WELL_RADIUS && dist > 1) {
        const explosionStrength = (1 - dist / GRAVITY_WELL_RADIUS) * 800 / this.mass;
        this.explodeVx = (dx / dist) * explosionStrength;
        this.explodeVy = (dy / dist) * explosionStrength;
      }

      // Spring return to home position
      const springDx = this.homeX - this.x;
      const springDy = this.homeY - this.y;
      const springFx = springDx * SPRING_STIFFNESS / this.mass;
      const springFy = springDy * SPRING_STIFFNESS / this.mass;

      // Damping
      const dampFx = -this.vx * SPRING_DAMPING;
      const dampFy = -this.vy * SPRING_DAMPING;

      // Integrate
      const ax = springFx + dampFx + forceX + this.explodeVx;
      const ay = springFy + dampFy + forceY + this.explodeVy;

      this.vx += ax * dtS;
      this.vy += ay * dtS;
      this.x += this.vx * dtS;
      this.y += this.vy * dtS;

      // Decay explosion velocity
      this.explodeVx *= 0.92;
      this.explodeVy *= 0.92;
      if (Math.abs(this.explodeVx) < 0.1) this.explodeVx = 0;
      if (Math.abs(this.explodeVy) < 0.1) this.explodeVy = 0;

      // Pulse animation
      if (this.pulseT > 0) {
        this.pulseT -= dtS;
        const progress = 1 - (this.pulseT / PULSE_DURATION);
        const ease = Math.sin(progress * Math.PI); // ease in-out
        this.r = this.baseR * (1 + (PULSE_SCALE - 1) * ease);
      } else {
        this.r = this.baseR;
      }

      // Alpha: brighten on hover
      if (this.isHovered) {
        this.alpha += (HOVER_BRIGHTEN_ALPHA - this.alpha) * 0.15;
      } else {
        this.alpha += (this.baseAlpha - this.alpha) * 0.08;
      }
    }

    draw() {
      // Main bubble
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(127,119,221,${this.alpha})`;
      ctx.fill();

      // Subtle inner glow for larger bubbles
      if (this.baseR > 12) {
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.r
        );
        grad.addColorStop(0, `rgba(175,169,236,${this.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(127,119,221,0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Edge highlight
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(175,169,236,${this.alpha * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push(new Bubble());
    }
  }

  let lastTime = 0;
  function loop(time) {
    requestAnimationFrame(loop);
    const dt = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(dt);
      particles[i].draw();
    }

    // Clear justReleased flag after one frame
    mouse.justReleased = false;
  }

  // Events
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mousedown', () => {
    mouse.pressed = true;
  });

  window.addEventListener('mouseup', () => {
    mouse.pressed = false;
    mouse.justReleased = true;
  });

  window.addEventListener('resize', () => {
    resize();
    // Re-home particles to new viewport dimensions
    particles.forEach(p => {
      if (p.homeX > W) p.homeX = Math.random() * W;
      if (p.homeY > H) p.homeY = Math.random() * H;
    });
  });

  init();
  requestAnimationFrame(loop);
}
