import './index.css';

const assignments = [
  { id: 'conversion', number: '01', label: 'Unit Conversion', shortLabel: 'Convert' },
  { id: 'tax', number: '02', label: 'Income Tax', shortLabel: 'Tax' },
  { id: 'loops', number: '03', label: 'Natural Numbers', shortLabel: 'Loops' },
  { id: 'payroll', number: '04', label: 'Simple Payroll', shortLabel: 'Payroll' },
];

const state = {
  active: 'conversion',
  sideTab: 'guide',
  conversion: { type: 'temperature', direction: 'forward', input: '25' },
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
    message: '',
  },
};

const guideContent = {
  conversion: {
    label: 'Conversion guide',
    title: 'Four directions',
    lines: ['Celsius to Fahrenheit', 'Fahrenheit to Celsius', 'Meters to feet', 'Feet to meters'],
  },
  tax: {
    label: 'Calculation guide',
    title: 'Graduated rates',
    lines: ['₱250,000 and below · 0%', '₱250K–₱400K · 20%', '₱400K–₱800K · 25%', 'Top marginal rate · 35%'],
  },
  loops: {
    label: 'Loop guide',
    title: 'Required syntax',
    lines: ['Factorial · while loop', 'Sum · do while loop', 'Average · for loop', 'Natural numbers · 1 to N'],
  },
  payroll: {
    label: 'Payroll guide',
    title: 'Automatic totals',
    lines: ['Gross = days × daily rate', 'Net = gross − deduction', 'Every row gets a line number', 'Delete records by line number'],
  },
};

const root = document.getElementById('root');

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

function renderConversion() {
  const { type, direction, input } = state.conversion;
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

  const fromUnit = type === 'temperature' ? (direction === 'forward' ? 'Celsius' : 'Fahrenheit') : direction === 'forward' ? 'Meters' : 'Feet';
  const toUnit = type === 'temperature' ? (direction === 'forward' ? 'Fahrenheit' : 'Celsius') : direction === 'forward' ? 'Feet' : 'Meters';
  const fromSymbol = type === 'temperature' ? (direction === 'forward' ? '°C' : '°F') : direction === 'forward' ? 'm' : 'ft';
  const toSymbol = type === 'temperature' ? (direction === 'forward' ? '°F' : '°C') : direction === 'forward' ? 'ft' : 'm';

  return `
    <section class="assignment-shell">
      <header class="assignment-header">
        <div>
          <span class="eyebrow">Assignment one</span>
          <h1>Unit conversion</h1>
          <p>Convert temperature and distance values with precise, instant results.</p>
        </div>
        <div class="assignment-number">01</div>
      </header>
      <div class="workspace">
        <div class="segmented" aria-label="Conversion category">
          <button type="button" class="${type === 'temperature' ? 'active' : ''}" data-conversion-type="temperature">Temperature</button>
          <button type="button" class="${type === 'length' ? 'active' : ''}" data-conversion-type="length">Distance</button>
        </div>

        <div class="conversion-grid">
          <div class="field-panel">
            <label for="convert-input">${fromUnit}</label>
            <div class="number-input">
              <input id="convert-input" type="number" value="${input}" data-conversion-input="true" placeholder="Enter a value" />
              <span>${fromSymbol}</span>
            </div>
          </div>

          <button type="button" class="swap-button" aria-label="Switch to ${toUnit} to ${fromUnit}" data-conversion-swap="true">⇄</button>

          <div class="field-panel result-panel">
            <span class="field-label">${toUnit}</span>
            <div class="number-input result-value">
              <strong>${result === null ? '—' : formatNumber(result, 4)}</strong>
              <span>${toSymbol}</span>
            </div>
          </div>
        </div>
        <p class="formula">${type === 'temperature' ? (direction === 'forward' ? 'Formula: (°C × 9/5) + 32' : 'Formula: (°F − 32) × 5/9') : direction === 'forward' ? 'Formula: meters × 3.28084' : 'Formula: feet ÷ 3.28084'}</p>
      </div>
    </section>
  `;
}

function renderTax() {
  const numericIncome = Math.max(0, Number(state.tax.income) || 0);
  const calculation = calculateTax(numericIncome);
  const netIncome = numericIncome - calculation.tax;

  return `
    <section class="assignment-shell">
      <header class="assignment-header">
        <div>
          <span class="eyebrow">Assignment two</span>
          <h1>Income tax calculator</h1>
          <p>Compute annual Philippine income tax using the provided graduated tax table.</p>
        </div>
        <div class="assignment-number">02</div>
      </header>
      <div class="workspace">
        <div class="tax-layout">
          <div>
            <label class="input-label" for="taxable-income">Annual taxable income</label>
            <div class="currency-input">
              <span>₱</span>
              <input id="taxable-income" type="number" min="0" value="${state.tax.income}" data-tax-income="true" placeholder="0.00" />
            </div>
            <p class="helper">Enter your net taxable income for the year.</p>

            <div class="tax-summary">
              <div>
                <span>Income tax due</span>
                <strong>${formatCurrency(calculation.tax)}</strong>
              </div>
              <div>
                <span>After-tax income</span>
                <strong>${formatCurrency(netIncome)}</strong>
              </div>
            </div>

            <div class="calculation-note">
              <span>How it was calculated</span>
              <p>${calculation.rate === 0 ? 'Income does not exceed ₱250,000, so no income tax is due.' : `${formatCurrency(calculation.base)} base tax + ${calculation.rate}% of ${formatCurrency(calculation.excess)} excess over ${formatCurrency(calculation.threshold)}.`}</p>
            </div>
          </div>

          <div class="bracket-card">
            <div class="card-heading">
              <span>Tax guide</span>
              <small>Annual income</small>
            </div>
            ${[
              ['₱0 – ₱250K', '0%'],
              ['₱250K – ₱400K', '20%'],
              ['₱400K – ₱800K', '25%'],
              ['₱800K – ₱2M', '30%'],
              ['₱2M – ₱8M', '32%'],
              ['Over ₱8M', '35%'],
            ]
              .map(
                ([range, rate]) => `
                  <div class="bracket-row">
                    <span>${range}</span>
                    <strong>${rate}</strong>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderLoops() {
  const parsed = Number(state.loops.input);
  const n = Number.isInteger(parsed) ? Math.min(170, Math.max(1, parsed)) : 0;
  const results = n ? computeNaturalNumbers(n) : null;

  return `
    <section class="assignment-shell">
      <header class="assignment-header">
        <div>
          <span class="eyebrow">Assignment three</span>
          <h1>Natural number lab</h1>
          <p>Explore the factorial, sum, and average of the first N natural numbers.</p>
        </div>
        <div class="assignment-number">03</div>
      </header>
      <div class="workspace">
        <div class="natural-input-row">
          <div>
            <label class="input-label" for="natural-number">Enter N</label>
            <div class="plain-input">
              <input id="natural-number" type="number" min="1" max="170" step="1" value="${state.loops.input}" data-loops-input="true" />
            </div>
          </div>
          <p>Use any whole number from 1 to 170.</p>
        </div>

        ${
          !results
            ? '<div class="validation-message">Please enter a whole number between 1 and 170.</div>'
            : `
              <div class="result-cards">
                <article>
                  <span class="method">While loop</span>
                  <h3>Factorial</h3>
                  <div class="big-result" title="${results.factorial.toString()}">${results.factorial.toString()}</div>
                  <p>${n}! multiplies every natural number from 1 to ${n}.</p>
                </article>
                <article>
                  <span class="method">Do while loop</span>
                  <h3>Sum</h3>
                  <div class="big-result">${formatNumber(results.sum, 0)}</div>
                  <p>The total when 1 through ${n} are added together.</p>
                </article>
                <article>
                  <span class="method">For loop</span>
                  <h3>Average</h3>
                  <div class="big-result">${formatNumber(results.average, 2)}</div>
                  <p>The arithmetic mean of the first ${n} natural numbers.</p>
                </article>
              </div>
            `
        }
      </div>
    </section>
  `;
}

function renderPayroll() {
  const payroll = state.payroll;
  const totalNetPay = payroll.employees.reduce(
    (total, entry) => total + entry.daysWorked * entry.dailyRate - entry.deduction,
    0,
  );

  return `
    <section class="assignment-shell">
      <header class="assignment-header">
        <div>
          <span class="eyebrow">Assignment four</span>
          <h1>Simple payroll</h1>
          <p>Add employees, calculate pay automatically, and remove records by line number.</p>
        </div>
        <div class="assignment-number">04</div>
      </header>
      <div class="workspace">
        <form class="payroll-form" id="payroll-form">
          <div class="payroll-fields">
            <label>
              <span>Employee name</span>
              <input value="${payroll.name}" data-payroll-name="true" placeholder="e.g. Alex Cruz" />
            </label>
            <label>
              <span>Days worked</span>
              <input type="number" min="0" step="0.5" value="${payroll.days}" data-payroll-days="true" placeholder="0" />
            </label>
            <label>
              <span>Daily rate</span>
              <input type="number" min="0" step="0.01" value="${payroll.rate}" data-payroll-rate="true" placeholder="₱ 0.00" />
            </label>
            <label>
              <span>Deduction</span>
              <input type="number" min="0" step="0.01" value="${payroll.deduction}" data-payroll-deduction="true" placeholder="₱ 0.00" />
            </label>
          </div>
          <button class="primary-button" type="submit">Add employee <span>＋</span></button>
        </form>

        ${payroll.message ? `<p class="status-message">${payroll.message}</p>` : ''}

        <div class="table-card">
          <div class="table-title">
            <div>
              <span>Payroll list</span>
              <small>${payroll.employees.length} employees</small>
            </div>
            <strong>${formatCurrency(totalNetPay)} total net</strong>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Employee</th>
                  <th>Days</th>
                  <th>Daily rate</th>
                  <th>Gross pay</th>
                  <th>Deduction</th>
                  <th>Net pay</th>
                </tr>
              </thead>
              <tbody>
                ${
                  payroll.employees.length === 0
                    ? '<tr><td class="empty-state" colspan="7"><span>No payroll entries yet</span>Add an employee above to begin your list.</td></tr>'
                    : payroll.employees
                        .map((employee, index) => {
                          const grossPay = employee.daysWorked * employee.dailyRate;
                          return `
                            <tr>
                              <td>${index + 1}</td>
                              <td class="employee-name">${employee.name}</td>
                              <td>${formatNumber(employee.daysWorked)}</td>
                              <td>${formatCurrency(employee.dailyRate)}</td>
                              <td>${formatCurrency(grossPay)}</td>
                              <td>${formatCurrency(employee.deduction)}</td>
                              <td class="net-pay">${formatCurrency(grossPay - employee.deduction)}</td>
                            </tr>
                          `;
                        })
                        .join('')
                }
              </tbody>
            </table>
          </div>
          <div class="delete-row">
            <label for="delete-line">Delete by line number</label>
            <input id="delete-line" type="number" min="1" value="${payroll.deleteLine}" data-payroll-delete="true" placeholder="No." />
            <button type="button" data-payroll-delete-button="true" ${payroll.employees.length ? '' : 'disabled'}>Delete</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAssignment() {
  if (state.active === 'conversion') return renderConversion();
  if (state.active === 'tax') return renderTax();
  if (state.active === 'loops') return renderLoops();
  return renderPayroll();
}

function renderApp() {
  const activeAssignment = assignments.find((assignment) => assignment.id === state.active);
  const activeInput = document.activeElement instanceof HTMLInputElement && root.contains(document.activeElement)
    ? document.activeElement
    : null;
  const activeInputId = activeInput?.id;

  root.innerHTML = `
    <div class="app-shell">
      <div class="calculator-console">
        <header class="topbar">
          <button type="button" class="brand" data-home-button="true" aria-label="Foxlab home">
            <img src="/assets/fox-logo-transparent.png" alt="" />
            <span>FOX<strong>LAB</strong></span>
          </button>

          <nav class="tool-tabs" aria-label="Assignments">
            ${assignments
              .map(
                (assignment) => `
                  <button type="button" class="${state.active === assignment.id ? 'active' : ''}" data-assignment="${assignment.id}">
                    <span>${assignment.number}</span>
                    <span class="nav-long">${assignment.label}</span>
                    <span class="nav-short">${assignment.shortLabel}</span>
                  </button>
                `,
              )
              .join('')}
          </nav>

          <div class="topbar-meta">
            <span>Assignment</span>
            <strong>${activeAssignment.number} / 04</strong>
          </div>
        </header>

        <div class="console-body">
          <main>${renderAssignment()}</main>

          <aside class="activity-panel">
            <div class="activity-tabs">
              <button type="button" class="${state.sideTab === 'guide' ? 'active' : ''}" data-side-tab="guide">Guide</button>
              <button type="button" class="${state.sideTab === 'rubric' ? 'active' : ''}" data-side-tab="rubric">Rubric</button>
            </div>

            ${
              state.sideTab === 'guide'
                ? `
                  <div class="activity-content">
                    <span class="activity-kicker">${guideContent[state.active].label}</span>
                    <h2>${guideContent[state.active].title}</h2>
                    <div class="activity-list">
                      ${guideContent[state.active].lines
                        .map(
                          (line, index) => `
                            <div>
                              <span>0${index + 1}</span>
                              <p>${line}</p>
                            </div>
                          `,
                        )
                        .join('')}
                    </div>
                  </div>
                `
                : `
                  <div class="activity-content">
                    <span class="activity-kicker">Grade composition</span>
                    <h2>Build it correctly.</h2>
                    <div class="score-block">
                      <div>
                        <span>Accuracy</span>
                        <strong>50%</strong>
                      </div>
                      <div>
                        <span>Code style</span>
                        <strong>50%</strong>
                      </div>
                    </div>
                    <p class="rubric-note">Overall styling and responsive behavior contribute 30% of the final project grade.</p>
                  </div>
                `
            }

            <footer class="activity-footer">
              <span>Interactive coursework</span>
              <span class="status-light"></span>
              <strong>Ready</strong>
            </footer>
          </aside>
        </div>
      </div>
    </div>
  `;

  bindEvents();
  if (activeInputId) document.getElementById(activeInputId)?.focus();
}

function bindEvents() {
  document.querySelectorAll('[data-assignment]').forEach((button) => {
    button.addEventListener('click', () => {
      state.active = button.dataset.assignment;
      renderApp();
    });
  });

  document.querySelector('[data-home-button]')?.addEventListener('click', () => {
    state.active = 'conversion';
    renderApp();
  });

  document.querySelectorAll('[data-side-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      state.sideTab = button.dataset.sideTab;
      renderApp();
    });
  });

  const conversionTypeButton = document.querySelectorAll('[data-conversion-type]');
  conversionTypeButton.forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.conversionType;
      state.conversion.type = type;
      state.conversion.direction = 'forward';
      renderApp();
    });
  });

  document.querySelector('[data-conversion-swap]')?.addEventListener('click', () => {
    state.conversion.direction = state.conversion.direction === 'forward' ? 'reverse' : 'forward';
    renderApp();
  });

  document.querySelector('[data-conversion-input]')?.addEventListener('input', (event) => {
    state.conversion.input = event.target.value;
    renderApp();
  });

  document.querySelector('[data-tax-income]')?.addEventListener('input', (event) => {
    state.tax.income = event.target.value;
    renderApp();
  });

  document.querySelector('[data-loops-input]')?.addEventListener('input', (event) => {
    state.loops.input = event.target.value;
    renderApp();
  });

  const payrollForm = document.getElementById('payroll-form');
  payrollForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = state.payroll.name.trim();
    const daysWorked = Number(state.payroll.days);
    const dailyRate = Number(state.payroll.rate);
    const deductionAmount = Number(state.payroll.deduction);

    if (!name || daysWorked <= 0 || dailyRate < 0 || deductionAmount < 0) {
      state.payroll.message = 'Complete all fields with valid, non-negative values.';
      renderApp();
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
    state.payroll.message = `${name} was added to the payroll.`;
    renderApp();
  });

  document.querySelector('[data-payroll-name]')?.addEventListener('input', (event) => {
    state.payroll.name = event.target.value;
  });

  document.querySelector('[data-payroll-days]')?.addEventListener('input', (event) => {
    state.payroll.days = event.target.value;
  });

  document.querySelector('[data-payroll-rate]')?.addEventListener('input', (event) => {
    state.payroll.rate = event.target.value;
  });

  document.querySelector('[data-payroll-deduction]')?.addEventListener('input', (event) => {
    state.payroll.deduction = event.target.value;
  });

  document.querySelector('[data-payroll-delete]')?.addEventListener('input', (event) => {
    state.payroll.deleteLine = event.target.value;
  });

  document.querySelector('[data-payroll-delete-button]')?.addEventListener('click', () => {
    const lineNumber = Number(state.payroll.deleteLine);
    if (lineNumber < 1 || lineNumber > state.payroll.employees.length) {
      state.payroll.message = 'That line number is not in the payroll list.';
      renderApp();
      return;
    }

    const removed = state.payroll.employees[lineNumber - 1];
    state.payroll.employees = state.payroll.employees.filter((_, index) => index !== lineNumber - 1);
    state.payroll.deleteLine = '';
    state.payroll.message = `${removed.name} was removed from the payroll.`;
    renderApp();
  });
}

renderApp();
