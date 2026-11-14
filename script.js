/* ════════════════════════════════════════════════
   QISSA – GSAP Parallax Scroll Animations
   Multi-layer ingredient parallax + reveals
   ════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ── Navbar scroll effect ───────────────── */
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  });

  /* ── Hamburger toggle ───────────────────── */
  const hamburger = document.getElementById("hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      document.querySelector(".nav-links").classList.toggle("open");
    });
  }

  /* ══════════════════════════════════════════
     HERO ENTRANCE ANIMATIONS
     ══════════════════════════════════════════ */
  const heroTL = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTL
    .to(".hero-text", { opacity: 1, y: 0, duration: 1 }, 0.3)
    .to(".hero-platter", { opacity: 1, scale: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 0.5);

  /* ══════════════════════════════════════════
     FLOATING INGREDIENT PARALLAX
     Each .float-item has a data-speed attribute
     that controls how fast it moves on scroll
     ══════════════════════════════════════════ */
  document.querySelectorAll(".float-item").forEach(item => {
    const speed = parseFloat(item.dataset.speed) || 1;
    gsap.to(item, {
      y: () => -120 * speed,
      rotate: () => (Math.random() - 0.5) * 15,
      ease: "none",
      scrollTrigger: {
        trigger: item.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: 1.5,
      },
    });
  });

  /* Floating bubbles – subtle drift */
  document.querySelectorAll(".float-bubble").forEach(bubble => {
    const speed = parseFloat(bubble.dataset.speed) || 1;
    gsap.to(bubble, {
      y: () => -80 * speed,
      x: () => 30 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: bubble.closest("section"),
        start: "top bottom",
        end: "bottom top",
        scrub: 2,
      },
    });
  });

  /* Hero platter gentle float on scroll */
  gsap.to(".platter-img", {
    y: -60,
    rotate: 3,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

  /* ══════════════════════════════════════════
     MENU TABS – interactive
     ══════════════════════════════════════════ */
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      // Replay card animations
      gsap.fromTo(".dish-card",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }
      );
    });
  });

  /* ══════════════════════════════════════════
     DISH CARDS – staggered reveal on scroll
     ══════════════════════════════════════════ */
  gsap.utils.toArray(".dish-card").forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 88%",
      },
    });
  });

  /* ══════════════════════════════════════════
     TESTIMONIALS – slide in from sides
     ══════════════════════════════════════════ */
  gsap.to(".test-image", {
    opacity: 1, x: 0, duration: 1,
    scrollTrigger: { trigger: ".testimonials", start: "top 70%" },
  });
  gsap.to(".test-content", {
    opacity: 1, x: 0, duration: 1, delay: 0.2,
    scrollTrigger: { trigger: ".testimonials", start: "top 70%" },
  });

  /* ══════════════════════════════════════════
     NEWSLETTER – fade up
     ══════════════════════════════════════════ */
  gsap.to(".news-content", {
    opacity: 1, y: 0, duration: 0.9,
    scrollTrigger: { trigger: ".newsletter", start: "top 75%" },
  });

  /* ══════════════════════════════════════════
     SMOOTH ANCHOR SCROLLING
     ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

  /* ══════════════════════════════════════════
     CONTINUOUS FLOATING ANIMATION
     Subtle up/down hover for floating items
     ══════════════════════════════════════════ */
  document.querySelectorAll(".float-item").forEach((item, i) => {
    gsap.to(item, {
      y: "+=15",
      duration: 2.5 + i * 0.3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  document.querySelectorAll(".float-bubble").forEach((bubble, i) => {
    gsap.to(bubble, {
      scale: 1.1,
      opacity: 0.6,
      duration: 3 + i * 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });
});
