/* ============================================================
   GLOBAL.JS – Sabrina Rückert
   Navbar scroll, animações de entrada, utilitários
   ============================================================ */

// --- NAVBAR: efeito ao scrollar ---
(function () {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 24px rgba(107,74,46,0.12)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  });
})();

// --- ANIMAÇÕES DE ENTRADA (Intersection Observer) ---
(function () {
  const elements = document.querySelectorAll(
    '.service-card, .procedure-block, .about-grid, .info-card, .booking-form-col'
  );

  const style = document.createElement('style');
  style.textContent = `
    .anim-hidden {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .anim-visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  elements.forEach((el, i) => {
    el.classList.add('anim-hidden');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
})();

// --- PRÉ-SELECIONAR SERVIÇO VIA URL PARAMS ---
(function () {
  const params = new URLSearchParams(window.location.search);
  const servico = params.get('servico');
  if (!servico) return;

  const select = document.getElementById('servico');
  if (select) {
    select.value = servico;
    select.dispatchEvent(new Event('change'));
  }
})();
