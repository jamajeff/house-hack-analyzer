export function calcMonthlyMortgage(price, downPct, annualRate, termYears) {
  const principal = price * (1 - downPct / 100);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcRemainingBalance(price, downPct, annualRate, termYears, yearsElapsed) {
  const principal = price * (1 - downPct / 100);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  const p = yearsElapsed * 12;
  if (r === 0) return Math.max(0, principal - (principal / n) * p);
  return principal * (Math.pow(1 + r, n) - Math.pow(1 + r, p)) / (Math.pow(1 + r, n) - 1);
}

export function analyzeYear(year, config) {
  const {
    purchasePrice: _purchasePrice,
    downPct,
    interestRate,
    loanTerm,
    annualTaxes: _annualTaxes,
    annualInsurance: _annualInsurance,
    monthlyHOA,
    units,          // array of { rent, isOwnerUnit }
    vacancyRate,
    maintenancePct,
    mgmtFeePct,
    rentGrowthRate,
    appreciationRate,
    ownerStillInUnit,
    alternativeMonthlyRent: _alternativeMonthlyRent,
  } = config;

  const purchasePrice = Number(_purchasePrice) || 0;
  const annualTaxes = Number(_annualTaxes) || 0;
  const annualInsurance = Number(_annualInsurance) || 0;
  const alternativeMonthlyRent = Number(_alternativeMonthlyRent) || 0;

  const monthlyMortgage = calcMonthlyMortgage(purchasePrice, downPct, interestRate, loanTerm);
  const propertyValue = purchasePrice * Math.pow(1 + appreciationRate / 100, year);
  const remainingBalance = calcRemainingBalance(purchasePrice, downPct, interestRate, loanTerm, year);
  const equity = propertyValue - remainingBalance;
  const downPayment = purchasePrice * (downPct / 100);

  // Rents adjusted for growth (compounded from year 1 onward)
  const adjustedUnits = units.map(u => ({
    ...u,
    adjustedRent: (Number(u.rent) || 0) * Math.pow(1 + rentGrowthRate / 100, year),
  }));

  // Rental income: skip owner's unit if still living there
  const rentalUnits = adjustedUnits.filter(u => !(u.isOwnerUnit && ownerStillInUnit));
  const grossMonthlyRent = rentalUnits.reduce((sum, u) => sum + u.adjustedRent, 0);
  const effectiveMonthlyRent = grossMonthlyRent * (1 - vacancyRate / 100);
  const annualRentalIncome = effectiveMonthlyRent * 12;

  // Expenses (monthly)
  const monthlyTaxes = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;
  const monthlyMaintenance = (propertyValue * maintenancePct / 100) / 12;
  const monthlyMgmt = effectiveMonthlyRent * (mgmtFeePct / 100);

  const totalMonthlyExpenses =
    monthlyMortgage +
    monthlyTaxes +
    monthlyInsurance +
    monthlyHOA +
    monthlyMaintenance +
    monthlyMgmt;

  const annualExpenses = totalMonthlyExpenses * 12;
  const annualCashFlow = annualRentalIncome - annualExpenses;

  // Owner benefit: savings on rent they'd otherwise pay
  const ownerRentSavings = ownerStillInUnit ? alternativeMonthlyRent * 12 : 0;

  // Total economic benefit (cash flow + rent savings while living there)
  const totalEconomicBenefit = annualCashFlow + ownerRentSavings;

  return {
    year,
    monthlyMortgage,
    annualRentalIncome,
    annualExpenses,
    annualCashFlow,
    monthlyNetCashFlow: annualCashFlow / 12,
    ownerRentSavings,
    totalEconomicBenefit,
    monthlyTotalBenefit: totalEconomicBenefit / 12,
    propertyValue,
    remainingBalance,
    equity,
    equityReturn: equity / downPayment,
    breakdown: {
      mortgage: monthlyMortgage,
      taxes: monthlyTaxes,
      insurance: monthlyInsurance,
      hoa: monthlyHOA,
      maintenance: monthlyMaintenance,
      mgmt: monthlyMgmt,
      rentalIncome: effectiveMonthlyRent,
    },
  };
}

export function runAnalysis(config, years = 15) {
  const results = [];
  let stabilizationYear = null;

  for (let y = 1; y <= years; y++) {
    // Phase 1: living in unit
    const withOwner = analyzeYear(y, { ...config, ownerStillInUnit: true });
    // Phase 2: fully rented (moved out of owner unit)
    const fullyRented = analyzeYear(y, { ...config, ownerStillInUnit: false });

    results.push({ ...withOwner, fullyRented });

    if (stabilizationYear === null && fullyRented.annualCashFlow > 0) {
      stabilizationYear = y;
    }
  }

  return { results, stabilizationYear };
}

export function formatCurrency(val, signed = false) {
  const abs = Math.abs(val);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(abs);
  if (signed) return (val < 0 ? '-' : '+') + formatted;
  return val < 0 ? `-${formatted}` : formatted;
}

export function formatPct(val) {
  return `${val.toFixed(1)}%`;
}
