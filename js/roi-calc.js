/**
 * SIMULADOR DE ROI / ECONOMIA DE AUTOMAÇÃO RPA
 * Calcula dinamicamente as horas recuperadas e economia anual
 */

document.addEventListener('DOMContentLoaded', () => {
  const teamSlider = document.getElementById('slider-team');
  const hoursSlider = document.getElementById('slider-hours');
  const rateSlider = document.getElementById('slider-rate');

  const teamDisplay = document.getElementById('val-team');
  const hoursDisplay = document.getElementById('val-hours');
  const rateDisplay = document.getElementById('val-rate');

  const resultSavings = document.getElementById('res-savings');
  const resultHours = document.getElementById('res-hours');
  const resultPayback = document.getElementById('res-payback');
  const resultRoiPercent = document.getElementById('res-roi-pct');

  if (!teamSlider || !hoursSlider || !rateSlider) return;

  function formatMoneyBRL(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(Math.round(value));
  }

  function calculateROI() {
    const team = parseInt(teamSlider.value, 10);
    const hours = parseInt(hoursSlider.value, 10);
    const rate = parseInt(rateSlider.value, 10);

    // Atualiza valores nas etiquetas
    teamDisplay.textContent = `${team} ${team === 1 ? 'pessoa' : 'pessoas'}`;
    hoursDisplay.textContent = `${hours}h / semana`;
    rateDisplay.textContent = `R$ ${rate} / hora`;

    // 50 semanas úteis no ano
    const totalManualHoursYear = team * hours * 50;
    const totalCostYear = totalManualHoursYear * rate;

    // Automação elimina 85% do trabalho manual repetitivo
    const automatedHoursSaved = totalManualHoursYear * 0.85;
    const annualSavings = totalCostYear * 0.85;

    // Payback estimado (semanas para o bot se pagar com base no volume)
    let paybackWeeks = Math.max(2, Math.round(18 / Math.sqrt(team * (hours / 10))));
    if (paybackWeeks > 12) paybackWeeks = 12;

    // ROI percentual estimado
    const roiMultiplier = Math.round((annualSavings / Math.max(15000, annualSavings * 0.15)) * 100);

    // Atualiza resultados no DOM com destaque
    if (resultSavings) resultSavings.textContent = formatMoneyBRL(annualSavings);
    if (resultHours) resultHours.textContent = `${formatNumber(automatedHoursSaved)} horas`;
    if (resultPayback) resultPayback.textContent = `~${paybackWeeks} semanas`;
    if (resultRoiPercent) resultRoiPercent.textContent = `+${formatNumber(roiMultiplier)}%`;
  }

  // Event Listeners para feedback em tempo real
  teamSlider.addEventListener('input', calculateROI);
  hoursSlider.addEventListener('input', calculateROI);
  rateSlider.addEventListener('input', calculateROI);

  // Executa o primeiro cálculo com valores padrão
  calculateROI();
});
