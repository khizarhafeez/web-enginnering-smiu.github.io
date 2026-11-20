/*==================================================================
  ADVANCED UI BEHAVIOUR
  - animated "network" background (canvas) — software/dev themed
  - cursor glow
  - scroll progress bar
  - active nav link highlighting on scroll
  - back-to-top button
  - typewriter effect (moved out of inline <script> in index.html)
==================================================================*/

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*------------------------------------------------------------------
  1) Particle / network canvas background
------------------------------------------------------------------*/
(function initParticleNetwork() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height, particles;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const DENSITY = isMobile ? 16000 : 9000; // higher = fewer particles
  const LINK_DISTANCE = isMobile ? 110 : 150;
  const COLOR_A = "37, 171, 117";   // --color-primary
  const COLOR_B = "30, 144, 255";   // accent blue

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const count = Math.min(120, Math.floor((width * height) / DENSITY));
    particles = Array.from({ length: count }, () => spawnParticle());
  }

  function spawnParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    };
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // update + draw nodes
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR_A}, 0.55)`;
      ctx.fill();
    }

    // draw links between close nodes
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          const opacity = (1 - dist / LINK_DISTANCE) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${COLOR_B}, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", resize);

  if (!prefersReducedMotion) {
    requestAnimationFrame(step);
  } else {
    // draw a single static frame so it still looks intentional
    step();
  }
})();

/*------------------------------------------------------------------
  2) Cursor glow (desktop only)
------------------------------------------------------------------*/
(function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow || prefersReducedMotion) return;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  window.addEventListener("mousemove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    glow.classList.add("is-active");
  });

  window.addEventListener("mouseleave", () => glow.classList.remove("is-active"));
})();

/*------------------------------------------------------------------
  3) Scroll progress bar
------------------------------------------------------------------*/
(function initScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + "%";
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/*------------------------------------------------------------------
  4) Active nav link highlighting via IntersectionObserver
------------------------------------------------------------------*/
(function initActiveNavLink() {
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__link");
  if (!sections.length || !navLinks.length) return;

  const linkMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      linkMap.set(href.slice(1), link);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = linkMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("nav__link--active"));
          link.classList.add("nav__link--active");
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
})();

/*------------------------------------------------------------------
  5) Back to top button
------------------------------------------------------------------*/
(function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("is-visible", window.scrollY > 400);
    },
    { passive: true }
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
})();

/*------------------------------------------------------------------
  6) Typewriter effect (hero subtitle)
------------------------------------------------------------------*/
(function initTypewriter() {
  const typewriterElement = document.getElementById("typewriter");
  if (!typewriterElement) return;

  const typewriterTexts = [
    "Frontend Web Developer",
    "Software Engineer",
    "Full Stack Developer",
    "Creative Problem Solver",
  ];

  let currentTextIndex = 0;
  let charIndex = 0;

  function typeEffect() {
    const currentText = typewriterTexts[currentTextIndex];
    typewriterElement.textContent = currentText.slice(0, charIndex);
    charIndex++;

    if (charIndex > currentText.length) {
      setTimeout(() => {
        charIndex = 0;
        currentTextIndex = (currentTextIndex + 1) % typewriterTexts.length;
      }, 2000);
    }

    setTimeout(typeEffect, 100);
  }

  typeEffect();
})();

/*------------------------------------------------------------------
  7) Subtle tilt effect on project & service cards
------------------------------------------------------------------*/
(function initCardTilt() {
  if (prefersReducedMotion) return;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!isFinePointer) return;

  const cards = document.querySelectorAll(".project__content, .service__card");

  cards.forEach((card) => {
    card.style.transformStyle = "preserve-3d";

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();
