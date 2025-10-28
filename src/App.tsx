import { useEffect, useRef, useState } from 'react';
import { CalculatorCard } from './components/CalculatorCard';
import { DealFlowTracker } from './components/DealFlowTracker';
import { GlobalDisclaimers } from './components/GlobalDisclaimers';
import { SettingsPanel } from './components/SettingsPanel';
import { useAppSettings } from './context/AppSettingsContext';
import {
  calculateExitImpact,
  calculateGrowthToTarget,
  calculateHybridScenario,
  calculateRunway,
  ExitImpactResult,
  GrowthToTargetResult,
  HybridScenarioResult,
  RunwayInput,
  RunwayResult,
} from './utils/finance';
import { formatCurrency, formatMonths, formatNumber, formatPercent } from './utils/format';

const defaultRunwayInput: RunwayInput = {
  cashOnHand: '1200000',
  monthlyBurn: '150000',
  monthlyRevenue: '25000',
};

const defaultGrowthInput = {
  currentValue: '1500000',
  years: '5',
  targetValue: 10_000_000,
};

const defaultExitInput = {
  exitValuation: '45000000',
  ownershipPercentage: '12',
  liquidationPreferences: '2000000',
  taxRate: '25',
};

const baseHybridInput = {
  annualCashComp: '180000',
  annualCashDistribution: '20000',
  cashYears: '4',
  equityPercentage: '5',
  exitValuation: '60000000',
  exitYear: '5',
  discountRate: '10',
};

type GrowthInputState = {
  currentValue: string;
  years: string;
};

type ExitInputState = {
  exitValuation: string;
  ownershipPercentage: string;
  liquidationPreferences: string;
  taxRate: string;
};

type HybridInputState = {
  annualCashComp: string;
  annualCashDistribution: string;
  cashYears: string;
  equityPercentage: string;
  exitValuation: string;
  exitYear: string;
  discountRate: string;
};

function getRunwayAccent(classification: RunwayResult['runwayClassification']): string {
  switch (classification) {
    case 'critical':
      return 'alert alert--error';
    case 'warning':
      return 'alert alert--warning';
    default:
      return 'chip';
  }
}

export default function App() {
  const { settings } = useAppSettings();

  const [runwayInput, setRunwayInput] = useState<RunwayInput>(defaultRunwayInput);
  const [runwayResult, setRunwayResult] = useState<RunwayResult | null>(null);
  const [runwayErrors, setRunwayErrors] = useState<string[]>([]);

  const [growthInput, setGrowthInput] = useState<GrowthInputState>({
    currentValue: defaultGrowthInput.currentValue,
    years: defaultGrowthInput.years,
  });
  const [growthResult, setGrowthResult] = useState<GrowthToTargetResult | null>(null);
  const [growthErrors, setGrowthErrors] = useState<string[]>([]);

  const [exitInput, setExitInput] = useState<ExitInputState>({
    exitValuation: defaultExitInput.exitValuation,
    ownershipPercentage: defaultExitInput.ownershipPercentage,
    liquidationPreferences: defaultExitInput.liquidationPreferences,
    taxRate: defaultExitInput.taxRate,
  });
  const [exitResult, setExitResult] = useState<ExitImpactResult | null>(null);
  const [exitErrors, setExitErrors] = useState<string[]>([]);

  const [hybridInput, setHybridInput] = useState<HybridInputState>(() => ({
    annualCashComp: baseHybridInput.annualCashComp,
    annualCashDistribution: baseHybridInput.annualCashDistribution,
    cashYears: baseHybridInput.cashYears,
    equityPercentage: baseHybridInput.equityPercentage,
    exitValuation: baseHybridInput.exitValuation,
    exitYear: baseHybridInput.exitYear,
    discountRate: String(settings.defaultDiscountRate),
  }));
  const [hybridResult, setHybridResult] = useState<HybridScenarioResult | null>(null);
  const [hybridErrors, setHybridErrors] = useState<string[]>([]);

  const previousDefaultDiscountRef = useRef(String(settings.defaultDiscountRate));

  useEffect(() => {
    const nextDiscount = String(settings.defaultDiscountRate);
    setHybridInput((current) => {
      if (current.discountRate === previousDefaultDiscountRef.current) {
        return {
          ...current,
          discountRate: nextDiscount,
        };
      }
      return current;
    });
    previousDefaultDiscountRef.current = nextDiscount;
  }, [settings.defaultDiscountRate]);

  useEffect(() => {
    const runwayEval = calculateRunway(defaultRunwayInput);
    setRunwayResult(runwayEval.result);
    setRunwayErrors(runwayEval.errors);

    const growthEval = calculateGrowthToTarget(defaultGrowthInput);
    setGrowthResult(growthEval.result);
    setGrowthErrors(growthEval.errors);

    const exitEval = calculateExitImpact(defaultExitInput);
    setExitResult(exitEval.result);
    setExitErrors(exitEval.errors);

    const hybridDefaults = {
      annualCashComp: baseHybridInput.annualCashComp,
      annualCashDistribution: baseHybridInput.annualCashDistribution,
      cashYears: baseHybridInput.cashYears,
      equityPercentage: baseHybridInput.equityPercentage,
      exitValuation: baseHybridInput.exitValuation,
      exitYear: baseHybridInput.exitYear,
      discountRate: String(settings.defaultDiscountRate),
    };
    const hybridEval = calculateHybridScenario(hybridDefaults);
    setHybridResult(hybridEval.result);
    setHybridErrors(hybridEval.errors);
  }, [settings.defaultDiscountRate]);

  const evaluateRunway = () => {
    const evaluation = calculateRunway(runwayInput);
    setRunwayResult(evaluation.result);
    setRunwayErrors(evaluation.errors);
  };

  const evaluateGrowth = () => {
    const evaluation = calculateGrowthToTarget({
      currentValue: growthInput.currentValue,
      years: growthInput.years,
      targetValue: defaultGrowthInput.targetValue,
    });
    setGrowthResult(evaluation.result);
    setGrowthErrors(evaluation.errors);
  };

  const evaluateExit = () => {
    const evaluation = calculateExitImpact(exitInput);
    setExitResult(evaluation.result);
    setExitErrors(evaluation.errors);
  };

  const evaluateHybrid = () => {
    const evaluation = calculateHybridScenario(hybridInput);
    setHybridResult(evaluation.result);
    setHybridErrors(evaluation.errors);
  };

  return (
    <div className="app-shell">
      <header>
        <h1>Goal Calculators &amp; Dealflow Tools</h1>
        <p>
          Model capital runway, investment return paths, and exit scenarios alongside a persistent pipeline tracker.
          Guidance tooltips connect each calculator back to the broader plan context.
        </p>
      </header>

      <GlobalDisclaimers />
      <SettingsPanel />

      <section id="plan-insights" className="plan-detail-anchor">
        <h2>Plan insight quick-links</h2>
        <p>Use the calculators and tracker to inform plan assumptions, then jump back here for deeper review.</p>
        <ul>
          <li><a href="#settings">Workspace settings</a></li>
          <li><a href="#disclaimers">Important notices</a></li>
          <li><a href="#runway-calculator">Burn &amp; capital requirements</a></li>
          <li><a href="#growth-calculator">Return targets &amp; IRR planning</a></li>
          <li><a href="#exit-calculator">Exit waterfall implications</a></li>
          <li><a href="#hybrid-calculator">Operator cash vs. equity balance</a></li>
          <li><a href="#dealflow">Pipeline and diligence notes</a></li>
        </ul>
      </section>

      <div className="calculator-grid">
        <CalculatorCard
          title="Capital runway by burn"
          description="Understand how many months of runway remain and classify risk bands based on net burn."
          tooltipContent={
            <div>
              Model assumes consistent burn minus any offsetting revenue. Sustainable when net burn ≤ 0, warning below
              12 months, critical below 6.
            </div>
          }
          guidanceLink={{ href: '#plan-insights', label: 'Plan detail' }}
        >
          <form
            id="runway-calculator"
            className="calculator-form"
            onSubmit={(event) => {
              event.preventDefault();
              evaluateRunway();
            }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="cash-on-hand">Cash on hand (USD)</label>
                <input
                  id="cash-on-hand"
                  value={runwayInput.cashOnHand}
                  onChange={(event) => setRunwayInput((current) => ({ ...current, cashOnHand: event.target.value }))}
                  placeholder="e.g. 1200000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="monthly-burn">Monthly burn (USD)</label>
                <input
                  id="monthly-burn"
                  value={runwayInput.monthlyBurn}
                  onChange={(event) => setRunwayInput((current) => ({ ...current, monthlyBurn: event.target.value }))}
                  placeholder="e.g. 150000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="monthly-revenue">Offsetting monthly revenue (USD)</label>
                <input
                  id="monthly-revenue"
                  value={runwayInput.monthlyRevenue ?? ''}
                  onChange={(event) => setRunwayInput((current) => ({ ...current, monthlyRevenue: event.target.value }))}
                  placeholder="Optional — e.g. 25000"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button-primary">
                Calculate runway
              </button>
              {runwayResult ? <span className={getRunwayAccent(runwayResult.runwayClassification)}>{runwayResult.runwayClassification.toUpperCase()}</span> : null}
            </div>
          </form>
          {runwayErrors.length > 0 ? (
            <div className="alert alert--error" role="alert">
              {runwayErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          ) : null}
          {runwayResult ? (
            <div className="result-panel">
              <div className="result-panel__highlight">
                <span>Net burn</span>
                <strong>{formatCurrency(runwayResult.netBurn)}</strong>
              </div>
              <div className="result-panel__grid">
                <div className="stat-item">
                  <span>Runway remaining</span>
                  <span>{formatMonths(runwayResult.months)}</span>
                </div>
                <div className="stat-item">
                  <span>Risk band</span>
                  <span>{runwayResult.runwayClassification === 'sustainable' ? 'Healthy' : runwayResult.runwayClassification}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CalculatorCard>

        <CalculatorCard
          title="Compounding to $10M"
          description="Determine the MOIC and compounded IRR required to grow to $10M within your time horizon."
          tooltipContent={<div>Target value defaults to $10M. Adjust current value and horizon to size required growth.</div>}
          guidanceLink={{ href: '#plan-insights', label: 'Plan detail' }}
        >
          <form
            id="growth-calculator"
            className="calculator-form"
            onSubmit={(event) => {
              event.preventDefault();
              evaluateGrowth();
            }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="current-value">Current invested capital</label>
                <input
                  id="current-value"
                  value={growthInput.currentValue}
                  onChange={(event) => setGrowthInput((current) => ({ ...current, currentValue: event.target.value }))}
                  placeholder="e.g. 1500000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="growth-years">Years to reach $10M</label>
                <input
                  id="growth-years"
                  value={growthInput.years}
                  onChange={(event) => setGrowthInput((current) => ({ ...current, years: event.target.value }))}
                  placeholder="e.g. 5"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button-primary">
                Calculate growth needs
              </button>
            </div>
          </form>
          {growthErrors.length > 0 ? (
            <div className="alert alert--warning" role="alert">
              {growthErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          ) : null}
          {growthResult ? (
            <div className="result-panel">
              <div className="result-panel__highlight">
                <span>Target value</span>
                <strong>{formatCurrency(growthResult.targetValue)}</strong>
              </div>
              <div className="result-panel__grid">
                <div className="stat-item">
                  <span>MOIC required</span>
                  <span>{formatNumber(growthResult.moic, 2)}x</span>
                </div>
                <div className="stat-item">
                  <span>CAGR required</span>
                  <span>{formatPercent(growthResult.cagr)}</span>
                </div>
                <div className="stat-item">
                  <span>Equivalent IRR</span>
                  <span>{formatPercent(growthResult.irr)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CalculatorCard>

        <CalculatorCard
          title="One-off exit impact"
          description="Estimate expected proceeds after preferences and taxes for a single exit scenario."
          tooltipContent={
            <div>
              Applies ownership percentage to exit value, adds any preference balance then subtracts selected blended tax
              rate for an illustrative post-tax outcome.
            </div>
          }
          guidanceLink={{ href: '#plan-insights', label: 'Plan detail' }}
        >
          <form
            id="exit-calculator"
            className="calculator-form"
            onSubmit={(event) => {
              event.preventDefault();
              evaluateExit();
            }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="exit-value">Exit valuation (USD)</label>
                <input
                  id="exit-value"
                  value={exitInput.exitValuation}
                  onChange={(event) => setExitInput((current) => ({ ...current, exitValuation: event.target.value }))}
                  placeholder="e.g. 45000000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="ownership">Ownership percentage</label>
                <input
                  id="ownership"
                  value={exitInput.ownershipPercentage}
                  onChange={(event) =>
                    setExitInput((current) => ({ ...current, ownershipPercentage: event.target.value }))
                  }
                  placeholder="e.g. 12"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="preferences">Outstanding preferences (USD)</label>
                <input
                  id="preferences"
                  value={exitInput.liquidationPreferences}
                  onChange={(event) =>
                    setExitInput((current) => ({ ...current, liquidationPreferences: event.target.value }))
                  }
                  placeholder="Optional — e.g. 2000000"
                />
              </div>
              <div className="form-field">
                <label htmlFor="tax-rate">Blended tax rate (%)</label>
                <input
                  id="tax-rate"
                  value={exitInput.taxRate}
                  onChange={(event) => setExitInput((current) => ({ ...current, taxRate: event.target.value }))}
                  placeholder="e.g. 25"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button-primary">
                Calculate exit impact
              </button>
            </div>
          </form>
          {exitErrors.length > 0 ? (
            <div className="alert alert--error" role="alert">
              {exitErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          ) : null}
          {exitResult ? (
            <div className="result-panel">
              <div className="result-panel__highlight">
                <span>Gross ownership proceeds</span>
                <strong>{formatCurrency(exitResult.grossProceeds)}</strong>
              </div>
              <div className="result-panel__grid">
                <div className="stat-item">
                  <span>Preferences returned</span>
                  <span>{formatCurrency(exitResult.preferencesCovered)}</span>
                </div>
                <div className="stat-item">
                  <span>Pre-tax total</span>
                  <span>{formatCurrency(exitResult.netProceedsBeforeTax)}</span>
                </div>
                <div className="stat-item">
                  <span>Estimated taxes</span>
                  <span>{formatCurrency(exitResult.estimatedTaxes)}</span>
                </div>
                <div className="stat-item">
                  <span>Net after tax</span>
                  <span>{formatCurrency(exitResult.netProceedsAfterTax)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CalculatorCard>

        <CalculatorCard
          title="Hybrid cashflow + equity"
          description="Blend salary/distributions with equity upside, discounted back to present value."
          tooltipContent={
            <div>
              Distributes annual cash over the employment horizon and discounts equity using the chosen rate for a
              present value plus blended annualised return.
            </div>
          }
          guidanceLink={{ href: '#plan-insights', label: 'Plan detail' }}
        >
          <form
            id="hybrid-calculator"
            className="calculator-form"
            onSubmit={(event) => {
              event.preventDefault();
              evaluateHybrid();
            }}
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="cash-comp">Annual cash compensation (USD)</label>
                <input
                  id="cash-comp"
                  value={hybridInput.annualCashComp}
                  onChange={(event) =>
                    setHybridInput((current) => ({ ...current, annualCashComp: event.target.value }))
                  }
                  placeholder="e.g. 180000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="distributions">Annual cash distributions (USD)</label>
                <input
                  id="distributions"
                  value={hybridInput.annualCashDistribution}
                  onChange={(event) =>
                    setHybridInput((current) => ({ ...current, annualCashDistribution: event.target.value }))
                  }
                  placeholder="Optional — e.g. 20000"
                />
              </div>
              <div className="form-field">
                <label htmlFor="cash-years">Years receiving cash</label>
                <input
                  id="cash-years"
                  value={hybridInput.cashYears}
                  onChange={(event) => setHybridInput((current) => ({ ...current, cashYears: event.target.value }))}
                  placeholder="e.g. 4"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="equity">Equity percentage</label>
                <input
                  id="equity"
                  value={hybridInput.equityPercentage}
                  onChange={(event) => setHybridInput((current) => ({ ...current, equityPercentage: event.target.value }))}
                  placeholder="e.g. 5"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="exit-valuation">Projected exit valuation (USD)</label>
                <input
                  id="exit-valuation"
                  value={hybridInput.exitValuation}
                  onChange={(event) => setHybridInput((current) => ({ ...current, exitValuation: event.target.value }))}
                  placeholder="e.g. 60000000"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="exit-year">Years until exit</label>
                <input
                  id="exit-year"
                  value={hybridInput.exitYear}
                  onChange={(event) => setHybridInput((current) => ({ ...current, exitYear: event.target.value }))}
                  placeholder="e.g. 5"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="discount-rate">Discount rate (%)</label>
                <input
                  id="discount-rate"
                  value={hybridInput.discountRate}
                  onChange={(event) => setHybridInput((current) => ({ ...current, discountRate: event.target.value }))}
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="button-primary">
                Evaluate hybrid return
              </button>
            </div>
          </form>
          {hybridErrors.length > 0 ? (
            <div className="alert alert--error" role="alert">
              {hybridErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          ) : null}
          {hybridResult ? (
            <div className="result-panel">
              <div className="result-panel__highlight">
                <span>Total value (discounted)</span>
                <strong>{formatCurrency(hybridResult.blendedValue)}</strong>
              </div>
              <div className="result-panel__grid">
                <div className="stat-item">
                  <span>Cash compensation total</span>
                  <span>{formatCurrency(hybridResult.totalCashComp)}</span>
                </div>
                <div className="stat-item">
                  <span>Cash distributions total</span>
                  <span>{formatCurrency(hybridResult.totalCashDistributions)}</span>
                </div>
                <div className="stat-item">
                  <span>Equity value (gross)</span>
                  <span>{formatCurrency(hybridResult.grossEquityValue)}</span>
                </div>
                <div className="stat-item">
                  <span>Equity value (discounted)</span>
                  <span>{formatCurrency(hybridResult.discountedEquityValue)}</span>
                </div>
                <div className="stat-item">
                  <span>Annualised blended return</span>
                  <span>{formatPercent(hybridResult.annualizedBlendedReturn)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </CalculatorCard>
      </div>

      <DealFlowTracker />
    </div>
  );
}
