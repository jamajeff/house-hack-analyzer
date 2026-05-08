import InputField from './InputField';
import Section, { SectionFull } from './Section';

const UNIT_TYPES = [
  { value: 2, label: 'Duplex (2 units)' },
  { value: 3, label: 'Triplex (3 units)' },
  { value: 4, label: 'Quadplex (4 units)' },
];

export default function PropertyForm({ config, onChange, onZillowImport, zillowLoading, zillowError, zillowAddress }) {
  const { units } = config;

  function setField(key, value) {
    onChange({ ...config, [key]: value });
  }

  function setUnitCount(count) {
    const newUnits = Array.from({ length: count }, (_, i) => ({
      rent: units[i]?.rent ?? 1500,
      isOwnerUnit: i === 0,
      label: `Unit ${i + 1}`,
    }));
    onChange({ ...config, unitCount: count, units: newUnits });
  }

  function setUnitRent(idx, rent) {
    const newUnits = units.map((u, i) => (i === idx ? { ...u, rent } : u));
    onChange({ ...config, units: newUnits });
  }

  function setOwnerUnit(idx) {
    const newUnits = units.map((u, i) => ({ ...u, isOwnerUnit: i === idx }));
    onChange({ ...config, units: newUnits });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Zillow Import */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <h3 className="font-semibold text-slate-800 text-sm uppercase tracking-wide">Import from Zillow</h3>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={config.zillowUrl}
              onChange={e => setField('zillowUrl', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onZillowImport(config.zillowUrl)}
              placeholder="https://www.zillow.com/homedetails/..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
            />
            <button
              onClick={() => onZillowImport(config.zillowUrl)}
              disabled={zillowLoading || !config.zillowUrl}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
            >
              {zillowLoading ? '⏳ Loading...' : '⬇️ Import'}
            </button>
          </div>
          {zillowAddress && (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              ✅ Imported: {zillowAddress}
            </div>
          )}
          {zillowError && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ {zillowError}
            </div>
          )}
          <p className="text-xs text-slate-400">
            Imports price, taxes, HOA, and rent estimate. Fill in anything it misses below.
          </p>
        </div>
      </div>

      {/* Property Details */}
      <Section title="Property Details" icon="🏘️">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1">Property Type</label>
          <div className="flex gap-2 flex-wrap">
            {UNIT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setUnitCount(t.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  config.unitCount === t.value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <InputField
          label="Purchase Price"
          prefix="$"
          value={config.purchasePrice}
          onChange={v => setField('purchasePrice', v)}
          min={0}
          step={1000}
          placeholder="e.g. 450000"
        />
        <InputField
          label="Down Payment"
          suffix="%"
          value={config.downPct}
          onChange={v => setField('downPct', v)}
          min={3}
          max={100}
          step={0.5}
        />
        <InputField
          label="Interest Rate"
          suffix="%"
          value={config.interestRate}
          onChange={v => setField('interestRate', v)}
          min={0}
          max={20}
          step={0.125}
        />
        <InputField
          label="Loan Term"
          suffix="years"
          value={config.loanTerm}
          onChange={v => setField('loanTerm', v)}
          min={10}
          max={30}
          step={5}
        />
      </Section>

      {/* Operating Costs */}
      <Section title="Operating Costs" icon="💰">
        <InputField
          label="Annual Property Taxes"
          prefix="$"
          value={config.annualTaxes}
          onChange={v => setField('annualTaxes', v)}
          min={0}
          placeholder="e.g. 5400"
          hint="From Zillow listing or county assessor"
        />
        <InputField
          label="Annual Insurance"
          prefix="$"
          value={config.annualInsurance}
          onChange={v => setField('annualInsurance', v)}
          min={0}
          placeholder="e.g. 1800"
        />
        <InputField
          label="Monthly HOA"
          prefix="$"
          value={config.monthlyHOA}
          onChange={v => setField('monthlyHOA', v)}
          min={0}
          hint="Enter 0 if no HOA"
        />
        <InputField
          label="Your Current Monthly Rent"
          prefix="$"
          value={config.alternativeMonthlyRent}
          onChange={v => setField('alternativeMonthlyRent', v)}
          min={0}
          placeholder="e.g. 2000"
          hint="What you'd pay renting elsewhere (rent savings benefit)"
        />
      </Section>

      {/* Unit Rents */}
      <SectionFull title="Unit Rents & Owner Unit" icon="🏠">
        <div className="grid grid-cols-1 gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                unit.isOwnerUnit ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700">Unit {idx + 1}</span>
                  {unit.isOwnerUnit && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Your Unit
                    </span>
                  )}
                </div>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <span className="px-3 py-2 bg-slate-50 border-r border-slate-300 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={unit.rent}
                    onChange={e => setUnitRent(idx, Number(e.target.value))}
                    min={0}
                    className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                  />
                  <span className="px-3 py-2 bg-slate-50 border-l border-slate-300 text-slate-500 text-sm">/mo</span>
                </div>
              </div>
              <button
                onClick={() => setOwnerUnit(idx)}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${
                  unit.isOwnerUnit
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
                }`}
              >
                {unit.isOwnerUnit ? '✓ My Unit' : 'Set as Mine'}
              </button>
            </div>
          ))}
          <p className="text-xs text-slate-500">
            These are market rents. You can override Zillow's estimate with your own research (e.g., from Rentometer or local listings).
          </p>
        </div>
      </SectionFull>

      {/* Assumptions */}
      <Section title="Growth & Expense Assumptions" icon="📈">
        <InputField
          label="Vacancy Rate"
          suffix="%"
          value={config.vacancyRate}
          onChange={v => setField('vacancyRate', v)}
          min={0}
          max={50}
          step={0.5}
          hint="Typical: 5–8%"
        />
        <InputField
          label="Annual Maintenance"
          suffix="% of value"
          value={config.maintenancePct}
          onChange={v => setField('maintenancePct', v)}
          min={0}
          max={5}
          step={0.1}
          hint="Typical: 1–1.5%"
        />
        <InputField
          label="Property Mgmt Fee"
          suffix="%"
          value={config.mgmtFeePct}
          onChange={v => setField('mgmtFeePct', v)}
          min={0}
          max={20}
          hint="0% if self-managed"
        />
        <InputField
          label="Annual Rent Growth"
          suffix="%"
          value={config.rentGrowthRate}
          onChange={v => setField('rentGrowthRate', v)}
          min={0}
          max={10}
          step={0.5}
          hint="Typical: 2–4%"
        />
        <InputField
          label="Annual Appreciation"
          suffix="%"
          value={config.appreciationRate}
          onChange={v => setField('appreciationRate', v)}
          min={0}
          max={15}
          step={0.5}
          hint="Historical avg: 3–4%"
        />
        <InputField
          label="Analysis Period"
          suffix="years"
          value={config.analysisPeriod}
          onChange={v => setField('analysisPeriod', v)}
          min={5}
          max={30}
          step={1}
        />
      </Section>
    </div>
  );
}
