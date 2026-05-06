import { formatCurrency } from '../utils/calculations';

function Row({ label, value, isTotal = false, isIncome = false }) {
  return (
    <div className={`flex justify-between py-1.5 text-sm ${isTotal ? 'border-t border-slate-200 font-semibold pt-2 mt-1' : ''}`}>
      <span className={isIncome ? 'text-green-700' : 'text-slate-600'}>{label}</span>
      <span className={isTotal ? 'text-slate-800' : isIncome ? 'text-green-700' : 'text-slate-700'}>
        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(value))}/mo
      </span>
    </div>
  );
}

export default function ExpenseBreakdown({ result }) {
  if (!result) return null;
  const { breakdown, annualRentalIncome, annualExpenses } = result;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Year 1 Income</div>
        <Row label="Rental Income (eff.)" value={breakdown.rentalIncome} isIncome />
        <Row label="Net Monthly Income" value={annualRentalIncome / 12} isTotal isIncome />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Year 1 Expenses</div>
        <Row label="Mortgage (P&I)" value={breakdown.mortgage} />
        <Row label="Property Taxes" value={breakdown.taxes} />
        <Row label="Insurance" value={breakdown.insurance} />
        <Row label="HOA" value={breakdown.hoa} />
        <Row label="Maintenance" value={breakdown.maintenance} />
        <Row label="Property Mgmt" value={breakdown.mgmt} />
        <Row label="Total Monthly Expenses" value={annualExpenses / 12} isTotal />
      </div>
    </div>
  );
}
