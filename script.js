/* script.js - 1A NRG */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('estimator-form');
  const resultDiv = document.getElementById('estimator-result');

  if (!form || !resultDiv) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateSavings();
  });
});

function calculateSavings() {
  const roofSizeInput = document.getElementById('roof-size');
  const consumptionInput = document.getElementById('consumption');
  const regionInput = document.getElementById('region');
  const resultDiv = document.getElementById('estimator-result');
  const savingsValueEl = document.getElementById('savings-value');

  if (!roofSizeInput || !consumptionInput || !regionInput || !resultDiv || !savingsValueEl) return;

  const roofSize = parseFloat(roofSizeInput.value);
  const consumption = parseFloat(consumptionInput.value);
  const region = regionInput.value;

  if (isNaN(roofSize) || isNaN(consumption) || roofSize <= 0 || consumption <= 0) {
    alert("Bitte geben Sie gültige, positive Werte für Dachfläche und Stromverbrauch ein.");
    return;
  }

  // Assumptions for calculation
  const panelEfficiency = 0.20; // 20% efficiency
  const areaToKWp = 1 / 5; // roughly 5 m^2 per kWp

  // Regional solar yield factors (kWh per kWp per year)
  const yieldFactors = {
    'nord': 950,
    'mitte': 1000,
    'sued': 1050
  };

  const yieldFactor = yieldFactors[region] || 1000;

  // Calculate potential solar generation
  const kwp = roofSize * areaToKWp;
  const annualGeneration = kwp * yieldFactor;

  // Calculate self-consumption (simplified model)
  // Assume without battery, self-consumption is max 30% of generation or 100% of consumption, whichever is lower.
  // With basic setup, roughly 30% of consumption can be covered if generation is large enough.
  const selfConsumptionFraction = Math.min(0.30, consumption / annualGeneration);
  let coveredConsumption = annualGeneration * selfConsumptionFraction;

  // Cap at actual consumption
  if (coveredConsumption > consumption) {
    coveredConsumption = consumption;
  }

  // Savings in Euros (Assume 0.35 EUR / kWh electricity price)
  const electricityPrice = 0.35;
  let annualSavings = coveredConsumption * electricityPrice;

  // Add small feed-in tariff for remaining generation (e.g., 0.08 EUR / kWh)
  const feedInTariff = 0.08;
  const gridFeedIn = annualGeneration - coveredConsumption;
  annualSavings += gridFeedIn * feedInTariff;

  // Format result
  const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
  savingsValueEl.textContent = formatter.format(annualSavings);

  // Show result
  resultDiv.classList.add('active');

  // Focus the result area for accessibility
  resultDiv.setAttribute('tabindex', '-1');
  resultDiv.focus();
}
