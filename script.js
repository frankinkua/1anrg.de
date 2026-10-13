/* script.js - 1A NRG */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('estimator-form');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateInputs()) {
      calculateSavings();
    }
  });

  // Clear errors on input
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearError(input);
    });
  });
});

function validateInputs() {
  const roofSizeInput = document.getElementById('roof-size');
  const consumptionInput = document.getElementById('consumption');
  let isValid = true;

  if (!roofSizeInput.value || parseFloat(roofSizeInput.value) < 10) {
    showError(roofSizeInput, 'Bitte geben Sie eine Dachfläche von mindestens 10 m² ein.');
    isValid = false;
  }

  if (!consumptionInput.value || parseFloat(consumptionInput.value) < 1000) {
    showError(consumptionInput, 'Bitte geben Sie einen realistischen Jahresverbrauch (min. 1000 kWh) ein.');
    isValid = false;
  }

  return isValid;
}

function showError(inputElement, message) {
  const formGroup = inputElement.closest('.form-group');
  formGroup.classList.add('has-error');
  let errorEl = formGroup.querySelector('.error-msg');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-msg';
    formGroup.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.classList.add('active');
}

function clearError(inputElement) {
  const formGroup = inputElement.closest('.form-group');
  formGroup.classList.remove('has-error');
  const errorEl = formGroup.querySelector('.error-msg');
  if (errorEl) {
    errorEl.classList.remove('active');
  }
}

function calculateSavings() {
  const roofSize = parseFloat(document.getElementById('roof-size').value);
  const consumption = parseFloat(document.getElementById('consumption').value);
  const region = document.getElementById('region').value;
  const resultDiv = document.getElementById('estimator-result');

  // Assumptions
  const areaToKWp = 1 / 5; // 5 m^2 per kWp
  const costPerKWp = 1500; // rough cost estimate in EUR per kWp
  const yieldFactors = { 'nord': 900, 'mitte': 1000, 'sued': 1100 };
  const yieldFactor = yieldFactors[region] || 1000;
  const electricityPrice = 0.35; // EUR / kWh
  const feedInTariff = 0.08; // EUR / kWh
  const co2PerKWh = 0.4; // kg CO2 avoided per kWh (rough grid mix avg)

  // Calcs
  const kwp = roofSize * areaToKWp;
  const initialCost = kwp * costPerKWp;
  const annualGeneration = kwp * yieldFactor;

  // Basic self-consumption model (without battery) max 30% of gen or 100% of cons
  const selfConsumptionFraction = Math.min(0.30, consumption / annualGeneration);
  const coveredConsumption = Math.min(annualGeneration * selfConsumptionFraction, consumption);
  const gridFeedIn = annualGeneration - coveredConsumption;

  const savingsSelfCons = coveredConsumption * electricityPrice;
  const earningsFeedIn = gridFeedIn * feedInTariff;
  const totalAnnualBenefit = savingsSelfCons + earningsFeedIn;

  const paybackYears = initialCost / totalAnnualBenefit;
  const annualCo2 = annualGeneration * co2PerKWh;

  // Formatting
  const currencyFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const numberFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
  const floatFmt = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });

  // Update DOM
  document.getElementById('res-generation').textContent = numberFmt.format(annualGeneration) + ' kWh';
  document.getElementById('res-savings').textContent = currencyFmt.format(totalAnnualBenefit);
  document.getElementById('res-payback').textContent = floatFmt.format(paybackYears) + ' Jahre';
  document.getElementById('res-co2').textContent = numberFmt.format(annualCo2) + ' kg';

  resultDiv.classList.add('active');
  resultDiv.setAttribute('tabindex', '-1');
  resultDiv.focus();
}
