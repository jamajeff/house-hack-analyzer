export default function InputField({ label, value, onChange, type = 'number', prefix, suffix, min, max, step = 'any', hint, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {prefix && (
          <span className="px-3 py-2 bg-slate-50 border-r border-slate-300 text-slate-500 text-sm select-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent min-w-0 placeholder:text-slate-300"
        />
        {suffix && (
          <span className="px-3 py-2 bg-slate-50 border-l border-slate-300 text-slate-500 text-sm select-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
