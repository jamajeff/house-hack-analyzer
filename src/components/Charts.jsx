import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

const fmt = v => {
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
};

const fmtTick = v => fmt(v);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold mb-1">Year {label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}/mo</span>
        </div>
      ))}
    </div>
  );
}

function EquityTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <div className="font-semibold mb-1">Year {label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.fill || p.color }}>●</span>
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CashFlowChart({ results, stabilizationYear }) {
  const data = results.map(r => ({
    year: r.year,
    'Living In (CF)': Math.round(r.monthlyNetCashFlow),
    'Moved Out (CF)': Math.round(r.fullyRented.monthlyNetCashFlow),
    'Living In (Total Benefit)': Math.round(r.monthlyTotalBenefit),
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Monthly Cash Flow Over Time</h4>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 12 }} />
          <YAxis tickFormatter={fmtTick} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" />
          {stabilizationYear && (
            <ReferenceLine
              x={stabilizationYear}
              stroke="#16a34a"
              strokeWidth={2}
              strokeDasharray="5 3"
              label={{ value: '★ Stabilized', position: 'top', fontSize: 11, fill: '#16a34a' }}
            />
          )}
          <Area type="monotone" dataKey="Moved Out (CF)" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
          <Area type="monotone" dataKey="Living In (CF)" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
          <Area type="monotone" dataKey="Living In (Total Benefit)" stroke="#8b5cf6" fill="#ede9fe" strokeWidth={2} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EquityChart({ results }) {
  const data = results.map(r => ({
    year: r.year,
    Equity: Math.round(r.equity),
    Balance: Math.round(r.remainingBalance),
  }));

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Equity vs. Loan Balance</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmtTick} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={60} />
          <Tooltip content={<EquityTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="Equity" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Balance" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
