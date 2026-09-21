/**
 * TERMINAL SIMULATOR FOR RPA & PYTHON AUTOMATION
 * Simula a execução real dos scripts do repositório rpa_Expedicao (GitHub: ismaeoopi)
 */

document.addEventListener('DOMContentLoaded', () => {
  const terminalBody = document.getElementById('terminal-body');
  const tabs = document.querySelectorAll('.terminal-tab');
  const playBtn = document.getElementById('term-play-btn');
  const clearBtn = document.getElementById('term-clear-btn');
  const statusIndicator = document.getElementById('terminal-status');

  if (!terminalBody) return;

  let currentScript = 'sap_cabotagem_playwright.py';
  let isRunning = true;
  let logInterval = null;
  let currentStep = 0;

  // Roteiros simulados com base no projeto real RPA Expedição SAP
  const scriptsData = {
    'sap_cabotagem_playwright.py': [
      { tag: 'info', label: 'INIT', msg: 'Inicializando motor RPA Cabotagem [Python 3.12 + Playwright + pywin32]' },
      { tag: 'bot', label: 'SAP_GUI', msg: 'Conectando ao SAP GUI Scripting Engine (GetObject "SAPGUI")...' },
      { tag: 'success', label: 'SAP_OK', msg: 'Sessão ativa detectada: Transação /n/SCMTMS/PLN_EXP iniciada' },
      { tag: 'bot', label: 'BROWSER', msg: 'Abrindo sessão Playwright headless para portal web de Cabotagem...' },
      { progress: 30 },
      { tag: 'info', label: 'QUERY', msg: 'Consultando Ordens de Frete (OF) pendentes para o centro logístico' },
      { tag: 'bot', label: 'POPUP', msg: 'fechar_popups(): Tratando modal de confirmação e liberando ordem' },
      { progress: 70 },
      { tag: 'success', label: 'COSTS', msg: 'Custos de OF apurados e conferidos com tabela de tolerância' },
      { progress: 100 },
      { tag: 'speed', label: 'METRICS', msg: 'Ordem de Frete gerada em 14.8s | Lançamento validado sem divergências' }
    ],
    'lancamento_frete.py': [
      { tag: 'info', label: 'INIT', msg: 'Inicializando Processador de Frete & CT-e [Pandas + OpenPyXL]' },
      { tag: 'bot', label: 'EXCEL', msg: 'Carregando planilha corporativa de fretes e rateios fiscais...' },
      { tag: 'info', label: 'DATA', msg: 'DataFrame criado: 184 conhecimentos de transporte (CT-es) mapeados' },
      { progress: 40 },
      { tag: 'bot', label: 'VALIDATE', msg: 'Cruzando valores de CT-e com remessas e pedidos de transferência' },
      { progress: 80 },
      { tag: 'success', label: 'SAP_RC', msg: 'Executando Registro de Custos (RC) em lote no SAP GUI' },
      { progress: 100 },
      { tag: 'speed', label: 'METRICS', msg: '184 CT-es processados | Tempo manual economizado: ~3h 45min' }
    ],
    'estoque_migo.py': [
      { tag: 'info', label: 'INIT', msg: 'Módulo de Estoque e Armazém SAP (MIGO / PRDI / Packlists)' },
      { tag: 'bot', label: 'CLOUD', msg: 'Autenticando no Microsoft SharePoint e baixando Packlists do dia...' },
      { progress: 35 },
      { tag: 'info', label: 'PARSER', msg: 'Processando estruturas de Unidades de Carga (UC) e lotes de bobinas' },
      { tag: 'bot', label: 'SAP_MIGO', msg: 'Disparando transação MIGO para entrada de mercadorias no depósito' },
      { progress: 80 },
      { tag: 'success', label: 'STATUS', msg: 'Etiquetas FIP geradas | Estoque atualizado no banco SQLite local' },
      { progress: 100 },
      { tag: 'speed', label: 'METRICS', msg: 'Rotina concluída com sucesso. Zero intervenção manual.' }
    ]
  };

  function formatTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0').slice(0, 2);
  }

  function appendLog(item) {
    if (item.progress !== undefined) {
      const progEl = document.createElement('div');
      progEl.className = 'term-progress-bar terminal-line-new';
      progEl.innerHTML = `<div class="term-progress-fill" style="width: ${item.progress}%"></div>`;
      terminalBody.appendChild(progEl);
    } else {
      const lineEl = document.createElement('div');
      lineEl.className = 'terminal-line terminal-line-new';
      lineEl.innerHTML = `
        <span class="term-time">${formatTime()}</span>
        <span class="term-tag ${item.tag}">[${item.label}]</span>
        <span class="term-msg">${item.msg}</span>
      `;
      terminalBody.appendChild(lineEl);
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function startExecution() {
    if (logInterval) clearInterval(logInterval);
    const steps = scriptsData[currentScript] || [];

    logInterval = setInterval(() => {
      if (!isRunning) return;

      if (currentStep < steps.length) {
        appendLog(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(logInterval);
        setTimeout(() => {
          if (isRunning) {
            clearTerminal();
            startExecution();
          }
        }, 4000);
      }
    }, 900);
  }

  function clearTerminal() {
    terminalBody.innerHTML = `
      <div class="terminal-line">
        <span class="term-time">${formatTime()}</span>
        <span class="term-tag info">[SYSTEM]</span>
        <span class="term-msg">$ python src/expedicao/${currentScript}</span>
      </div>
    `;
    currentStep = 0;
  }

  // Troca de script através das tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentScript = tab.getAttribute('data-script');
      clearTerminal();
      currentStep = 0;
      startExecution();
    });
  });

  // Botão Play/Pause
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      playBtn.innerHTML = isRunning 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      
      if (statusIndicator) {
        statusIndicator.innerHTML = isRunning 
          ? `<span class="pulse-dot"></span> Rodando em produção` 
          : `<span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;display:inline-block"></span> Pausado`;
      }
    });
  }

  // Botão Limpar
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearTerminal();
      currentStep = 0;
    });
  }

  clearTerminal();
  startExecution();
});
