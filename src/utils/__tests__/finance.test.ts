import { describe, expect, it } from 'vitest';
import {
  calculateExitImpact,
  calculateGrowthToTarget,
  calculateHybridScenario,
  calculateRunway,
} from '../finance';

describe('calculateRunway', () => {
  it('classifies runway correctly when burn exceeds revenue', () => {
    const { result, errors } = calculateRunway({
      cashOnHand: '1200000',
      monthlyBurn: '150000',
      monthlyRevenue: '25000',
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result?.netBurn).toBe(125000);
    expect(result?.runwayClassification).toBe('warning');
    expect(result?.months).toBeCloseTo(9.6, 1);
  });

  it('returns sustainable when revenue offsets burn', () => {
    const { result, errors } = calculateRunway({
      cashOnHand: '500000',
      monthlyBurn: '75000',
      monthlyRevenue: '80000',
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result?.runwayClassification).toBe('sustainable');
    expect(result?.months).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('calculateGrowthToTarget', () => {
  it('calculates MOIC and CAGR toward 10M', () => {
    const { result, errors } = calculateGrowthToTarget({ currentValue: '1500000', years: '5' });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result?.targetValue).toBe(10_000_000);
    expect(result?.moic).toBeCloseTo(6.6666, 3);
    expect(result?.cagr).toBeCloseTo(0.4614, 3);
  });
});

describe('calculateExitImpact', () => {
  it('estimates net proceeds after preferences and taxes', () => {
    const { result, errors } = calculateExitImpact({
      exitValuation: '45000000',
      ownershipPercentage: '12',
      liquidationPreferences: '2000000',
      taxRate: '25',
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result?.grossProceeds).toBe(5_400_000);
    expect(result?.preferencesCovered).toBe(2_000_000);
    expect(result?.netProceedsBeforeTax).toBe(7_400_000);
    expect(result?.estimatedTaxes).toBe(1_850_000);
    expect(result?.netProceedsAfterTax).toBe(5_550_000);
  });
});

describe('calculateHybridScenario', () => {
  it('returns blended value and annualised returns', () => {
    const { result, errors } = calculateHybridScenario({
      annualCashComp: '180000',
      annualCashDistribution: '20000',
      cashYears: '4',
      equityPercentage: '5',
      exitValuation: '60000000',
      exitYear: '5',
      discountRate: '10',
    });

    expect(errors).toEqual([]);
    expect(result).not.toBeNull();
    expect(result?.totalCashComp).toBe(720000);
    expect(result?.totalCashDistributions).toBe(80000);
    expect(result?.grossEquityValue).toBe(3_000_000);
    expect(result?.discountedEquityValue).toBeCloseTo(1_862_764, 0);
    expect(result?.blendedValue).toBeCloseTo(2_662_764, 0);
    expect(result?.annualizedBlendedReturn).toBeCloseTo(0.3656, 3);
  });
});
