// ================================================================
// DADOS.JS — Fonte central de verdade do site Sabrina Castro
// Todas as páginas lêem daqui. O admin escreve aqui.
// ================================================================

const STORAGE_KEY = 'sabrina_site_v2';

const DADOS_PADRAO = {
  // --- IDENTIDADE ---
  identidade: {
    nome:       'Sabrina Castro',
    profissao:  'Designer de Sobrancelhas',
    heroFrase:  'Arte em cada fio',
    heroSub:    'Design personalizado com técnica, cuidado e um olhar apurado para realçar o que há de mais único em você.',
    bioCurta:   'Tenho 20 anos e encontrei no design de sobrancelhas a minha verdadeira paixão. Minha trajetória na área da beleza começou em 2021 através de cursos profissionalizantes.',
    bioLonga:   'Mesmo enfrentando desafios e períodos afastada da profissão, nunca deixei de acreditar no meu potencial. Hoje, vejo essa nova fase como um recomeço e sigo dedicada a transformar autoestima e realçar a beleza natural de cada cliente com técnica, cuidado e profissionalismo.',
    cidade:     'Joinville, SC',
    endereco:   'Endereço enviado após confirmação do agendamento',
  },

  // --- PALETA DE CORES ---
  cores: {
    primaria:   '#6B4A2E',
    secundaria: '#8C6239',
    destaque:   '#D4AF37',
    destaqueClaro: '#E6C98A',
    fundo:      '#F5EFE3',
    fundoMedio: '#EADBC1',
    escuro:     '#1a1108',
    textoPrincipal: '#2e1f0d',
    textoMedio: '#5a3e1b',
  },

  // --- CONTATO ---
  contato: {
    whatsapp:   '5547999999999',
    wppMsg:     'Olá Sabrina! Gostaria de agendar um horário. 🌟',
    instagram:  '',
    tiktok:     '',
    emailjsKey:  '',
    emailjsSvc:  '',
    emailjsTmpl: '',
    emailDestino: '',
  },

  // --- SERVIÇOS ---
  servicos: [
    {
      id: 1,
      slug: 'design_personalizado',
      emoji: '✨',
      nome: 'Design Personalizado',
      desc: 'Procedimento totalmente adaptado ao formato do seu rosto, respeitando suas linhas naturais e buscando realçar sua harmonia facial com leveza, precisão e elegância. Resultado sofisticado e natural.',
      preco: 45,
      precoPromo: 40,
      temPromo: true,
      ativo: true,
      foto: '',
    },
    {
      id: 2,
      slug: 'design_henna',
      emoji: '🤍',
      nome: 'Design com Henna',
      desc: 'Além do design personalizado, é aplicada a henna para preencher e dar mais definição às sobrancelhas, proporcionando um efeito mais marcado, alinhado e com maior durabilidade na pele.',
      preco: 65,
      precoPromo: 60,
      temPromo: true,
      ativo: true,
      foto: '',
    },
    {
      id: 3,
      slug: 'design_tintura',
      emoji: '✨',
      nome: 'Design com Tintura',
      desc: 'Design personalizado finalizado com tintura, ideal para realçar os fios, dar mais intensidade à cor e garantir um acabamento mais preenchido e uniforme, mantendo a naturalidade com um toque sofisticado.',
      preco: 65,
      precoPromo: 60,
      temPromo: true,
      ativo: true,
      foto: '',
    },
  ],

  // --- HORÁRIOS ---
  horarios: [
    { dia: 'Segunda',  sigla: 'seg', open: '08:00', close: '20:00', ativo: false },
    { dia: 'Terça',    sigla: 'ter', open: '08:00', close: '20:00', ativo: true  },
    { dia: 'Quarta',   sigla: 'qua', open: '08:00', close: '20:00', ativo: true  },
    { dia: 'Quinta',   sigla: 'qui', open: '08:00', close: '20:00', ativo: true  },
    { dia: 'Sexta',    sigla: 'sex', open: '08:00', close: '20:00', ativo: true  },
    { dia: 'Sábado',   sigla: 'sab', open: '08:00', close: '20:00', ativo: true  },
    { dia: 'Domingo',  sigla: 'dom', open: '08:00', close: '20:00', ativo: false },
  ],

  // --- CUPONS ---
  cupons: [
    { codigo: 'SABRINA10', pct: 10, ativo: true  },
    { codigo: 'BELEZA15',  pct: 15, ativo: true  },
    { codigo: 'PROMO20',   pct: 20, ativo: false },
    { codigo: 'BEM-VINDA', pct:  5, ativo: true  },
  ],

  // --- ABAS DE NAVEGAÇÃO ---
  abas: [
    { id: 'home',        label: 'Início',     href: 'index.html',       visivel: true  },
    { id: 'portfolio',   label: 'Trabalhos',  href: 'portfolio.html',   visivel: true  },
    { id: 'agendamento', label: 'Agendar',    href: 'agendamento.html', visivel: true, destaque: true },
  ],

  // --- FOTOS DA GALERIA ---
  fotos: [],

  // --- AUTH ADMIN ---
  auth: { user: 'sabrina', pass: 'admin123' },
};

// ---- API pública ----
function getDados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DADOS_PADRAO));
    // Merge para garantir campos novos do padrão
    const salvo = JSON.parse(raw);
    return deepMerge(JSON.parse(JSON.stringify(DADOS_PADRAO)), salvo);
  } catch { return JSON.parse(JSON.stringify(DADOS_PADRAO)); }
}

function setDados(d) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  // Dispara evento para páginas abertas em outras abas
  window.dispatchEvent(new CustomEvent('sabrina-update', { detail: d }));
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (Array.isArray(source[key])) { target[key] = source[key]; }
    else if (source[key] && typeof source[key] === 'object') { target[key] = deepMerge(target[key] || {}, source[key]); }
    else { target[key] = source[key]; }
  }
  return target;
}

// Aplica cores CSS dinamicamente
function aplicarCores(cores) {
  if (!cores) return;
  const r = document.documentElement.style;
  r.setProperty('--marrom',    cores.primaria);
  r.setProperty('--marrom2',   cores.secundaria);
  r.setProperty('--gold',      cores.destaque);
  r.setProperty('--gold-soft', cores.destaqueClaro);
  r.setProperty('--bege-claro',cores.fundo);
  r.setProperty('--bege',      cores.fundoMedio);
  r.setProperty('--dark',      cores.escuro);
  r.setProperty('--text',      cores.textoPrincipal);
  r.setProperty('--text-mid',  cores.textoMedio);
  r.setProperty('--text-light',cores.secundaria);
}
