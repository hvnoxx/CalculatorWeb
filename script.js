const state = {
  active: 'conversion',
  conversion: {
    temperature: { direction: 'forward', input: '25' },
    distance: { direction: 'forward', input: '1' },
  },
  tax: { income: '520000' },
  loops: { input: '5' },
  payroll: {
    employees: [],
    nextId: 1,
    name: '',
    days: '',
    rate: '',
    deduction: '',
    deleteLine: '',
  },
};

const payrollStorageKey = 'calculator-by-nick-payroll';
const root = document.querySelector('.calculator-console');

if (!root) {
  throw new Error('Calculator markup was not found.');
}

function formatNumber(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-PH', { maximumFractionDigits }).format(value);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);
}

function calculateTax(income) {
  if (income <= 250000) return { tax: 0, base: 0, excess: 0, rate: 0, threshold: 0 };
  if (income <= 400000) {
    return {
      tax: (income - 250000) * 0.2,
      base: 0,
      excess: income - 250000,
      rate: 20,
      threshold: 250000,
    };
  }
  if (income <= 800000) {
    return {
      tax: 30000 + (income - 400000) * 0.25,
      base: 30000,
      excess: income - 400000,
      rate: 25,
      threshold: 400000,
    };
  }
  if (income <= 2000000) {
    return {
      tax: 130000 + (income - 800000) * 0.3,
      base: 130000,
      excess: income - 800000,
      rate: 30,
      threshold: 800000,
    };
  }
  if (income <= 8000000) {
    return {
      tax: 490000 + (income - 2000000) * 0.32,
      base: 490000,
      excess: income - 2000000,
      rate: 32,
      threshold: 2000000,
    };
  }
  return {
    tax: 2410000 + (income - 8000000) * 0.35,
    base: 2410000,
    excess: income - 8000000,
    rate: 35,
    threshold: 8000000,
  };
}

function computeNaturalNumbers(n) {
  let factorial = 1n;
  let factor = 1n;
  while (factor <= BigInt(n)) {
    factorial *= factor;
    factor += 1n;
  }

  let sum = 0;
  let addend = 1;
  do {
    sum += addend;
    addend += 1;
  } while (addend <= n);

  let averageTotal = 0;
  for (let number = 1; number <= n; number += 1) {
    averageTotal += number;
  }

  return { factorial, sum, average: averageTotal / n };
}

function setActiveTool(toolId) {
  state.active = toolId;

  root.querySelectorAll('[data-tool-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.toolPanel !== toolId;
  });

  root.querySelectorAll('[data-tool]').forEach((button) => {
    const active = button.dataset.tool === toolId;
    button.classList.toggle('active', active);
    if (active) {
      button.setAttribute('aria-current', 'page');
    } else {
      button.removeAttribute('aria-current');
    }
  });

  const creatorTrigger = root.querySelector('[data-creator-trigger]');
  if (creatorTrigger) {
    creatorTrigger.classList.toggle('active', toolId === 'creator');
  }
}

function updateConversion() {
  ['temperature', 'distance'].forEach((type) => {
    const { direction, input } = state.conversion[type];
    const value = Number(input);
    const valid = input.trim() !== '' && Number.isFinite(value);
    let result = null;

    if (valid) {
      if (type === 'temperature') {
        result = direction === 'forward' ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
      } else {
        result = direction === 'forward' ? value * 3.28084 : value / 3.28084;
      }
    }

    const fromUnit = type === 'temperature'
      ? (direction === 'forward' ? 'Celsius' : 'Fahrenheit')
      : (direction === 'forward' ? 'Meters' : 'Feet');
    const toUnit = type === 'temperature'
      ? (direction === 'forward' ? 'Fahrenheit' : 'Celsius')
      : (direction === 'forward' ? 'Feet' : 'Meters');
    const fromSymbol = type === 'temperature'
      ? (direction === 'forward' ? '°C' : '°F')
      : (direction === 'forward' ? 'm' : 'ft');
    const toSymbol = type === 'temperature'
      ? (direction === 'forward' ? '°F' : '°C')
      : (direction === 'forward' ? 'ft' : 'm');
    const formula = type === 'temperature'
      ? (direction === 'forward' ? 'Formula: (°C × 9/5) + 32' : 'Formula: (°F − 32) × 5/9')
      : (direction === 'forward' ? 'Formula: meters × 3.28084' : 'Formula: feet ÷ 3.28084');

    root.querySelector(`[data-conversion-from-label="${type}"]`).textContent = fromUnit;
    root.querySelector(`[data-conversion-to-label="${type}"]`).textContent = toUnit;
    root.querySelector(`[data-conversion-from-symbol="${type}"]`).textContent = fromSymbol;
    root.querySelector(`[data-conversion-to-symbol="${type}"]`).textContent = toSymbol;
    root.querySelector(`[data-conversion-result="${type}"]`).textContent = result === null ? '—' : formatNumber(result, 4);
    root.querySelector(`[data-conversion-formula="${type}"]`).textContent = formula;
    root.querySelector(`[data-conversion-swap="${type}"]`).setAttribute('aria-label', `Switch to ${toUnit} to ${fromUnit}`);
  });
}

function updateTax() {
  const numericIncome = Math.max(0, Number(state.tax.income) || 0);
  const calculation = calculateTax(numericIncome);
  const netIncome = numericIncome - calculation.tax;

  root.querySelector('[data-tax-due]').textContent = formatCurrency(calculation.tax);
  root.querySelector('[data-after-tax-income]').textContent = formatCurrency(netIncome);
  root.querySelector('[data-tax-calculation]').textContent =
    calculation.rate === 0
      ? 'Income does not exceed ₱250,000, so no income tax is due.'
      : `${formatCurrency(calculation.base)} base tax + ${calculation.rate}% of ${formatCurrency(calculation.excess)} excess over ${formatCurrency(calculation.threshold)}.`;
}

function updateLoops() {
  const parsed = Number(state.loops.input);
  const n = Number.isInteger(parsed) ? Math.min(170, Math.max(1, parsed)) : 0;
  const validation = root.querySelector('[data-loops-validation]');
  const resultsPanel = root.querySelector('[data-loops-results]');

  validation.hidden = n !== 0;
  resultsPanel.hidden = n === 0;
  if (!n) return;

  const results = computeNaturalNumbers(n);
  const factorial = results.factorial.toString();
  root.querySelector('[data-factorial-result]').textContent = factorial;
  root.querySelector('[data-factorial-result]').title = factorial;
  root.querySelector('[data-factorial-description]').textContent =
    `${n}! multiplies every natural number from 1 to ${n}.`;
  root.querySelector('[data-sum-result]').textContent = formatNumber(results.sum, 0);
  root.querySelector('[data-sum-description]').textContent =
    `The total when 1 through ${n} are added together.`;
  root.querySelector('[data-average-result]').textContent = formatNumber(results.average, 2);
  root.querySelector('[data-average-description]').textContent =
    `The arithmetic mean of the first ${n} natural numbers.`;
}

function createCell(value, className = '') {
  const cell = document.createElement('td');
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function updatePayroll() {
  const { employees } = state.payroll;
  const totalNetPay = employees.reduce(
    (total, entry) => total + entry.daysWorked * entry.dailyRate - entry.deduction,
    0,
  );
  const rows = root.querySelector('[data-payroll-rows]');

  root.querySelector('[data-employee-count]').textContent =
    `${employees.length} ${employees.length === 1 ? 'employee' : 'employees'}`;
  root.querySelector('[data-total-net-pay]').textContent = `${formatCurrency(totalNetPay)} total net`;
  root.querySelector('[data-payroll-delete-button]').disabled = employees.length === 0;
  rows.replaceChildren();

  if (employees.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    const emptyState = document.createElement('span');
    cell.className = 'empty-state';
    cell.colSpan = 7;
    emptyState.textContent = 'No payroll entries yet';
    cell.append(emptyState, 'Add an employee above to begin your list.');
    row.append(cell);
    rows.append(row);
    return;
  }

  employees.forEach((employee, index) => {
    const grossPay = employee.daysWorked * employee.dailyRate;
    const row = document.createElement('tr');
    row.append(
      createCell(index + 1),
      createCell(employee.name, 'employee-name'),
      createCell(formatNumber(employee.daysWorked)),
      createCell(formatCurrency(employee.dailyRate)),
      createCell(formatCurrency(grossPay)),
      createCell(formatCurrency(employee.deduction)),
      createCell(formatCurrency(grossPay - employee.deduction), 'net-pay'),
    );
    rows.append(row);
  });
}

function setPayrollMessage(message) {
  const status = root.querySelector('[data-payroll-message]');
  status.textContent = message;
  status.hidden = !message;
}

function loadPayroll() {
  let savedEmployees;

  try {
    savedEmployees = window.localStorage.getItem(payrollStorageKey);
  } catch {
    setPayrollMessage('Saved payroll records are unavailable in this browser.');
    return;
  }

  if (savedEmployees === null) return;

  let employees;
  try {
    employees = JSON.parse(savedEmployees);
  } catch {
    setPayrollMessage('Saved payroll records could not be read.');
    return;
  }

  const validEmployees =
    Array.isArray(employees) &&
    employees.every(
      (employee) =>
        employee &&
        Number.isInteger(employee.id) &&
        employee.id > 0 &&
        typeof employee.name === 'string' &&
        employee.name.trim() !== '' &&
        Number.isFinite(employee.daysWorked) &&
        employee.daysWorked > 0 &&
        Number.isFinite(employee.dailyRate) &&
        employee.dailyRate >= 0 &&
        Number.isFinite(employee.deduction) &&
        employee.deduction >= 0,
    );

  if (!validEmployees) {
    setPayrollMessage('Saved payroll records have invalid data and could not be loaded.');
    return;
  }

  state.payroll.employees = employees;
  state.payroll.nextId = employees.reduce(
    (nextId, employee) => Math.max(nextId, employee.id + 1),
    1,
  );
  if (employees.length > 0) {
    setPayrollMessage(`${employees.length} saved ${employees.length === 1 ? 'entry' : 'entries'} restored from this browser.`);
  }
}

function savePayroll() {
  try {
    window.localStorage.setItem(payrollStorageKey, JSON.stringify(state.payroll.employees));
    return true;
  } catch {
    setPayrollMessage('Payroll was updated, but could not be saved in this browser.');
    return false;
  }
}

root.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;

  const creatorTrigger = event.target.closest('[data-creator-trigger]');
  if (creatorTrigger) {
    setActiveTool('creator');
    creatorTrigger.classList.add('active');
    return;
  }

  const creatorTool = event.target.closest('[data-creator-tool]');
  if (creatorTool) {
    setActiveTool(creatorTool.dataset.creatorTool);
    return;
  }

  const toolButton = event.target.closest('[data-tool]');
  if (toolButton) {
    setActiveTool(toolButton.dataset.tool);
    return;
  }

  if (event.target.closest('[data-home-button]')) {
    setActiveTool('conversion');
    return;
  }

  const conversionSwapButton = event.target.closest('[data-conversion-swap]');
  if (conversionSwapButton) {
    const type = conversionSwapButton.dataset.conversionSwap;
    state.conversion[type].direction = state.conversion[type].direction === 'forward' ? 'reverse' : 'forward';
    updateConversion();
    return;
  }

  if (event.target.closest('[data-payroll-delete-button]')) {
    const lineNumber = Number(state.payroll.deleteLine);
    if (lineNumber < 1 || lineNumber > state.payroll.employees.length) {
      setPayrollMessage('That line number is not in the payroll list.');
      return;
    }

    const removed = state.payroll.employees[lineNumber - 1];
    state.payroll.employees = state.payroll.employees.filter((_, index) => index !== lineNumber - 1);
    state.payroll.deleteLine = '';
    root.querySelector('[data-payroll-delete]').value = '';
    updatePayroll();
    if (savePayroll()) setPayrollMessage(`${removed.name} was removed from the payroll.`);
  }
});

root.addEventListener('input', (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;

  if (event.target.dataset.conversionInput) {
    const type = event.target.dataset.conversionInput;
    state.conversion[type].input = event.target.value;
    updateConversion();
  } else if (event.target.matches('[data-tax-income]')) {
    state.tax.income = event.target.value;
    updateTax();
  } else if (event.target.matches('[data-loops-input]')) {
    state.loops.input = event.target.value;
    updateLoops();
  } else if (event.target.matches('[data-payroll-name]')) {
    state.payroll.name = event.target.value;
  } else if (event.target.matches('[data-payroll-days]')) {
    state.payroll.days = event.target.value;
  } else if (event.target.matches('[data-payroll-rate]')) {
    state.payroll.rate = event.target.value;
  } else if (event.target.matches('[data-payroll-deduction]')) {
    state.payroll.deduction = event.target.value;
  } else if (event.target.matches('[data-payroll-delete]')) {
    state.payroll.deleteLine = event.target.value;
  }
});

root.addEventListener('submit', (event) => {
  if (event.target.id !== 'payroll-form') return;
  event.preventDefault();

  const name = state.payroll.name.trim();
  const daysWorked = Number(state.payroll.days);
  const dailyRate = Number(state.payroll.rate);
  const deductionAmount = Number(state.payroll.deduction);

  if (!name || daysWorked <= 0 || dailyRate < 0 || deductionAmount < 0) {
    setPayrollMessage('Complete all fields with valid, non-negative values.');
    return;
  }

  state.payroll.employees.push({
    id: state.payroll.nextId,
    name,
    daysWorked,
    dailyRate,
    deduction: deductionAmount,
  });
  state.payroll.nextId += 1;
  state.payroll.name = '';
  state.payroll.days = '';
  state.payroll.rate = '';
  state.payroll.deduction = '';
  root.querySelector('[data-payroll-name]').value = '';
  root.querySelector('[data-payroll-days]').value = '';
  root.querySelector('[data-payroll-rate]').value = '';
  root.querySelector('[data-payroll-deduction]').value = '';
  updatePayroll();
  if (savePayroll()) setPayrollMessage(`${name} was added to the payroll.`);
});

loadPayroll();
setActiveTool(state.active);
updateConversion();
updateTax();
updateLoops();
updatePayroll();

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.active === 'creator') setActiveTool('conversion');
});
