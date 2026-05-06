import { formatCurrency } from '../utils/calculations';

function Cell({ value, highlight, isCurrency = true }) {
  const formatted = isCurrency ? formatCurrency(value) : value;
  const isNeg = isCurrency && value < 0;
  const isPos = isCurrency && value > 0;
  return (
    <td
      className={`px-3 py-2 text-right text-sm tabular-nums whitespace-nowrap ${
        highlight ? 'font-bold' : ''
      } ${isNeg ? 'text-red-600' : isPos ? 'text-green-700' : 'text-slate-600'}`}
    >
      {formatted}
    </td>
  );
}

export default function CashFlowTable({ results, stabilizationYear }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide sticky left-0 bg-slate-50">Year</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Rental Income</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Expenses</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span className="text-blue-600">Living In</span> CF/mo
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span className="text-blue-600">Living In</span> +Rent Savings
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span className="text-green-600">Moved Out</span> CF/mo
            </th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Equity</th>
            <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Prop Value</th>
          </tr>
        </thead>
        <tbody>
          {results.map(row => {
            const isBreakEven = row.year === stabilizationYear;
            return (
              <tr
                key={row.year}
                className={`border-b border-slate-100 ${
                  isBreakEven ? 'bg-green-50 ring-1 ring-green-300' : row.year % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <td className={`px-3 py-2 text-sm font-medium sticky left-0 ${isBreakEven ? 'bg-green-50' : row.year % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                  <div className="flex items-center gap-1">
                    {isBreakEven && <span title="Stabilization year" className="text-green-600">★</span>}
                    Year {row.year}
                  </div>
                </td>
                <Cell value={row.annualRentalIncome / 12} />
                <Cell value={-row.annualExpenses / 12} />
                <Cell value={row.monthlyNetCashFlow} highlight={isBreakEven} />
                <Cell value={row.monthlyTotalBenefit} highlight={isBreakEven} />
                <Cell value={row.fullyRented.monthlyNetCashFlow} highlight={isBreakEven} />
                <Cell value={row.equity} />
                <Cell value={row.propertyValue} />
              </tr>
            );
          })}
        </tbody>
      </table>
      {stabilizationYear && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-200 text-xs text-green-700 flex items-center gap-1">
          <span>★</span>
          <span>Year {stabilizationYear} = stabilization point. Move out and the property cash flows positive.</span>
        </div>
      )}
    </div>
  );
}
