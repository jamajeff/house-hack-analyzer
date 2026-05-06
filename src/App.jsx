import { useState, useEffect } from 'react';
import PropertyForm from './components/PropertyForm';
import SummaryCards from './components/SummaryCards';
import CashFlowTable from './components/CashFlowTable';
import { CashFlowChart, EquityChart } from './components/Charts';
import ExpenseBreakdown from './components/ExpenseBreakdown';
import { runAnalysis } from './utils/calculations';
import { saveToUrl, loadFromUrl } from './utils/urlState';

const DEFAULT_CONFIG = {
  zillowUrl: '',
  purchasePrice: 450000,
  downPct: 20,
  interestRate: 7.0,
  loanTerm: 30,
  annualTaxes: 5400,
  annualInsurance: 1800,
  monthlyHOA: 0,
  alternativeMonthlyRent: 2000,
  unitCount: 2,
  units: [
    { rent: 1800, isOwnerUnit: true, label: 'Unit 1' },
    { rent: 1800, isOwnerUnit: false, label: 'Unit 2' },
  ],
  vacancyRate: 5,
  maintenancePct: 1,
  mgmtFeePct: 0,
  rentGrowthRate: 3,
  appreciationRate: 3,
  analysisPeriod: 12,
};

export default function App() {
  const [config, setConfig] = useState(() => {
    const fromUrl = loadFromUrl();
    return fromUrl || DEFAULT_CONFIG;
  });
  const [activeTab, setActiveTab] = useState('summary');
  const [copied, setCopied] = useState(false);

  const { results, stabilizationYear } = runAnalysis(config, config.analysisPeriod);

  useEffect(() => {
    const timer = setTimeout(() => saveToUrl(config), 300);
    return () => clearTimeout(timer);
  }, [config]);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    window.history.replaceState(null, '', window.location.pathname);
  }

  const tabs = [
    { id: 'summary', label: '📊 Summary' },
    { id: 'table', label: '📋 Year-by-Year' },
    { id: 'charts', label: '📈 Charts' },
    { id: 'breakdown', label: '💡 Breakdown' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              🏘️ House Hack Analyzer
            </h1>
            <p className="text-sm text-slate-500">Multi-family investment analysis tool</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {copied ? '✓ Copied!' : '🔗 Share Analysis'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          <aside className="flex flex-col gap-4">
            <PropertyForm config={config} onChange={setConfig} />
          </aside>

          <div className="flex flex-col gap-4">
            {stabilizationYear ? (
              <div className="bg-green-600 text-white rounded-xl px-5 py-4">
                <div className="font-bold text-lg">
                  ✅ Stabilization Point: Year {stabilizationYear}
                </div>
                <div className="text-green-100 text-sm mt-0.5">
                  Move out of your unit in Year {stabilizationYear} — the property generates positive cash flow on its own. After that, buy your next house hack.
                </div>
              </div>
            ) : (
              <div className="bg-amber-500 text-white rounded-xl px-5 py-4">
                <div className="font-bold text-lg">
                  ⚠️ Not Cash Flowing Within {config.analysisPeriod} Years
                </div>
                <div className="text-amber-100 text-sm mt-0.5">
                  Try increasing rents, reducing purchase price, larger down payment, or extending the analysis period.
                </div>
              </div>
            )}

            <SummaryCards results={results} stabilizationYear={stabilizationYear} config={config} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'summary' && (
                  <HowItWorksPanel config={config} stabilizationYear={stabilizationYear} results={results} />
                )}
                {activeTab === 'table' && (
                  <CashFlowTable results={results} stabilizationYear={stabilizationYear} />
                )}
                {activeTab === 'charts' && (
                  <div className="flex flex-col gap-8">
                    <CashFlowChart results={results} stabilizationYear={stabilizationYear} />
                    <EquityChart results={results} />
                  </div>
                )}
                {activeTab === 'breakdown' && (
                  <ExpenseBreakdown result={results[0]} />
                )}
              </div>
            </div>

            {config.zillowUrl && (
              <div className="text-sm text-slate-500 flex items-center gap-2">
                <span>📎 Zillow listing:</span>
                <a
                  href={config.zillowUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate max-w-xs"
                >
                  {config.zillowUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-slate-400 mt-4 border-t border-slate-200">
        For informational purposes only. Not financial advice. Always consult a professional before investing.
      </footer>
    </div>
  );
}

function HowItWorksPanel({ config, stabilizationYear, results }) {
  const year1 = results[0];
  const ownerUnit = config.units.find(u => u.isOwnerUnit);
  const rentalUnits = config.units.filter(u => !u.isOwnerUnit);
  const ownerIdx = config.units.findIndex(u => u.isOwnerUnit);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-semibold text-slate-800 mb-2">Your House Hack Strategy</h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>
            You buy a <strong>{config.unitCount}-unit property</strong> for{' '}
            <strong>${config.purchasePrice.toLocaleString()}</strong> with{' '}
            <strong>{config.downPct}% down (${Math.round(config.purchasePrice * config.downPct / 100).toLocaleString()})</strong>.
          </p>
          <p>
            You live in <strong>Unit {ownerIdx + 1}</strong> (market rent:{' '}
            <strong>${ownerUnit?.rent?.toLocaleString()}/mo</strong>), while renting out the other{' '}
            {rentalUnits.length} unit{rentalUnits.length > 1 ? 's' : ''} for a combined{' '}
            <strong>${rentalUnits.reduce((s, u) => s + u.rent, 0).toLocaleString()}/mo</strong>.
          </p>
          <p>
            Instead of paying <strong>${config.alternativeMonthlyRent.toLocaleString()}/mo</strong> to rent elsewhere, your
            effective housing cost in Year 1 is approximately{' '}
            <strong className={year1.monthlyTotalBenefit <= 0 ? 'text-blue-700' : 'text-green-700'}>
              ${Math.abs(Math.round(year1.monthlyTotalBenefit)).toLocaleString()}/mo
              {year1.monthlyTotalBenefit > 0 ? ' net income' : ' cost'}
            </strong>.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-800 mb-2">The Exit Strategy</h3>
        <ol className="text-sm text-slate-600 space-y-2 list-none">
          {[
            `Live in Unit ${ownerIdx + 1} and save money vs. paying $${config.alternativeMonthlyRent.toLocaleString()}/mo rent elsewhere`,
            `Build equity and let rents grow at ${config.rentGrowthRate}%/year`,
            stabilizationYear
              ? `In Year ${stabilizationYear}, move out — property cash flows $${Math.abs(Math.round(results[stabilizationYear - 1]?.fullyRented?.monthlyNetCashFlow ?? 0)).toLocaleString()}/mo positively`
              : 'Reach stabilization (adjust inputs — try higher rents or lower price)',
            'Rent out your former unit and use that cash flow to qualify for / save toward next property',
            'Repeat the cycle with the next house hack',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Key Assumptions</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
          <span>Vacancy rate: {config.vacancyRate}%</span>
          <span>Maintenance: {config.maintenancePct}% of value/yr</span>
          <span>Rent growth: {config.rentGrowthRate}%/yr</span>
          <span>Appreciation: {config.appreciationRate}%/yr</span>
          <span>Mgmt fee: {config.mgmtFeePct}%</span>
          <span>Interest rate: {config.interestRate}%</span>
        </div>
      </div>
    </div>
  );
}
