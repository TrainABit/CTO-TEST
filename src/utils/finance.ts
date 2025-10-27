import { collectValidationErrors, toNumber, validateNumeric } from './validation';

export type RunwayInput = {
  cashOnHand: string;
  monthlyBurn: string;
  monthlyRevenue?: string;
};

export type RunwayResult = {
  netBurn: number;
  months: number;
  runwayClassification: 'sustainable' | 'warning' | 'critical';
};

export function calculateRunway(input: RunwayInput): { result: RunwayResult | null; errors: string[] } {
  const cashOnHand = toNumber(input.cashOnHand);
  const monthlyBurn = toNumber(input.monthlyBurn);
  const monthlyRevenue = toNumber(input.monthlyRevenue ?? '0');

  const errors = collectValidationErrors([
    validateNumeric(cashOnHand, { fieldLabel: 'Cash on hand' }),
    validateNumeric(monthlyBurn, { fieldLabel: 'Monthly burn' }),
    validateNumeric(monthlyRevenue, { fieldLabel: 'Monthly revenue', allowZero: true }),
  ]);

  if (errors.length > 0) {
    return { result: null, errors };
  }

  const netBurn = monthlyBurn - monthlyRevenue;

  if (netBurn <= 0) {
    return {
      result: {
        netBurn,
        months: Number.POSITIVE_INFINITY,
        runwayClassification: 'sustainable',
      },
      errors: [],
    };
  }

  const months = cashOnHand / netBurn;
  let runwayClassification: RunwayResult['runwayClassification'] = 'sustainable';

  if (months < 6) {
    runwayClassification = 'critical';
  } else if (months < 12) {
    runwayClassification = 'warning';
  }

  return {
    result: {
      netBurn,
      months,
      runwayClassification,
    },
    errors: [],
  };
}

export type GrowthToTargetInput = {
  currentValue: string;
  years: string;
  targetValue?: number;
};

export type GrowthToTargetResult = {
  targetValue: number;
  moic: number;
  cagr: number;
  irr: number;
};

export function calculateGrowthToTarget(
  input: GrowthToTargetInput
): { result: GrowthToTargetResult | null; errors: string[] } {
  const defaultTarget = input.targetValue ?? 10_000_000;
  const currentValue = toNumber(input.currentValue);
  const years = toNumber(input.years);

  const errors = collectValidationErrors([
    validateNumeric(currentValue, { fieldLabel: 'Current value' }),
    validateNumeric(years, { fieldLabel: 'Years', min: 1 }),
    validateNumeric(defaultTarget, { fieldLabel: 'Target value' }),
  ]);

  if (errors.length > 0) {
    return { result: null, errors };
  }

  if (currentValue >= defaultTarget) {
    return {
      result: {
        targetValue: defaultTarget,
        moic: defaultTarget / currentValue,
        cagr: 0,
        irr: 0,
      },
      errors: ['Current value already meets or exceeds the target.'],
    };
  }

  const moic = defaultTarget / currentValue;
  const cagr = Math.pow(moic, 1 / years) - 1;

  return {
    result: {
      targetValue: defaultTarget,
      moic,
      cagr,
      irr: cagr,
    },
    errors: [],
  };
}

export type ExitImpactInput = {
  exitValuation: string;
  ownershipPercentage: string;
  liquidationPreferences?: string;
  taxRate?: string;
};

export type ExitImpactResult = {
  grossProceeds: number;
  preferencesCovered: number;
  netProceedsBeforeTax: number;
  estimatedTaxes: number;
  netProceedsAfterTax: number;
};

export function calculateExitImpact(
  input: ExitImpactInput
): { result: ExitImpactResult | null; errors: string[] } {
  const exitValuation = toNumber(input.exitValuation);
  const ownershipPercentage = toNumber(input.ownershipPercentage);
  const liquidationPreferences = toNumber(input.liquidationPreferences ?? '0');
  const taxRate = toNumber(input.taxRate ?? '0');

  const errors = collectValidationErrors([
    validateNumeric(exitValuation, { fieldLabel: 'Exit valuation' }),
    validateNumeric(ownershipPercentage, { fieldLabel: 'Ownership percentage' }),
    validateNumeric(liquidationPreferences, { fieldLabel: 'Liquidation preferences', allowZero: true }),
    validateNumeric(taxRate, { fieldLabel: 'Tax rate', allowZero: true }),
  ]);

  if (ownershipPercentage > 100) {
    errors.push('Ownership percentage cannot exceed 100%.');
  }

  if (taxRate > 100) {
    errors.push('Tax rate cannot exceed 100%.');
  }

  if (errors.length > 0) {
    return { result: null, errors };
  }

  const grossProceeds = exitValuation * (ownershipPercentage / 100);
  const preferencesCovered = Math.min(liquidationPreferences, Math.max(exitValuation - grossProceeds, 0));
  const netProceedsBeforeTax = grossProceeds + preferencesCovered;
  const taxFraction = taxRate / 100;
  const estimatedTaxes = netProceedsBeforeTax * taxFraction;
  const netProceedsAfterTax = netProceedsBeforeTax - estimatedTaxes;

  return {
    result: {
      grossProceeds,
      preferencesCovered,
      netProceedsBeforeTax,
      estimatedTaxes,
      netProceedsAfterTax,
    },
    errors: [],
  };
}

export type HybridScenarioInput = {
  annualCashComp: string;
  annualCashDistribution?: string;
  cashYears: string;
  equityPercentage: string;
  exitValuation: string;
  exitYear: string;
  discountRate?: string;
};

export type HybridScenarioResult = {
  totalCashComp: number;
  totalCashDistributions: number;
  grossEquityValue: number;
  discountedEquityValue: number;
  blendedValue: number;
  annualizedBlendedReturn: number;
};

export function calculateHybridScenario(
  input: HybridScenarioInput
): { result: HybridScenarioResult | null; errors: string[] } {
  const annualCashComp = toNumber(input.annualCashComp);
  const annualCashDistribution = toNumber(input.annualCashDistribution ?? '0');
  const cashYears = toNumber(input.cashYears);
  const equityPercentage = toNumber(input.equityPercentage);
  const exitValuation = toNumber(input.exitValuation);
  const exitYear = toNumber(input.exitYear);
  const discountRate = toNumber(input.discountRate ?? '0');

  const errors = collectValidationErrors([
    validateNumeric(annualCashComp, { fieldLabel: 'Annual cash compensation', allowZero: true }),
    validateNumeric(annualCashDistribution, { fieldLabel: 'Annual cash distributions', allowZero: true }),
    validateNumeric(cashYears, { fieldLabel: 'Years of cash compensation', min: 1 }),
    validateNumeric(equityPercentage, { fieldLabel: 'Equity percentage', allowZero: true }),
    validateNumeric(exitValuation, { fieldLabel: 'Exit valuation', allowZero: true }),
    validateNumeric(exitYear, { fieldLabel: 'Years until exit', min: 1 }),
    validateNumeric(discountRate, { fieldLabel: 'Discount rate', allowZero: true }),
  ]);

  if (equityPercentage > 100) {
    errors.push('Equity percentage cannot exceed 100%.');
  }

  if (discountRate > 100) {
    errors.push('Discount rate cannot exceed 100%.');
  }

  if (errors.length > 0) {
    return { result: null, errors };
  }

  const totalCashComp = annualCashComp * cashYears;
  const totalCashDistributions = annualCashDistribution * cashYears;
  const grossEquityValue = exitValuation * (equityPercentage / 100);
  const discountFactor = Math.pow(1 + discountRate / 100, exitYear);
  const discountedEquityValue = discountFactor === 0 ? grossEquityValue : grossEquityValue / discountFactor;
  const blendedValue = totalCashComp + totalCashDistributions + discountedEquityValue;
  const investedBasis = totalCashComp + totalCashDistributions;
  const totalFutureValue = totalCashComp + totalCashDistributions + grossEquityValue;
  const annualizedBlendedReturn = investedBasis > 0 ? Math.pow(totalFutureValue / investedBasis, 1 / exitYear) - 1 : 0;

  return {
    result: {
      totalCashComp,
      totalCashDistributions,
      grossEquityValue,
      discountedEquityValue,
      blendedValue,
      annualizedBlendedReturn,
    },
    errors: [],
  };
}
