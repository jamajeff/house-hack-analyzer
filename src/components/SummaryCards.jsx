import { formatCurrency } from '../utils/calculations';

function Card({ label, value, sub, color = 'blue', large = false }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className={`font-bold ${large ? 'text-3xl' : 'text-2xl'}`}>{value}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

export default function SummaryCards({ results, stabilizationYear, config }) {
  if (!results || results.length === 0) return null;

  const downPayment = config.purchasePrice * (config.downPct / 100);
  const closingCosts = config.purchasePrice * 0.03; // estimate 3%
  const totalCashIn = downPayment + closingCosts;

  const year1 = results[0];
  const year5 = results[Math.min(4, results.length - 1)];
  const lastYear = results[results.length - 1];

  const fullyRentedYear1 = year1.fullyRented;

  const stabilizedCashFlow = stabilizationYear
    ? results[stabilizationYear - 1]?.fullyRented?.monthlyNetCashFlow
    : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card
        label="Break-Even Year"
        value={stabilizationYear ? `Year ${stabilizationYear}` : 'Beyond range'}
        sub={
          stabilizationYear
            ? `Move out in Year ${stabilizationYear} → positive cash flow`
            : 'Adjust rents or expenses'
        }
        color={stabilizationYear && stabilizationYear <= 5 ? 'green' : stabilizationYear ? 'amber' : 'red'}
        large
      />
      <Card
        label="Stabilized Monthly CF"
        value={stabilizedCashFlow != null ? formatCurrency(stabilizedCashFlow, true) : '—'}
        sub={stabilizationYear ? `Once you move out in Year ${stabilizationYear}` : 'Not yet positive'}
        color={stabilizedCashFlow > 0 ? 'green' : 'red'}
      />
      <Card
        label="Year 1 Monthly Out-of-Pocket"
        value={formatCurrency(Math.abs(year1.monthlyNetCashFlow))}
        sub={year1.monthlyNetCashFlow < 0 ? 'Cost after rental income' : 'Net income'}
        color={year1.monthlyNetCashFlow >= 0 ? 'green' : 'blue'}
      />
      <Card
        label="Year 1 Effective Cost"
        value={formatCurrency(Math.abs(year1.monthlyTotalBenefit))}
        sub={
          year1.monthlyTotalBenefit <= 0
            ? `vs. ${formatCurrency(config.alternativeMonthlyRent)}/mo renting`
            : 'You\'re ahead vs renting!'
        }
        color={year1.monthlyTotalBenefit <= 0 ? 'purple' : 'green'}
      />
      <Card
        label={`Equity in Year ${lastYear.year}`}
        value={formatCurrency(lastYear.equity)}
        sub={`Property: ${formatCurrency(lastYear.propertyValue)}`}
        color="blue"
      />
      <Card
        label="Total Cash Required"
        value={formatCurrency(totalCashIn)}
        sub={`${formatCurrency(downPayment)} down + ~${formatCurrency(closingCosts)} closing`}
        color="amber"
      />
    </div>
  );
}
