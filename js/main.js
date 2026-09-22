/**
 * MAIN INTERACTION SCRIPT
 * Portfólio de Desenvolvedor RPA & Automação Python
 * Ismael Batista do Nascimento (GitHub: ismaeoopi)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // 3. Scroll Reveal Animation
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // 4. Filtros de Projetos
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // 5. Dados Reais dos Projetos (GitHub & SaaS)
  const projectsData = {
    'purple-system': {
      title: 'Purple System | Plataforma SaaS de Gestão Integrada (ERP & PDV)',
      badge: 'SaaS & Gestão Empresarial',
      repoUrl: 'https://purplesystem.com.br/',
      summary: 'Plataforma SaaS multiempresa de gestão integrada reunindo estoque, ficha técnica (BOM), controle de produção, orçamentos, pedidos, financeiro e PDV offline-first.',
      problem: 'Empresas lidam com dados fragmentados em planilhas desconexas para controle de estoque, compras, produção e fechamento financeiro, além de travarem suas vendas sempre que há oscilação de internet.',
      solution: 'Arquitetura e desenvolvimento full stack de um sistema de gestão integrado em nuvem (SaaS) com suporte a multiempresas, controle rigoroso de ficha técnica (BOM), fluxo de caixa, relatórios analíticos e PDV desktop offline com sincronização automática com o servidor.',
      impact: 'Unificação 360° de vendas, suprimentos e finanças, operação de venda ininterrupta mesmo sem conexão com a internet e suporte especializado integrado.',
      techs: ['SaaS Multi-tenant', 'Gestão de Estoque & BOM', 'PDV Offline-First', 'Arquitetura Cloud', 'REST API', 'JavaScript', 'TailwindCSS'],
      codeSnippet: `// Sincronização resiliente de transações offline do PDV (Purple System)
export async function syncOfflineSales(tenantId, offlineQueue) {
  const pendingOrders = await offlineQueue.getPendingOrders();
  if (!pendingOrders.length) return { status: 'IDLE', synced: 0 };

  const payload = {
    tenant_id: tenantId,
    device_id: window.deviceFingerprint,
    timestamp: new Date().toISOString(),
    transactions: pendingOrders
  };

  try {
    const response = await fetch("https://purplesystem.com.br/api/v1/sync", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "X-Tenant-Auth": tenantId 
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      await offlineQueue.markAsSynchronized(pendingOrders.map(o => o.id));
      return { status: 'SUCCESS', synced: pendingOrders.length };
    }
  } catch (error) {
    console.warn("Conexão instável. Vendas armazenadas localmente para reenvio.");
  }
}`
    },
    'rpa-expedicao': {
      title: 'RPA Expedição & Estoque SAP | Automação Logística End-to-End',
      badge: 'SAP ERP & Logística',
      repoUrl: 'https://github.com/ismaeoopi/rpa_Expedicao',
      summary: 'Solução corporativa completa em Python que automatiza separação de cargas, seleção de Unidades de Carga (UC), picking e integração direta com SAP GUI.',
      telemetry: {
        startDate: '19/05/2026',
        formula: '4 horas/dia por usuário direto em 3 usuários = 12 horas economizadas por dia útil',
        dailySavings: '12h / dia útil (60h / semana)',
        benchmark: '~1.092 horas acumuladas (~137 dias úteis de trabalho manual poupados)',
        impactDesc: 'Eliminação da conferência manual de remessas, processamento de ~10 NF/dia por usuário, geração de ~120 etiquetas FIP/sem e seleção automatizada de UCs no SAP.'
      },
      problem: 'O time de expedição e logística enfrentava alto volume manual diário para conferir remessas de transferência, selecionar UCs e emitir ordens de frete no SAP, gerando gargalos de faturamento e risco de inconsistências de lote.',
      solution: 'Desenvolvimento de uma aplicação robusta em Python empacotada em executável (.exe) autônomo com interface local em Flask (Dark Mode). Integração com SAP GUI via pywin32, sincronização de relatórios operacionais com Microsoft SharePoint e módulo de Auto-Update silencioso via Git.',
      impact: 'Eliminação completa de falhas de digitação em remessas, conferência de tolerâncias milimétricas automatizada e redução drástica no tempo de liberação de transporte.',
      techs: ['Python 3.12', 'SAP GUI (pywin32)', 'Playwright', 'Flask', 'Pandas', 'OpenPyXL', 'SQLite', 'PyInstaller', 'Git Auto-Update'],
      codeSnippet: `# Conexão resiliente ao SAP GUI e tratamento de janelas pop-up
import win32com.client as win32
import time

def conectar_sap():
    """Conecta dinamicamente ao processo ativo do SAP Logon"""
    try:
        sap_gui = win32.GetObject("SAPGUI")
        application = sap_gui.GetScriptingEngine
        connection = application.Children(0)
        session = connection.Children(0)
        return session
    except Exception as exc:
        print(f"Erro ao conectar ao SAP GUI: {exc}")
        return None

def fechar_popups(session, keywords):
    """Detecta e encerra pop-ups de confirmação do SAP automaticamente"""
    try:
        janela = session.ActiveWindow
        titulo = janela.Text.lower()
        for kw in keywords:
            if kw.lower() in titulo:
                if "liberar" in titulo or "ordem" in titulo:
                    janela.findById("usr/btnSPOP-VAROPTION1").press()
                    return True
                session.findById("wnd[0]").sendVKey(0) # Enter padrão
                return True
    except Exception:
        pass
    return False`
    },
    'sap-cabotagem': {
      title: 'Módulo Cabotagem, Ordem de Frete (OF) & Playwright Web',
      badge: 'Playwright & Web Scraping',
      repoUrl: 'https://github.com/ismaeoopi/rpa_Expedicao',
      summary: 'Automação híbrida combinando Playwright para portais web de transporte e SAP GUI Scripting para apuração de fretes.',
      telemetry: {
        startDate: '25/05/2026',
        formula: '90s manual vs. 15s automação = Economia de 75 segundos por Ordem de Frete (OF)',
        dailySavings: '20 OFs/dia útil (~25 minutos líquidos por dia útil)',
        benchmark: '+1.720 OFs processadas (+35h 50min de digitação manual extenuante eliminadas)',
        impactDesc: 'Automação híbrida com Playwright extraindo custos de portais web de cabotagem e parametrizando ordens no SAP GUI com odômetro ativo.'
      },
      problem: 'A apuração de custos de Ordens de Frete (OF) para cabotagem exigia acessar múltiplos portais web de transportadoras, extrair tabelas de custos e cadastrar manualmente os valores no SAP.',
      solution: 'Robô com Playwright para automação de navegação e extração headless, cruzando tabelas de tarifas com planilhas corporativas via Pandas e inserindo os valores apurados na transação de fretes do SAP.',
      impact: 'Tempo de lançamento por Ordem de Frete reduzido para menos de 15 segundos, com 100% de assertividade e sem divergência fiscal em CT-es.',
      techs: ['Python', 'Playwright (Chromium)', 'pywin32', 'Pandas', 'OpenPyXL', 'Regex'],
      codeSnippet: `from playwright.async_api import async_playwright
import pandas as pd

async def processar_portal_cabotagem(of_numero: str, session_sap):
    """Extrai custos do portal de cabotagem e atualiza SAP GUI"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://portal-cabotagem-logistica.interno/login")
        await page.fill("#inputOF", of_numero)
        await page.click("#btnConsultar")
        
        custos = await page.eval_on_selector(".tabela-custos", 
            "el => Array.from(el.querySelectorAll('tr')).map(r => r.innerText)")
        await browser.close()
        
        # Grava valores apurados diretamente no SAP
        session_sap.findById("wnd[0]/usr/txtCUSTO_TOTAL").text = str(custos[1])
        session_sap.sendVKey(0) # Confirmar`
    },
    'sap-estoque': {
      title: 'Automação de Estoque SAP & Baixa de Packlists (MIGO / PRDI)',
      badge: 'SAP GUI & Dados',
      repoUrl: 'https://github.com/ismaeoopi/rpa_Expedicao',
      summary: 'Módulo que executa transações de inventário em lote no SAP (MIGO, PRDI, ADGI, BRID, CO01, CS15, MON, MSC, VL32) e concilia planilhas.',
      telemetry: {
        startDate: '19/05/2026',
        formula: '2 horas/dia por usuário direto em 4 usuários = 8 horas economizadas por dia útil',
        dailySavings: '8h / dia útil (40h / semana)',
        benchmark: '~728 horas acumuladas (~91 dias úteis = 1 FTE totalmente liberado)',
        impactDesc: 'Execução de mais de 10 transações críticas do SAP (MIGO, PRDI, ADGI, BRID, CO01, CS15, MON, MSC, VL32) com histórico local em SQLite.'
      },
      problem: 'Conferência física de packlists de bobinas e matérias-primas demandava entrada manual repetitiva em mais de 10 transações distintas do SAP, consumindo horas diárias dos analistas.',
      solution: 'Automação integrada que baixa planilhas do Microsoft SharePoint, extrai Unidades de Carga com Pandas, gera etiquetas de identificação (FIP) e realiza baixas e lançamentos automáticos no SAP.',
      impact: 'Mais de 10 transações críticas do SAP automatizadas, com armazenamento do histórico no SQLite local e auditoria completa.',
      techs: ['Python', 'Pandas', 'OpenPyXL', 'SQLite', 'pywin32', 'SharePoint Client', 'ReportLab'],
      codeSnippet: `# Processamento em lote de Packlists com baixa no SAP MIGO
import pandas as pd
from src.utils.sap_utils import conectar_sap

def processar_packlist_e_migo(planilha_path: str):
    df = pd.read_excel(planilha_path, sheet_name="Lotes")
    session = conectar_sap()
    if not session:
        return False
        
    for _, row in df.iterrows():
        lote = str(row["LOTE_UC"])
        quantidade = float(row["PESO_LIQUIDO"])
        
        session.StartTransaction("MIGO")
        session.findById("wnd[0]/usr/ctxtGOHEAD-BWART").text = "101"
        session.findById("wnd[0]/usr/subSUB_MAIN:SAPLMIGO:0010/txtLOT").text = lote
        session.findById("wnd[0]/usr/subSUB_MAIN:SAPLMIGO:0010/txtQTY").text = str(quantidade)
        session.findById("wnd[0]/tbar[0]/btn[11] ").press() # Gravar
    return True`
    },
    'jrcruz-site': {
      title: 'Plataforma Web Institucional JR Cruz (Frontend & CI/CD)',
      badge: 'Frontend & Web',
      repoUrl: 'https://github.com/ismaeoopi/jrcruz-site',
      liveUrl: 'https://ismaeoopi.github.io/jrcruz-site/',
      summary: 'Site institucional corporativo responsivo de alta performance com design moderno e deploy automatizado no GitHub Pages.',
      problem: 'Necessidade de um canal digital profissional para apresentar serviços e soluções da empresa com alta velocidade de carregamento e adaptação mobile.',
      solution: 'Construção frontend com HTML5 semântico, arquitetura CSS3 moderna, JavaScript limpo e configuração de publicação contínua no GitHub Pages.',
      impact: 'Tempo de carregamento abaixo de 1 segundo, nota máxima em SEO e boas práticas, layout fluido em todos os dispositivos.',
      techs: ['HTML5 Semântico', 'CSS3 Moderno', 'JavaScript Vanilla', 'GitHub Pages', 'SEO', 'Mobile First'],
      codeSnippet: `<!-- Estrutura moderna responsiva com deploy no GitHub Pages -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="JR Cruz - Soluções Corporativas">
  <title>JR Cruz | Excelência e Qualidade</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Seções institucionais de alto impacto e formulários de contato -->
</body>
</html>`
    }
  };

  // Modal elements
  const modalBackdrop = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalProblem = document.getElementById('modal-problem');
  const modalSolution = document.getElementById('modal-solution');
  const modalImpact = document.getElementById('modal-impact');
  const modalTechs = document.getElementById('modal-techs');
  const modalCode = document.getElementById('modal-code');
  const modalRepoLink = document.getElementById('modal-repo-link');
  const modalTelemetryContainer = document.getElementById('modal-telemetry-container');
  const modalTelemetryContent = document.getElementById('modal-telemetry-content');

  function openModal(projectId) {
    const data = projectsData[projectId];
    if (!data || !modalBackdrop) return;

    modalTitle.textContent = data.title;
    modalBadge.textContent = data.badge;
    modalProblem.textContent = data.problem;
    modalSolution.textContent = data.solution;
    modalImpact.textContent = data.impact;
    modalCode.textContent = data.codeSnippet;

    modalTechs.innerHTML = data.techs.map(t => `<span class="tech-badge">${t}</span>`).join('');

    // Painel de Telemetria no Modal
    if (modalTelemetryContainer && modalTelemetryContent) {
      if (data.telemetry) {
        modalTelemetryContainer.style.display = 'block';
        modalTelemetryContent.innerHTML = `
          <h5>
            <span class="pulse-dot"></span>
            <span>Métricas de Telemetria em Produção (Início: ${data.telemetry.startDate})</span>
          </h5>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${data.telemetry.impactDesc}
          </p>
          <div class="modal-telemetry-grid">
            <div class="modal-telemetry-item">
              <span>REGRA DE CÁLCULO</span>
              <strong style="color: var(--accent-cyan); font-size: 0.82rem;">${data.telemetry.formula}</strong>
            </div>
            <div class="modal-telemetry-item">
              <span>ECONOMIA POR DIA ÚTIL</span>
              <strong>${data.telemetry.dailySavings}</strong>
            </div>
            <div class="modal-telemetry-item" style="grid-column: 1 / -1;">
              <span>BENCHMARK ACUMULADO EM DIAS ÚTEIS</span>
              <strong>${data.telemetry.benchmark}</strong>
            </div>
          </div>
        `;
      } else {
        modalTelemetryContainer.style.display = 'none';
        modalTelemetryContent.innerHTML = '';
      }
    }

    if (modalRepoLink) {
      modalRepoLink.href = data.repoUrl;
      const cleanUrl = data.repoUrl.replace('https://', '').replace(/\/$/, '');
      modalRepoLink.textContent = `Acessar ${cleanUrl}`;
    }

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.open-modal-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 6. Copiar E-mail com Toast Notification
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const toastMsg = document.getElementById('toast-msg');

  function showToast(message) {
    if (!toastMsg) return;
    toastMsg.querySelector('.toast-text').textContent = message;
    toastMsg.classList.add('show');
    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3500);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.getAttribute('data-email') || 'imlbta@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`E-mail ${email} copiado para a área de transferência!`);
      }).catch(() => {
        showToast(`E-mail: ${email}`);
      });
    });
  }

  // 7. Formulário de Contato
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `
        <svg class="floating-element" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Enviando mensagem...
      `;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = `✓ Mensagem enviada com sucesso!`;
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        showToast('Mensagem enviada com sucesso! Retornarei em breve.');
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 4000);
      }, 1000);
    });
  }
});
