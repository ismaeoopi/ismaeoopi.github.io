/**
 * TELEMETRY & REAL-TIME ROI ENGINE FOR RPA AUTOMATIONS
 * Portfólio de Ismael Batista do Nascimento (GitHub: @ismaeoopi)
 * 
 * Regras de Negócio & Cálculos:
 * 1. Módulo Cabotagem, Ordem de Frete (OF) & Playwright Web:
 *    - Início: 25/05/2026
 *    - Manual: 90s vs Automação: 15s (economia de 75s por OF)
 *    - Volume: 20 OFs/dia útil (~1 a cada hora comercial)
 *    - Odômetro dinâmico em tempo real com virada de ciclo (+75s e +1 OF)
 * 
 * 2. RPA Expedição & Estoque SAP:
 *    - Início: 19/05/2026
 *    - 3 usuários diretos x 2h/dia = 6 horas economizadas por dia útil
 * 
 * 3. Automação de Estoque SAP & Baixa de Packlists (MIGO / PRDI):
 *    - Início: 19/05/2026
 *    - 4 usuários diretos x 2h/dia = 8 horas economizadas por dia útil (1 FTE liberado)
 */

(() => {
  'use strict';

  // Configuração das automações
  const TELEMETRY_CONFIG = {
    // Data de referência de fallback (caso o navegador esteja em ano diferente)
    REFERENCE_DATE: new Date('2026-09-22T09:00:00'),

    cabotagem: {
      startDate: new Date('2026-05-25T00:00:00'),
      manualSeconds: 90,
      autoSeconds: 15,
      savedSecondsPerOF: 75,
      ofsPerBusinessDay: 20
    },

    expedicao: {
      startDate: new Date('2026-05-19T00:00:00'),
      users: 3,
      hoursPerUserDay: 4, // 4h por usuário por dia útil (12h/dia útil no total)
      nfsPerUserDay: 10,  // média de 10 NF por dia útil por usuário (30 NF/dia no total)
      labelsPerWeek: 120, // média de 120 etiquetas por semana (24 etiquetas/dia útil)
      get hoursPerBusinessDay() { return this.users * this.hoursPerUserDay; },
      get nfsPerBusinessDay() { return this.users * this.nfsPerUserDay; },
      get labelsPerBusinessDay() { return this.labelsPerWeek / 5; }
    },

    estoque: {
      startDate: new Date('2026-05-19T00:00:00'),
      users: 4,
      hoursPerUserDay: 2, // 8h por dia útil
      get hoursPerBusinessDay() { return this.users * this.hoursPerUserDay; }
    }
  };

  /**
   * Calcula dias úteis (Segunda a Sexta) entre duas datas
   */
  function calculateBusinessDays(startDate, endDate) {
    if (startDate > endDate) return 0;
    let count = 0;
    const cur = new Date(startDate.getTime());
    cur.setHours(0, 0, 0, 0);

    const end = new Date(endDate.getTime());
    end.setHours(23, 59, 59, 999);

    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // 0 = Domingo, 6 = Sábado
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  /**
   * Obtém a data corrente para cálculo (com salvaguarda caso o cliente esteja em 2024/2025)
   */
  function getEffectiveDate() {
    const now = new Date();
    // Se a data do sistema for anterior ao início dos projetos em maio de 2026, usa a data de referência
    if (now < TELEMETRY_CONFIG.expedicao.startDate) {
      return TELEMETRY_CONFIG.REFERENCE_DATE;
    }
    return now;
  }

  // Estado em tempo real
  const state = {
    now: getEffectiveDate(),
    liveAddedOfs: 0,
    liveAddedSeconds: 0,
    isCycleRunning: true,
    cycleTimer: null,
    secondTimer: null
  };

  /**
   * Formata número no padrão brasileiro
   */
  function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  /**
   * Formata segundos em formato legível (Xh Ym Zs)
   */
  function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${formatNumber(hours)}h ${minutes}min`;
    }
    return `${minutes}min ${seconds}s`;
  }

  /**
   * Calcula as métricas consolidadas e por projeto
   */
  function computeMetrics() {
    const effectiveNow = getEffectiveDate();

    // 1. Dias úteis
    const bDaysCabotagem = calculateBusinessDays(TELEMETRY_CONFIG.cabotagem.startDate, effectiveNow);
    const bDaysExpedicao = calculateBusinessDays(TELEMETRY_CONFIG.expedicao.startDate, effectiveNow);
    const bDaysEstoque = calculateBusinessDays(TELEMETRY_CONFIG.estoque.startDate, effectiveNow);

    // 2. Cabotagem
    const baseOfs = bDaysCabotagem * TELEMETRY_CONFIG.cabotagem.ofsPerBusinessDay;
    const totalOfs = baseOfs + state.liveAddedOfs;
    const totalCabotagemSeconds = (totalOfs * TELEMETRY_CONFIG.cabotagem.savedSecondsPerOF);
    const totalCabotagemHours = totalCabotagemSeconds / 3600;

    // 3. Expedição SAP
    const totalExpedicaoHours = bDaysExpedicao * TELEMETRY_CONFIG.expedicao.hoursPerBusinessDay;
    const expedicaoDaysSaved = Math.round(totalExpedicaoHours / 8);
    const totalExpedicaoNfs = Math.round(bDaysExpedicao * TELEMETRY_CONFIG.expedicao.nfsPerBusinessDay);
    const totalExpedicaoLabels = Math.round(bDaysExpedicao * TELEMETRY_CONFIG.expedicao.labelsPerBusinessDay);

    // 4. Estoque SAP MIGO/PRDI
    const totalEstoqueHours = bDaysEstoque * TELEMETRY_CONFIG.estoque.hoursPerBusinessDay;
    const estoqueDaysSaved = Math.round(totalEstoqueHours / 8);

    // 5. Totais Consolidados (Soma de todos os projetos + Odômetro ao vivo)
    const baseTotalSeconds = (totalExpedicaoHours * 3600) + (totalEstoqueHours * 3600) + totalCabotagemSeconds;
    const currentTotalSeconds = baseTotalSeconds + state.liveAddedSeconds;
    const totalHoursAll = currentTotalSeconds / 3600;
    const totalDaysAll = Math.round(totalHoursAll / 8);
    const dailyHoursSaved = TELEMETRY_CONFIG.expedicao.hoursPerBusinessDay +
                            TELEMETRY_CONFIG.estoque.hoursPerBusinessDay +
                            ((TELEMETRY_CONFIG.cabotagem.ofsPerBusinessDay * TELEMETRY_CONFIG.cabotagem.savedSecondsPerOF) / 3600);

    return {
      bDaysCabotagem,
      bDaysExpedicao,
      bDaysEstoque,
      cabotagem: {
        totalOfs,
        totalSeconds: totalCabotagemSeconds,
        totalHours: totalCabotagemHours,
        savedPerOf: TELEMETRY_CONFIG.cabotagem.savedSecondsPerOF,
        bDays: bDaysCabotagem
      },
      expedicao: {
        totalHours: totalExpedicaoHours,
        daysSaved: expedicaoDaysSaved,
        dailyHours: TELEMETRY_CONFIG.expedicao.hoursPerBusinessDay,
        users: TELEMETRY_CONFIG.expedicao.users,
        bDays: bDaysExpedicao,
        totalNfs: totalExpedicaoNfs,
        totalLabels: totalExpedicaoLabels
      },
      estoque: {
        totalHours: totalEstoqueHours,
        daysSaved: estoqueDaysSaved,
        dailyHours: TELEMETRY_CONFIG.estoque.hoursPerBusinessDay,
        users: TELEMETRY_CONFIG.estoque.users,
        bDays: bDaysEstoque
      },
      consolidated: {
        totalHours: totalHoursAll,
        totalSeconds: currentTotalSeconds,
        totalDays: totalDaysAll,
        dailyHours: dailyHoursSaved,
        totalOfs,
        totalNfs: totalExpedicaoNfs,
        totalLabels: totalExpedicaoLabels
      }
    };
  }

  /**
   * Atualiza os elementos no DOM
   */
  function renderDOM(triggerAnimation = false) {
    const metrics = computeMetrics();

    // 1. Métricas do Hero (Coluna Direita - Impacto em Produção)
    const elHeroHours = document.getElementById('hero-stat-hours');
    const elHeroHoursLive = document.getElementById('hero-stat-hours-live');
    const elHeroNfs = document.getElementById('hero-stat-nfs');
    const elHeroLabels = document.getElementById('hero-stat-labels');
    const elHeroOfs = document.getElementById('hero-stat-ofs');

    if (elHeroHours) {
      elHeroHours.textContent = `+${formatNumber(Math.floor(metrics.consolidated.totalHours))}h`;
    }
    if (elHeroHoursLive) {
      const liveMins = Math.floor((metrics.consolidated.totalSeconds % 3600) / 60);
      const liveSecs = Math.floor(metrics.consolidated.totalSeconds % 60);
      elHeroHoursLive.textContent = `${liveMins}m ${String(liveSecs).padStart(2, '0')}s`;
    }
    if (elHeroNfs) {
      elHeroNfs.textContent = `+${formatNumber(metrics.expedicao.totalNfs)}`;
    }
    if (elHeroLabels) {
      elHeroLabels.textContent = `+${formatNumber(metrics.expedicao.totalLabels)}`;
    }
    if (elHeroOfs) {
      elHeroOfs.textContent = `+${formatNumber(metrics.cabotagem.totalOfs)}`;
    }

    // 2. Dashboard Consolidado (caso exista)
    const elTotalHours = document.getElementById('telem-total-hours');
    const elTotalDays = document.getElementById('telem-total-days');
    const elTotalOfs = document.getElementById('telem-total-ofs');
    const elDailyRate = document.getElementById('telem-daily-rate');

    if (elTotalHours) elTotalHours.textContent = `${formatNumber(Math.floor(metrics.consolidated.totalHours))}h`;
    if (elTotalDays) elTotalDays.textContent = `~${formatNumber(metrics.consolidated.totalDays)} dias de trabalho manual`;
    if (elTotalOfs) elTotalOfs.textContent = formatNumber(metrics.consolidated.totalOfs);
    if (elDailyRate) elDailyRate.textContent = `${formatNumber(metrics.consolidated.dailyHours, 1)}h / dia útil`;

    // 3. Card Cabotagem
    const elCabotOfs = document.getElementById('card-cabot-ofs');
    const elCabotHours = document.getElementById('card-cabot-hours');
    const elCabotSavedDesc = document.getElementById('card-cabot-desc');

    if (elCabotOfs) elCabotOfs.textContent = `${formatNumber(metrics.cabotagem.totalOfs)} OFs`;
    if (elCabotHours) elCabotHours.textContent = formatDuration(metrics.cabotagem.totalSeconds);
    if (elCabotSavedDesc) {
      elCabotSavedDesc.textContent = `${formatNumber(metrics.cabotagem.bDays)} dias úteis em produção (~${metrics.cabotagem.bDays * 20} OFs base)`;
    }

    // 4. Card Expedição
    const elExpHours = document.getElementById('card-exp-hours');
    const elExpDays = document.getElementById('card-exp-days');
    const elExpNfs = document.getElementById('card-exp-nfs');
    const elExpLabels = document.getElementById('card-exp-labels');

    if (elExpHours) elExpHours.textContent = `${formatNumber(metrics.expedicao.totalHours)} horas`;
    if (elExpDays) elExpDays.textContent = `~${formatNumber(metrics.expedicao.daysSaved)} dias úteis economizados`;
    if (elExpNfs) elExpNfs.textContent = `${formatNumber(metrics.expedicao.totalNfs)} NF-e`;
    if (elExpLabels) elExpLabels.textContent = `${formatNumber(metrics.expedicao.totalLabels)} etiquetas`;

    // 5. Card Estoque
    const elEstHours = document.getElementById('card-est-hours');
    const elEstDays = document.getElementById('card-est-days');
    if (elEstHours) elEstHours.textContent = `${formatNumber(metrics.estoque.totalHours)} horas`;
    if (elEstDays) elEstDays.textContent = `~${formatNumber(metrics.estoque.daysSaved)} dias úteis (1 FTE liberado)`;

    // Feedback visual quando acionado
    if (triggerAnimation) {
      triggerPulseEffect();
    }
  }

  /**
   * Efeito visual da virada de ciclo de OF
   * Incrementa +1 OF e +75 segundos com animação flutuante
   */
  function triggerOfCycle(manual = false) {
    state.liveAddedOfs += 1;
    state.liveAddedSeconds += 75;
    renderDOM(true);

    // Cria o badge flutuante "+75s"
    const targetAnchor = document.getElementById('cabotagem-odometer-anchor');
    if (targetAnchor) {
      const badge = document.createElement('div');
      badge.className = 'odometer-floating-badge';
      badge.innerHTML = manual 
        ? `<span>⚡ +1 OF Lançada!</span> <strong>+75s</strong>` 
        : `<span>⚡ Ciclo Automático</span> <strong>+75s</strong>`;

      targetAnchor.appendChild(badge);

      // Remove após o fim da animação
      setTimeout(() => {
        if (badge.parentNode) badge.parentNode.removeChild(badge);
      }, 2200);
    }

    // Pisca o mostrador do odômetro
    const odometerDisplay = document.getElementById('card-cabot-display');
    if (odometerDisplay) {
      odometerDisplay.classList.remove('odometer-tick');
      void odometerDisplay.offsetWidth; // Força reflow
      odometerDisplay.classList.add('odometer-tick');
    }
  }

  /**
   * Efeito de pulso luminoso na telemetria
   */
  function triggerPulseEffect() {
    const liveBadges = document.querySelectorAll('.telemetry-live-pulse');
    liveBadges.forEach(b => {
      b.classList.add('pulse-active');
      setTimeout(() => b.classList.remove('pulse-active'), 800);
    });

    // Pulso no Hero Odômetro
    const heroWrap = document.getElementById('hero-stat-hours-wrap');
    if (heroWrap) {
      heroWrap.classList.remove('odometer-tick');
      void heroWrap.offsetWidth;
      heroWrap.classList.add('odometer-tick');
    }

    // Pulso nas OFs do Hero
    const heroOfs = document.getElementById('hero-stat-ofs');
    if (heroOfs) {
      heroOfs.classList.remove('odometer-tick');
      void heroOfs.offsetWidth;
      heroOfs.classList.add('odometer-tick');
    }
  }

  /**
   * Inicializa o loop contínuo de virada de OF e odômetro de tempo
   */
  function startLiveCycle() {
    // 1. Ticker contínuo a cada segundo acumulando tempo da frota de robôs em produção
    if (state.secondTimer) clearInterval(state.secondTimer);
    state.secondTimer = setInterval(() => {
      if (state.isCycleRunning) {
        // A frota economiza ~20.42 horas por dia útil (~2.55s por segundo de turno)
        state.liveAddedSeconds += 2.55;
        renderDOM(false);
      }
    }, 1000);

    // 2. A cada 9 segundos simula uma virada de ciclo de OF em produção
    if (state.cycleTimer) clearInterval(state.cycleTimer);
    state.cycleTimer = setInterval(() => {
      if (state.isCycleRunning) {
        triggerOfCycle(false);
      }
    }, 9000);
  }

  /**
   * Inicialização e Event Listeners
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Render inicial
    renderDOM();
    startLiveCycle();

    // Botão de Simulação Manual no Card de Cabotagem
    const manualBtn = document.getElementById('btn-simulate-of');
    if (manualBtn) {
      manualBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerOfCycle(true);
        // Pequena animação no botão
        manualBtn.classList.add('btn-clicked');
        setTimeout(() => manualBtn.classList.remove('btn-clicked'), 300);
      });
    }

    // Pausar/retomar ciclo se a aba ficar inativa
    document.addEventListener('visibilitychange', () => {
      state.isCycleRunning = !document.hidden;
    });
  });

  // Exporta métodos para o escopo global para integração com o modal
  window.RPATelemetry = {
    computeMetrics,
    triggerOfCycle,
    formatNumber,
    formatDuration
  };

})();
