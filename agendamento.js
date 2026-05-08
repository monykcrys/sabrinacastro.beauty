/* ============================================================
   AGENDAMENTO.JS – Sabrina Rückert
   Lógica do formulário de agendamento:
   - Cupons de desconto
   - Resumo de preço dinâmico
   - Envio de notificação por e-mail (EmailJS)
   - Geração de link WhatsApp
   - Validação de dias úteis (ter-sáb)
   - Modal de sucesso
   ============================================================ */

// -------------------------------------------------------
// ⚙️  CONFIGURAÇÃO — edite estes valores
// -------------------------------------------------------
const CONFIG = {
  // Número WhatsApp da Sabrina (somente dígitos, com DDI)
  whatsappNumber: '5547992842082',

  // EmailJS — crie conta grátis em https://emailjs.com
  // Depois substitua as strings abaixo pelas suas credenciais
  emailjs: {
    publicKey:   'SUA_PUBLIC_KEY_AQUI',
    serviceId:   'SUA_SERVICE_ID_AQUI',
    templateId:  'SUA_TEMPLATE_ID_AQUI',
  },

  // Cupons de desconto: { CODIGO: porcentagem }
  cupons: {
    'SABRINA10': 10,
    'BELEZA15':  15,
    'PROMO20':   20,
    'BEM-VINDA': 5,
  },
};
// -------------------------------------------------------

// Preços dos serviços
const PRECOS = {
  design_personalizado: { nome: 'Design Personalizado', preco: 40 },
  design_henna:         { nome: 'Design com Henna',     preco: 60 },
  design_tintura:       { nome: 'Design com Tintura',   preco: 60 },
};

// Estado
let descontoAtivo = 0;    // porcentagem
let descontoValor = 0;    // R$

// --- UTILITÁRIOS ---
function $(id) { return document.getElementById(id); }

function formatMoney(val) {
  return `R$ ${val.toFixed(2).replace('.', ',')}`;
}

// --- BLOQUEAR DATAS INVÁLIDAS (dom e seg) ---
(function () {
  const dataInput = $('data');
  if (!dataInput) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  dataInput.min = `${yyyy}-${mm}-${dd}`;

  dataInput.addEventListener('change', function () {
    const d = new Date(this.value + 'T00:00:00');
    const dow = d.getDay(); // 0=dom, 1=seg
    if (dow === 0 || dow === 1) {
      alert('⚠️ A Sabrina atende apenas de terça a sábado. Por favor, escolha outra data.');
      this.value = '';
    }
    updateSummary();
  });
})();

// --- RESUMO DINÂMICO ---
function updateSummary() {
  const servicoVal = $('servico').value;
  const data       = $('data').value;
  const horario    = $('horario').value;

  const summary = $('price-summary');
  if (!servicoVal) { summary.style.display = 'none'; return; }

  const servico = PRECOS[servicoVal];
  if (!servico) return;

  const precoBase = servico.preco;
  descontoValor   = Math.round(precoBase * descontoAtivo / 100);
  const total     = precoBase - descontoValor;

  $('summary-proc').textContent  = servico.nome;
  $('summary-price').textContent = formatMoney(precoBase);
  $('summary-total').textContent = formatMoney(total);

  const discLine = $('discount-line');
  if (descontoAtivo > 0) {
    $('summary-discount').textContent = `- ${formatMoney(descontoValor)} (${descontoAtivo}%)`;
    discLine.style.display = 'flex';
  } else {
    discLine.style.display = 'none';
  }

  summary.style.display = 'block';
}

$('servico').addEventListener('change', updateSummary);
$('horario').addEventListener('change', updateSummary);

// --- APLICAR CUPOM ---
$('apply-discount-btn').addEventListener('click', function () {
  const code    = $('discount-code').value.trim().toUpperCase();
  const msgEl   = $('discount-message');
  const pct     = CONFIG.cupons[code];

  if (pct !== undefined) {
    descontoAtivo = pct;
    msgEl.textContent = `✓ Cupom "${code}" aplicado! ${pct}% de desconto.`;
    msgEl.className = 'success';
    updateSummary();
  } else {
    descontoAtivo = 0;
    msgEl.textContent = '✗ Cupom inválido ou expirado.';
    msgEl.className = 'error';
    updateSummary();
  }
});

// --- GERAR MENSAGEM WHATSAPP ---
function gerarMensagemWpp(dados) {
  const { nome, telefone, servico, data, horario, obs, total } = dados;
  const msg =
    `Olá Sabrina! 🌟\n\n` +
    `Gostaria de confirmar meu agendamento:\n\n` +
    `👤 *Nome:* ${nome}\n` +
    `📞 *WhatsApp:* ${telefone}\n` +
    `💆 *Serviço:* ${servico}\n` +
    `📅 *Data:* ${formatarData(data)}\n` +
    `🕐 *Horário:* ${horario}\n` +
    `💰 *Total:* ${total}\n` +
    (obs ? `📝 *Obs:* ${obs}\n` : '') +
    `\nAguardo a confirmação! 🙏`;
  return encodeURIComponent(msg);
}

function formatarData(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// --- ENVIAR E-MAIL VIA EMAILJS ---
async function enviarEmailNotificacao(dados) {
  // EmailJS deve ser carregado dinamicamente
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = async () => {
      try {
        emailjs.init(CONFIG.emailjs.publicKey);

        await emailjs.send(
          CONFIG.emailjs.serviceId,
          CONFIG.emailjs.templateId,
          {
            designer_name: 'Sabrina Rückert',
            cliente_nome:  dados.nome,
            cliente_tel:   dados.telefone,
            cliente_email: dados.email || 'Não informado',
            servico:       dados.servico,
            data:          formatarData(dados.data),
            horario:       dados.horario,
            total:         dados.total,
            observacoes:   dados.obs || 'Nenhuma',
          }
        );
        resolve(true);
      } catch (err) {
        console.warn('EmailJS erro (verifique configurações):', err);
        resolve(false); // não bloqueia o fluxo
      }
    };
    script.onerror = () => {
      console.warn('Falha ao carregar EmailJS');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

// --- CONFIRMAR AGENDAMENTO ---
$('confirm-btn').addEventListener('click', async function () {
  const nome     = $('nome').value.trim();
  const telefone = $('telefone').value.trim();
  const email    = $('email').value.trim();
  const servicoV = $('servico').value;
  const data     = $('data').value;
  const horario  = $('horario').value;
  const obs      = $('observacoes').value.trim();

  // Validação básica
  if (!nome || !telefone || !servicoV || !data || !horario) {
    alert('Por favor, preencha todos os campos obrigatórios (*).');
    return;
  }

  // Verifica dia da semana novamente
  const d = new Date(data + 'T00:00:00');
  if (d.getDay() === 0 || d.getDay() === 1) {
    alert('⚠️ Atendimento apenas de terça a sábado.');
    return;
  }

  const servicoInfo = PRECOS[servicoV];
  const precoBase   = servicoInfo.preco;
  descontoValor     = Math.round(precoBase * descontoAtivo / 100);
  const total       = formatMoney(precoBase - descontoValor);

  const dados = {
    nome,
    telefone,
    email,
    servico: servicoInfo.nome,
    data,
    horario,
    obs,
    total,
  };

  // Feedback de loading
  const btn = $('confirm-btn');
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // Enviar e-mail (não bloqueia se falhar)
  await enviarEmailNotificacao(dados);

  // Gerar link WhatsApp com dados pré-preenchidos
  const wppMsg  = gerarMensagemWpp(dados);
  const wppLink = `https://wa.me/${CONFIG.whatsappNumber}?text=${wppMsg}`;

  $('modal-whatsapp').href = wppLink;
  $('whatsapp-btn').href   = wppLink;

  // Mostrar modal
  $('success-modal').style.display = 'flex';

  btn.textContent = '◆ Confirmar agendamento';
  btn.disabled    = false;
});

// --- FECHAR MODAL ---
$('modal-close').addEventListener('click', function () {
  $('success-modal').style.display = 'none';
});
$('success-modal').addEventListener('click', function (e) {
  if (e.target === this) this.style.display = 'none';
});
