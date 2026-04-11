/* PARALLAX.VOID — Contact Section
   Particle network background, magnetic social cards, reveal animations */

import gsap from 'gsap';

export function initContact() {
  initContactParticles();
  initMagneticCards();
  initContactReveal();
  initContactForm();
}

// ── PARTICLE NETWORK BACKGROUND ──
function initContactParticles() {
  const canvas = document.getElementById('contact-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId = null;
  let W, H;

  function resize() {
    const section = document.getElementById('contact');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.5 - 0.25;
      this.speedY = Math.random() * 0.5 - 0.25;
      this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > W) this.x = 0;
      if (this.x < 0) this.x = W;
      if (this.y > H) this.y = 0;
      if (this.y < 0) this.y = H;
    }

    draw() {
      ctx.fillStyle = `rgba(127, 119, 221, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.floor((W * H) / 15000);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((particle, index) => {
      particle.update();
      particle.draw();

      for (let j = index + 1; j < particles.length; j++) {
        const dx = particle.x - particles[j].x;
        const dy = particle.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          ctx.strokeStyle = `rgba(127, 119, 221, ${0.1 * (1 - distance / 150)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    });

    animId = requestAnimationFrame(animate);
  }

  // Only animate when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!animId) animate();
      } else {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
      }
    });
  }, { threshold: 0.05 });

  resize();
  initParticles();
  observer.observe(document.getElementById('contact'));

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
}

// ── MAGNETIC SOCIAL CARDS ──
function initMagneticCards() {
  document.querySelectorAll('.social-card').forEach((card) => {
    const strength = 0.25;
    const radius = 120;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const pull = (1 - dist / radius) * strength;
        gsap.to(card, { x: dx * pull, y: dy * pull, duration: 0.3, ease: 'power2.out' });
      }
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

// ── CONTACT REVEAL ANIMATIONS ──
function initContactReveal() {
  gsap.from('.contact-heading', {
    y: 50, opacity: 0, duration: 1, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  });

  gsap.from('.contact-sub', {
    y: 30, opacity: 0, duration: 0.8, delay: 0.15, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  });

  gsap.from('.contact-accent-line', {
    width: 0, opacity: 0, duration: 0.8, delay: 0.3, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  });

  gsap.from('.contact-form', {
    y: 30, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 75%' },
  });

  gsap.from('.social-card', {
    y: 30, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    scrollTrigger: { trigger: '.social-cards-grid', start: 'top 80%' },
  });

  gsap.from('.contact-pro-tip', {
    y: 20, opacity: 0, duration: 0.6, delay: 0.5, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-pro-tip', start: 'top 90%' },
  });
}

// ── CONTACT FORM ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn?.querySelector('.btn-text');
  
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!submitBtn || !btnText) return;

    btnText.textContent = 'Sending...';
    submitBtn.style.pointerEvents = 'none';

    const formData = new FormData(form);
    
    try {
      const response = await fetch('https://formsubmit.co/ajax/ayushdata69@gmail.com', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        status.textContent = 'Message sent! I will reply soon.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      status.textContent = 'Failed to send message. Please try again or use the email link.';
      status.className = 'form-status error';
    } finally {
      btnText.textContent = 'Send Message';
      submitBtn.style.pointerEvents = 'auto';
      setTimeout(() => {
        status.textContent = '';
        status.className = 'form-status';
      }, 5000);
    }
  });
}
