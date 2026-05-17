// ================================================================
// AGENDAMENTO.JS — Lógica da página de agendamento
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  const D = getDados();
  preencherPagina(D);
  initFormulario(D);
  preSelectServico();
});

function preencherPagina(D) {
  // Info cards sidebar
  renderInfoCards(D);
}

function renderInfoCards(D) {
  // Horários
  const sched = document.getElementById('sched-grid');
  if (sched) {
    sched.innerHTML = '';
    D.horarios.forEach(h => {
      sched.innerHTML += `
        <span class="d ${h.ativo?'':'off'}">${h.dia}</span>
        <span class="h ${h.ativo?'':'off'}">${h.ativo ? h.open+' – '+h.close : 'Fechado'}</span>`;
    });
  }

  // Serviços
  const svcList = document.getElementById('mini-svc-list');
  const svcSelect = document.getElementById('servico-select');
  if (svcList) svcList.innerHTML = '';
  if (svcSelect) {
    svcSelect.innerHTML = '<option value="">Selecione um procedimento</option>';
  }

  D.servicos.filter(s => s.ativo).forEach(s => {
    const preco = s.temPromo ? s.precoPromo : s.preco;
    if (svcList) {
      svcList.innerHTML += `
        <div class="mini-svc">
          <span>${s.emoji} ${s.nome}</span>
          <strong>R$${preco}</strong>
        </div>`;
    }
    if (svcSelect) {
      const opt = document.createElement('option');
      opt.value = s.slug;
      opt.dataset.preco = preco;
      opt.dataset.nome = `${s.emoji} ${s.nome}`;
      opt.textContent = `${s.emoji} ${s.nome} — R$${preco}${s.temPromo ? ' (promo)' : ''}`;
      svcSelect.appendChild(opt);
    }
  });

  const note = document.getElementById('promo-note');
  const temPromo = D.servicos.some(s => s.temPromo && s.ativo);
  if (note) note.style.display = temPromo ? 'block' : 'none';
}

// --- Formulário ---
let descontoPct = 0;

function initFormulario(D) {
  // Data min = hoje
  const dateInput = document.getElementById('data-input');
  if (dateInput) {
    const today = new Date();
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.addEventListener('change', validarDia);
  }

  // Horários disponíveis
  const horaSelect = document.getElementById('hora-select');
  if (horaSelect) {
    horaSelect.innerHTML = '<option value="">Selecione</option>';
    ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'].forEach(h => {
      const o = document.createElement('option');
      o.value = h; o.textContent = h;
      horaSelect.appendChild(o);
    });
  }

  // Update summary on change
  ['servico-select','data-input','hora-select'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateSummary);
  });

  // Cupom
  const applyBtn = document.getElementById('apply-cupom');
  if (applyBtn) applyBtn.addEventListener('click', () => aplicarCupom(D));

  // Confirmar
  const confirmBtn = document.getElementById('confirm-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', () => confirmar(D));

  // Modal close
  const modalClose = document.getElementById('modal-close');
  if (modalClose) modalClose.addEventListener('click', fecharModal);
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) fecharModal(); });
}

function validarDia() {
  const D = getDados();
  const val = document.getElementById('data-input').value;
  if (!val) return;
  const d = new Date(val + 'T00:00:00');
  const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const nomeDia = dias[d.getDay()];
  const horario = D.horarios.find(h => h.dia === nomeDia);
  if (!horario || !horario.ativo) {
    alert(`⚠️ ${nomeDia} não é dia de atendimento. Por favor, escolha outra data.`);
    document.getElementById('data-input').value = '';
  }
}

function updateSummary() {
  const svcEl = document.getElementById('servico-select');
  const sumEl = document.getElementById('price-summary');
  if (!svcEl || !sumEl) return;

  const opt = svcEl.options[svcEl.selectedIndex];
  if (!opt || !opt.dataset.preco) { sumEl.style.display = 'none'; return; }

  const base = parseFloat(opt.dataset.preco);
  const descVal = Math.round(base * descontoPct / 100);
  const total = base - descVal;

  document.getElementById('sum-proc').textContent  = opt.dataset.nome;
  document.getElementById('sum-preco').textContent = `R$ ${base.toFixed(2).replace('.',',')}`;
  document.getElementById('sum-total').textContent = `R$ ${total.toFixed(2).replace('.',',')}`;

  const dline = document.getElementById('sum-desc-line');
  if (descontoPct > 0) {
    document.getElementById('sum-desc').textContent = `- R$ ${descVal.toFixed(2).replace('.',',')} (${descontoPct}%)`;
    dline.style.display = 'flex';
  } else { dline.style.display = 'none'; }

  sumEl.style.display = 'block';
}

function aplicarCupom(D) {
  const code = document.getElementById('cupom-input').value.trim().toUpperCase();
  const msg  = document.getElementById('discount-msg');
  const cupom = D.cupons.find(c => c.codigo.toUpperCase() === code && c.ativo);
  if (cupom) {
    descontoPct = cupom.pct;
    msg.textContent = `✓ Cupom "${cupom.codigo}" aplicado! ${cupom.pct}% de desconto.`;
    msg.className = 'ok';
  } else {
    descontoPct = 0;
    msg.textContent = '✗ Cupom inválido ou expirado.';
    msg.className = 'err';
  }
  updateSummary();
}

function preSelectServico() {
  const params = new URLSearchParams(location.search);
  const s = params.get('servico');
  if (!s) return;
  const el = document.getElementById('servico-select');
  if (el) { el.value = s; el.dispatchEvent(new Event('change')); }
}

function fmtData(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function gerarWppLink(D, dados) {
  const msg = encodeURIComponent(
    `Olá ${D.identidade.nome}! 🌟\n\n` +
    `Gostaria de confirmar meu agendamento:\n\n` +
    `👤 *Nome:* ${dados.nome}\n` +
    `📞 *WhatsApp:* ${dados.tel}\n` +
    `💆 *Serviço:* ${dados.servico}\n` +
    `📅 *Data:* ${fmtData(dados.data)}\n` +
    `🕐 *Horário:* ${dados.hora}\n` +
    `💰 *Total:* ${dados.total}\n` +
    (dados.obs ? `📝 *Obs:* ${dados.obs}\n` : '') +
    `\nAguardo a confirmação! 🙏`
  );
  return `https://wa.me/${D.contato.whatsapp}?text=${msg}`;
}

async function enviarEmail(D, dados) {
  if (!D.contato.emailjsKey) return;
  return new Promise(resolve => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = async () => {
      try {
        emailjs.init(D.contato.emailjsKey);
        await emailjs.send(D.contato.emailjsSvc, D.contato.emailjsTmpl, {
          designer: D.identidade.nome,
          cliente_nome: dados.nome,
          cliente_tel:  dados.tel,
          cliente_email:dados.email || 'N/A',
          servico: dados.servico,
          data:    fmtData(dados.data),
          hora:    dados.hora,
          total:   dados.total,
          obs:     dados.obs || 'Nenhuma',
        });
        resolve(true);
      } catch { resolve(false); }
    };
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

async function confirmar(D) {
  const nome  = document.getElementById('nome-input')?.value.trim();
  const tel   = document.getElementById('tel-input')?.value.trim();
  const email = document.getElementById('email-input')?.value.trim();
  const svcEl = document.getElementById('servico-select');
  const data  = document.getElementById('data-input')?.value;
  const hora  = document.getElementById('hora-select')?.value;
  const obs   = document.getElementById('obs-input')?.value.trim();

  if (!nome || !tel || !svcEl?.value || !data || !hora) {
    alert('Por favor, preencha todos os campos obrigatórios (*).');
    return;
  }

  const opt    = svcEl.options[svcEl.selectedIndex];
  const base   = parseFloat(opt.dataset.preco);
  const descV  = Math.round(base * descontoPct / 100);
  const total  = `R$ ${(base - descV).toFixed(2).replace('.',',')}`;
  const dados  = { nome, tel, email, servico: opt.dataset.nome, data, hora, obs, total };

  const btn = document.getElementById('confirm-btn');
  btn.textContent = 'Enviando...'; btn.disabled = true;

  await enviarEmail(D, dados);
  const wppLink = gerarWppLink(D, dados);

  document.getElementById('modal-wpp').href = wppLink;
  document.getElementById('wpp-fixo').href  = wppLink;
  document.getElementById('modal-overlay').style.display = 'flex';

  btn.textContent = '◆ Confirmar agendamento'; btn.disabled = false;
}

function fecharModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}
