import { FormEvent, useMemo, useState } from "react";

type AssignmentId = "conversion" | "tax" | "loops" | "payroll";

type PayrollEntry = {
  id: number;
  name: string;
  daysWorked: number;
  dailyRate: number;
  deduction: number;
};

const assignments: { id: AssignmentId; number: string; label: string; shortLabel: string }[] = [
  { id: "conversion", number: "01", label: "Unit Conversion", shortLabel: "Convert" },
  { id: "tax", number: "02", label: "Income Tax", shortLabel: "Tax" },
  { id: "loops", number: "03", label: "Natural Numbers", shortLabel: "Loops" },
  { id: "payroll", number: "04", label: "Simple Payroll", shortLabel: "Payroll" },
];

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-PH", { maximumFractionDigits }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

function Conversion() {
  const [type, setType] = useState<"temperature" | "length">("temperature");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");
  const [input, setInput] = useState("25");

  const value = Number(input);
  const valid = input.trim() !== "" && Number.isFinite(value);
  const result = valid
    ? type === "temperature"
      ? direction === "forward"
        ? (value * 9) / 5 + 32
        : ((value - 32) * 5) / 9
      : direction === "forward"
        ? value * 3.28084
        : value / 3.28084
    : null;

  const fromUnit =
    type === "temperature"
      ? direction === "forward"
        ? "Celsius"
        : "Fahrenheit"
      : direction === "forward"
        ? "Meters"
        : "Feet";
  const toUnit =
    type === "temperature"
      ? direction === "forward"
        ? "Fahrenheit"
        : "Celsius"
      : direction === "forward"
        ? "Feet"
        : "Meters";
  const fromSymbol =
    type === "temperature"
      ? direction === "forward"
        ? "°C"
        : "°F"
      : direction === "forward"
        ? "m"
        : "ft";
  const toSymbol =
    type === "temperature"
      ? direction === "forward"
        ? "°F"
        : "°C"
      : direction === "forward"
        ? "ft"
        : "m";

  return (
    <AssignmentShell
      number="01"
      eyebrow="Assignment one"
      title="Unit conversion"
      description="Convert temperature and distance values with precise, instant results."
    >
      <div className="segmented" aria-label="Conversion category">
        <button
          className={type === "temperature" ? "active" : ""}
          onClick={() => setType("temperature")}
        >
          Temperature
        </button>
        <button className={type === "length" ? "active" : ""} onClick={() => setType("length")}>
          Distance
        </button>
      </div>

      <div className="conversion-grid">
        <div className="field-panel">
          <label htmlFor="convert-input">{fromUnit}</label>
          <div className="number-input">
            <input
              id="convert-input"
              type="number"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Enter a value"
            />
            <span>{fromSymbol}</span>
          </div>
        </div>

        <button
          className="swap-button"
          aria-label={`Switch to ${toUnit} to ${fromUnit}`}
          onClick={() => setDirection((current) => (current === "forward" ? "reverse" : "forward"))}
        >
          ⇄
        </button>

        <div className="field-panel result-panel">
          <span className="field-label">{toUnit}</span>
          <div className="number-input result-value">
            <strong>{result === null ? "—" : formatNumber(result, 4)}</strong>
            <span>{toSymbol}</span>
          </div>
        </div>
      </div>
      <p className="formula">
        {type === "temperature"
          ? direction === "forward"
            ? "Formula: (°C × 9/5) + 32"
            : "Formula: (°F − 32) × 5/9"
          : direction === "forward"
            ? "Formula: meters × 3.28084"
            : "Formula: feet ÷ 3.28084"}
      </p>
    </AssignmentShell>
  );
}

function calculateTax(income: number) {
  if (income <= 250_000) return { tax: 0, base: 0, excess: 0, rate: 0, threshold: 0 };
  if (income <= 400_000)
    return {
      tax: (income - 250_000) * 0.2,
      base: 0,
      excess: income - 250_000,
      rate: 20,
      threshold: 250_000,
    };
  if (income <= 800_000)
    return {
      tax: 30_000 + (income - 400_000) * 0.25,
      base: 30_000,
      excess: income - 400_000,
      rate: 25,
      threshold: 400_000,
    };
  if (income <= 2_000_000)
    return {
      tax: 130_000 + (income - 800_000) * 0.3,
      base: 130_000,
      excess: income - 800_000,
      rate: 30,
      threshold: 800_000,
    };
  if (income <= 8_000_000)
    return {
      tax: 490_000 + (income - 2_000_000) * 0.32,
      base: 490_000,
      excess: income - 2_000_000,
      rate: 32,
      threshold: 2_000_000,
    };
  return {
    tax: 2_410_000 + (income - 8_000_000) * 0.35,
    base: 2_410_000,
    excess: income - 8_000_000,
    rate: 35,
    threshold: 8_000_000,
  };
}

function IncomeTax() {
  const [income, setIncome] = useState("520000");
  const numericIncome = Math.max(0, Number(income) || 0);
  const calculation = calculateTax(numericIncome);
  const netIncome = numericIncome - calculation.tax;

  return (
    <AssignmentShell
      number="02"
      eyebrow="Assignment two"
      title="Income tax calculator"
      description="Compute annual Philippine income tax using the provided graduated tax table."
    >
      <div className="tax-layout">
        <div>
          <label className="input-label" htmlFor="taxable-income">
            Annual taxable income
          </label>
          <div className="currency-input">
            <span>₱</span>
            <input
              id="taxable-income"
              type="number"
              min="0"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
              placeholder="0.00"
            />
          </div>
          <p className="helper">Enter your net taxable income for the year.</p>

          <div className="tax-summary">
            <div>
              <span>Income tax due</span>
              <strong>{formatCurrency(calculation.tax)}</strong>
            </div>
            <div>
              <span>After-tax income</span>
              <strong>{formatCurrency(netIncome)}</strong>
            </div>
          </div>

          <div className="calculation-note">
            <span>How it was calculated</span>
            <p>
              {calculation.rate === 0
                ? "Income does not exceed ₱250,000, so no income tax is due."
                : `${formatCurrency(calculation.base)} base tax + ${calculation.rate}% of ${formatCurrency(calculation.excess)} excess over ${formatCurrency(calculation.threshold)}.`}
            </p>
          </div>
        </div>

        <div className="bracket-card">
          <div className="card-heading">
            <span>Tax guide</span>
            <small>Annual income</small>
          </div>
          {[
            ["₱0 – ₱250K", "0%"],
            ["₱250K – ₱400K", "20%"],
            ["₱400K – ₱800K", "25%"],
            ["₱800K – ₱2M", "30%"],
            ["₱2M – ₱8M", "32%"],
            ["Over ₱8M", "35%"],
          ].map(([range, rate]) => (
            <div className="bracket-row" key={range}>
              <span>{range}</span>
              <strong>{rate}</strong>
            </div>
          ))}
        </div>
      </div>
    </AssignmentShell>
  );
}

function computeNaturalNumbers(n: number) {
  // Assignment requirement: factorial uses a while loop.
  let factorial = 1n;
  let factor = 1n;
  while (factor <= BigInt(n)) {
    factorial *= factor;
    factor++;
  }

  // Assignment requirement: sum uses a do...while loop.
  let sum = 0;
  let addend = 1;
  do {
    sum += addend;
    addend++;
  } while (addend <= n);

  // Assignment requirement: average uses a for loop.
  let averageTotal = 0;
  for (let number = 1; number <= n; number++) {
    averageTotal += number;
  }

  return { factorial, sum, average: averageTotal / n };
}

function NaturalNumbers() {
  const [input, setInput] = useState("5");
  const parsed = Number(input);
  const n = Number.isInteger(parsed) ? Math.min(170, Math.max(1, parsed)) : 0;
  const results = n ? computeNaturalNumbers(n) : null;

  return (
    <AssignmentShell
      number="03"
      eyebrow="Assignment three"
      title="Natural number lab"
      description="Explore the factorial, sum, and average of the first N natural numbers."
    >
      <div className="natural-input-row">
        <div>
          <label className="input-label" htmlFor="natural-number">
            Enter N
          </label>
          <div className="plain-input">
            <input
              id="natural-number"
              type="number"
              min="1"
              max="170"
              step="1"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </div>
        </div>
        <p>Use any whole number from 1 to 170.</p>
      </div>

      {!results ? (
        <div className="validation-message">Please enter a whole number between 1 and 170.</div>
      ) : (
        <div className="result-cards">
          <article>
            <span className="method">While loop</span>
            <h3>Factorial</h3>
            <div className="big-result" title={results.factorial.toString()}>
              {results.factorial.toString()}
            </div>
            <p>
              {n}! multiplies every natural number from 1 to {n}.
            </p>
          </article>
          <article>
            <span className="method">Do while loop</span>
            <h3>Sum</h3>
            <div className="big-result">{formatNumber(results.sum, 0)}</div>
            <p>The total when 1 through {n} are added together.</p>
          </article>
          <article>
            <span className="method">For loop</span>
            <h3>Average</h3>
            <div className="big-result">{formatNumber(results.average, 2)}</div>
            <p>The arithmetic mean of the first {n} natural numbers.</p>
          </article>
        </div>
      )}
    </AssignmentShell>
  );
}

function Payroll() {
  const [employees, setEmployees] = useState<PayrollEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [name, setName] = useState("");
  const [days, setDays] = useState("");
  const [rate, setRate] = useState("");
  const [deduction, setDeduction] = useState("");
  const [deleteLine, setDeleteLine] = useState("");
  const [message, setMessage] = useState("");

  const totalNetPay = useMemo(
    () =>
      employees.reduce(
        (total, entry) => total + entry.daysWorked * entry.dailyRate - entry.deduction,
        0,
      ),
    [employees],
  );

  function addEmployee(event: FormEvent) {
    event.preventDefault();
    const daysWorked = Number(days);
    const dailyRate = Number(rate);
    const deductionAmount = Number(deduction);
    if (!name.trim() || daysWorked <= 0 || dailyRate < 0 || deductionAmount < 0) {
      setMessage("Complete all fields with valid, non-negative values.");
      return;
    }
    setEmployees((current) => [
      ...current,
      { id: nextId, name: name.trim(), daysWorked, dailyRate, deduction: deductionAmount },
    ]);
    setNextId((current) => current + 1);
    setName("");
    setDays("");
    setRate("");
    setDeduction("");
    setMessage(`${name.trim()} was added to the payroll.`);
  }

  function deleteEmployee(lineNumber: number) {
    if (lineNumber < 1 || lineNumber > employees.length) {
      setMessage("That line number is not in the payroll list.");
      return;
    }
    const removed = employees[lineNumber - 1];
    setEmployees((current) => current.filter((_, index) => index !== lineNumber - 1));
    setDeleteLine("");
    setMessage(`${removed.name} was removed from the payroll.`);
  }

  return (
    <AssignmentShell
      number="04"
      eyebrow="Assignment four"
      title="Simple payroll"
      description="Add employees, calculate pay automatically, and remove records by line number."
    >
      <form className="payroll-form" onSubmit={addEmployee}>
        <div className="payroll-fields">
          <label>
            <span>Employee name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Alex Cruz"
            />
          </label>
          <label>
            <span>Days worked</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={days}
              onChange={(event) => setDays(event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <span>Daily rate</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
              placeholder="₱ 0.00"
            />
          </label>
          <label>
            <span>Deduction</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={deduction}
              onChange={(event) => setDeduction(event.target.value)}
              placeholder="₱ 0.00"
            />
          </label>
        </div>
        <button className="primary-button" type="submit">
          Add employee <span>＋</span>
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}

      <div className="table-card">
        <div className="table-title">
          <div>
            <span>Payroll list</span>
            <small>{employees.length} employees</small>
          </div>
          <strong>{formatCurrency(totalNetPay)} total net</strong>
        </div>
        <div className="table-scroll">
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
              {employees.length === 0 ? (
                <tr>
                  <td className="empty-state" colSpan={7}>
                    <span>No payroll entries yet</span>
                    Add an employee above to begin your list.
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => {
                  const grossPay = employee.daysWorked * employee.dailyRate;
                  return (
                    <tr key={employee.id}>
                      <td>{index + 1}</td>
                      <td className="employee-name">{employee.name}</td>
                      <td>{formatNumber(employee.daysWorked)}</td>
                      <td>{formatCurrency(employee.dailyRate)}</td>
                      <td>{formatCurrency(grossPay)}</td>
                      <td>{formatCurrency(employee.deduction)}</td>
                      <td className="net-pay">{formatCurrency(grossPay - employee.deduction)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="delete-row">
          <label htmlFor="delete-line">Delete by line number</label>
          <input
            id="delete-line"
            type="number"
            min="1"
            value={deleteLine}
            onChange={(event) => setDeleteLine(event.target.value)}
            placeholder="No."
          />
          <button
            type="button"
            onClick={() => deleteEmployee(Number(deleteLine))}
            disabled={!employees.length}
          >
            Delete
          </button>
        </div>
      </div>
    </AssignmentShell>
  );
}

function AssignmentShell({
  number,
  eyebrow,
  title,
  description,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="assignment-shell">
      <header className="assignment-header">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="assignment-number">{number}</div>
      </header>
      <div className="workspace">{children}</div>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState<AssignmentId>("conversion");
  const [sideTab, setSideTab] = useState<"guide" | "rubric">("guide");
  const activeAssignment = assignments.find((assignment) => assignment.id === active)!;
  const guideContent: Record<AssignmentId, { label: string; title: string; lines: string[] }> = {
    conversion: {
      label: "Conversion guide",
      title: "Four directions",
      lines: ["Celsius to Fahrenheit", "Fahrenheit to Celsius", "Meters to feet", "Feet to meters"],
    },
    tax: {
      label: "Calculation guide",
      title: "Graduated rates",
      lines: [
        "₱250,000 and below · 0%",
        "₱250K–₱400K · 20%",
        "₱400K–₱800K · 25%",
        "Top marginal rate · 35%",
      ],
    },
    loops: {
      label: "Loop guide",
      title: "Required syntax",
      lines: [
        "Factorial · while loop",
        "Sum · do while loop",
        "Average · for loop",
        "Natural numbers · 1 to N",
      ],
    },
    payroll: {
      label: "Payroll guide",
      title: "Automatic totals",
      lines: [
        "Gross = days × daily rate",
        "Net = gross − deduction",
        "Every row gets a line number",
        "Delete records by line number",
      ],
    },
  };

  return (
    <div className="app-shell">
      <div className="calculator-console">
        <header className="topbar">
          <button
            className="brand"
            onClick={() => setActive("conversion")}
            aria-label="Foxlab home"
          >
            <img src="/assets/fox-logo.png" alt="" />
            <span>
              FOX<strong>LAB</strong>
            </span>
          </button>

          <nav className="tool-tabs" aria-label="Assignments">
            {assignments.map((assignment) => (
              <button
                key={assignment.id}
                className={active === assignment.id ? "active" : ""}
                onClick={() => setActive(assignment.id)}
              >
                <span>{assignment.number}</span>
                <span className="nav-long">{assignment.label}</span>
                <span className="nav-short">{assignment.shortLabel}</span>
              </button>
            ))}
          </nav>

          <div className="topbar-meta">
            <span>Assignment</span>
            <strong>{activeAssignment.number} / 04</strong>
          </div>
        </header>

        <div className="console-body">
          <main>
            {active === "conversion" && <Conversion />}
            {active === "tax" && <IncomeTax />}
            {active === "loops" && <NaturalNumbers />}
            {active === "payroll" && <Payroll />}
          </main>

          <aside className="activity-panel">
            <div className="activity-tabs">
              <button
                className={sideTab === "guide" ? "active" : ""}
                onClick={() => setSideTab("guide")}
              >
                Guide
              </button>
              <button
                className={sideTab === "rubric" ? "active" : ""}
                onClick={() => setSideTab("rubric")}
              >
                Rubric
              </button>
            </div>

            {sideTab === "guide" ? (
              <div className="activity-content">
                <span className="activity-kicker">{guideContent[active].label}</span>
                <h2>{guideContent[active].title}</h2>
                <div className="activity-list">
                  {guideContent[active].lines.map((line, index) => (
                    <div key={line}>
                      <span>0{index + 1}</span>
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="activity-content">
                <span className="activity-kicker">Grade composition</span>
                <h2>Build it correctly.</h2>
                <div className="score-block">
                  <div>
                    <span>Accuracy</span>
                    <strong>50%</strong>
                  </div>
                  <div>
                    <span>Code style</span>
                    <strong>50%</strong>
                  </div>
                </div>
                <p className="rubric-note">
                  Overall styling and responsive behavior contribute 30% of the final project grade.
                </p>
              </div>
            )}

            <footer className="activity-footer">
              <span>Interactive coursework</span>
              <span className="status-light" />
              <strong>Ready</strong>
            </footer>
          </aside>
        </div>
      </div>
    </div>
  );
}
