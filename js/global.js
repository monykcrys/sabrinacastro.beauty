// ================================================================
// GLOBAL.JS — Inicialização comum a todas as páginas do site
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  const D = getDados();

  // --- Aplica cores ---
  aplicarCores(D.cores);

  // --- Navbar ---
  renderNav(D);

  // --- Footer ---
  renderFooter(D);

  // --- Scroll reveal ---
  initReveal();

  // --- Atualiza se admin mudou algo em outra aba ---
  window.addEventListener('sabrina-update', (e) => {
    aplicarCores(e.detail.cores);
  });
  window.addEventListener('storage', () => {
    const D2 = getDados();
    aplicarCores(D2.cores);
  });
});

function renderNav(D) {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  // Brand
  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    brand.querySelector('.nome').textContent = D.identidade.nome;
    brand.querySelector('.prof').textContent = D.identidade.profissao;
  }

  // Links
  const links = nav.querySelector('.nav-links');
  if (links) {
    links.innerHTML = '';
    D.abas.filter(a => a.visivel).forEach(a => {
      const el = document.createElement('a');
      el.href = a.href;
      el.textContent = a.label;
      if (a.destaque) el.classList.add('destaque');
      if (location.pathname.endsWith(a.href) || location.href.includes(a.href)) el.classList.add('active');
      links.appendChild(el);
    });
  }

  // Scroll shadow
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

function renderFooter(D) {
  const f = document.querySelector('.footer-inner');
  if (!f) return;

  // Brand
  const brand = f.querySelector('.footer-brand');
  if (brand) {
    brand.querySelector('.nome').textContent = D.identidade.nome;
    brand.querySelector('.prof').textContent = D.identidade.profissao;
  }

  // Links
  const links = f.querySelector('.footer-links');
  if (links) {
    links.innerHTML = '';
    D.abas.filter(a => a.visivel).forEach(a => {
      const el = document.createElement('a');
      el.href = a.href;
      el.textContent = a.label;
      links.appendChild(el);
    });
    // WhatsApp
    if (D.contato.whatsapp) {
      const wpp = document.createElement('a');
      wpp.href = `https://wa.me/${D.contato.whatsapp}`;
      wpp.target = '_blank';
      wpp.textContent = 'WhatsApp';
      links.appendChild(wpp);
    }
  }

  // Copy
  const copy = f.querySelector('.footer-copy');
  if (copy) copy.textContent = `© ${new Date().getFullYear()} ${D.identidade.nome} · Todos os direitos reservados`;
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: .1 });
  els.forEach(el => obs.observe(el));
}
