"use client";

import { useCallback, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Brain,
  Building2,
  CheckCircle2,
  Gauge,
  Handshake,
  Info,
  LifeBuoy,
  MinusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import {
  COMPARISON_DIMENSIONS,
  COMPARISON_METRIC_DEFINITIONS,
  DEFAULT_COMPARISON_WEIGHTING,
  STRATEGIC_PLANS,
  type ComparisonDimension,
  type ComparisonDimensionScores,
  type ComparisonMetricDefinition,
  type ComparisonWeightingConfig,
  type PlanComparisonScore,
  type StrategicPlan,
  calculateWeightedScore,
  normalizeWeighting,
  DISCLAIMERS,
} from "@/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatPercentage, formatScore } from "@/lib/format";
import { usePlanPreferenceStore } from "@/store/plan-preferences";

interface PlanMetricView {
  definition: ComparisonMetricDefinition;
  comparison: PlanComparisonScore;
  weightedScore: number;
}

interface PlanViewModel {
  plan: StrategicPlan;
  aggregateScore: number;
  metricMap: Record<string, PlanMetricView>;
  dimensionAverages: ComparisonDimensionScores;
}

const dimensionMetadata: Record<
  ComparisonDimension,
  { label: string; description: string; icon: LucideIcon }
> = {
  speed: {
    label: "Speed",
    description: "How quickly the plan can demonstrate meaningful traction.",
    icon: Zap,
  },
  efficiency: {
    label: "Efficiency",
    description: "Capital and operational leverage achieved per unit of input.",
    icon: Gauge,
  },
  complexityInverse: {
    label: "Simplicity",
    description: "Operational lift required day to day — higher is easier to run.",
    icon: Sparkles,
  },
  downsideInverse: {
    label: "Resilience",
    description: "Ability to absorb shocks without material downside.",
    icon: ShieldCheck,
  },
  upside: {
    label: "Upside",
    description: "Ceiling of the opportunity if execution outperforms.",
    icon: TrendingUp,
  },
};

const planIconMap: Record<string, LucideIcon> = {
  "vertical-ai-saas": Brain,
  "micro-pe-roll-up": Building2,
  "agency-product-hybrid": Handshake,
};

function buildPlanViewModel(
  plan: StrategicPlan,
  weighting: ComparisonWeightingConfig,
): PlanViewModel {
  const metricMap: Record<string, PlanMetricView> = {};
  let weightedSum = 0;
  let metricCount = 0;

  plan.comparisonScores.forEach((comparison) => {
    const definition = COMPARISON_METRIC_DEFINITIONS.find(
      (metric) => metric.id === comparison.metricId,
    );
    if (!definition) {
      return;
    }

    const weightedScore = calculateWeightedScore(comparison.dimensionScores, weighting);

    metricMap[comparison.metricId] = {
      definition,
      comparison,
      weightedScore,
    };
    weightedSum += weightedScore;
    metricCount += 1;
  });

  const dimensionTotals = COMPARISON_DIMENSIONS.reduce<ComparisonDimensionScores>(
    (totals, dimension) => {
      totals[dimension] = 0;
      return totals;
    },
    {} as ComparisonDimensionScores,
  );

  plan.comparisonScores.forEach((comparison) => {
    COMPARISON_DIMENSIONS.forEach((dimension) => {
      dimensionTotals[dimension] += comparison.dimensionScores[dimension];
    });
  });

  const dimensionAverages = COMPARISON_DIMENSIONS.reduce<ComparisonDimensionScores>(
    (averages, dimension) => {
      averages[dimension] =
        metricCount > 0 ? Number((dimensionTotals[dimension] / metricCount).toFixed(2)) : 0;
      return averages;
    },
    {} as ComparisonDimensionScores,
  );

  const aggregateScore = metricCount > 0 ? Number((weightedSum / metricCount).toFixed(2)) : 0;

  return {
    plan,
    aggregateScore,
    metricMap,
    dimensionAverages,
  };
}

export default function PlansPage() {
  const [weighting, setWeighting] = useState<ComparisonWeightingConfig>(
    DEFAULT_COMPARISON_WEIGHTING,
  );
  const normalizedWeighting = useMemo(() => normalizeWeighting(weighting), [weighting]);

  const { primaryPlanId, secondaryPlanId, setPrimaryPlan, setSecondaryPlan } =
    usePlanPreferenceStore();

  const planViews = useMemo(
    () => STRATEGIC_PLANS.map((plan) => buildPlanViewModel(plan, normalizedWeighting)),
    [normalizedWeighting],
  );

  const metricRows = useMemo(() => {
    return COMPARISON_METRIC_DEFINITIONS.map((definition) => ({
      definition,
      cells: planViews.map((view) => view.metricMap[definition.id]),
    }));
  }, [planViews]);

  const handleResetWeighting = useCallback(() => {
    setWeighting({ ...DEFAULT_COMPARISON_WEIGHTING });
  }, []);

  const handleWeightChange = useCallback((dimension: ComparisonDimension, value: number[]) => {
    setWeighting((previous) => ({
      ...previous,
      [dimension]: value[0] / 100,
    }));
  }, []);

  const togglePrimaryPlan = useCallback(
    (planId: string) => {
      setPrimaryPlan(primaryPlanId === planId ? null : planId);
    },
    [primaryPlanId, setPrimaryPlan],
  );

  const toggleSecondaryPlan = useCallback(
    (planId: string) => {
      setSecondaryPlan(secondaryPlanId === planId ? null : planId);
    },
    [secondaryPlanId, setSecondaryPlan],
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Strategic planning
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Plans &amp; comparison
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Evaluate the three modeled strategies across capital allocation, execution phases, and
            risk posture. Adjust the weighting sliders to prioritize the criteria that matter most
            to your mandate.
          </p>
        </header>

        <section
          aria-label="Disclaimer"
          className="rounded-lg border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-500" aria-hidden="true" />
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wide">Non-advisory disclosure</p>
              <ul className="space-y-2 pl-5 text-xs leading-relaxed text-amber-800 marker:text-amber-500 dark:text-amber-100">
                <li>{DISCLAIMERS.notInvestmentAdvice}</li>
                <li>{DISCLAIMERS.executionRisk}</li>
                <li>{DISCLAIMERS.operatingAssumptions}</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-label="Weighting controls" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Comparison weighting</CardTitle>
                <CardDescription>
                  Drag the sliders to emphasize the dimensions most relevant to your decision.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleResetWeighting} className="gap-2">
                <RefreshCw className="size-4" aria-hidden="true" />
                Reset to default
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {COMPARISON_DIMENSIONS.map((dimension) => {
                const metadata = dimensionMetadata[dimension];
                return (
                  <div key={dimension} className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted">
                          <metadata.icon className="size-4 text-primary" aria-hidden="true" />
                        </span>
                        <span>{metadata.label}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex size-6 items-center justify-center rounded-full border border-transparent text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              aria-label={`${metadata.label} weighting description`}
                            >
                              <Info className="size-4" aria-hidden="true" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {metadata.description}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {(normalizedWeighting[dimension] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[weighting[dimension] * 100]}
                      max={100}
                      step={5}
                      aria-label={`${metadata.label} weighting`}
                      onValueChange={(value) => handleWeightChange(dimension, value)}
                    />
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground">
                We automatically normalize the slider values so the combined weighting always totals
                100%.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {planViews.map((view) => (
              <ComparisonScoreCard
                key={view.plan.id}
                plan={view.plan}
                aggregateScore={view.aggregateScore}
                dimensionAverages={view.dimensionAverages}
                isPrimary={primaryPlanId === view.plan.id}
                isSecondary={secondaryPlanId === view.plan.id}
                onSelectPrimary={togglePrimaryPlan}
                onSelectSecondary={toggleSecondaryPlan}
              />
            ))}
          </div>
        </section>

        <section aria-label="Comparison table" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Criteria comparison</h2>
            <p className="text-sm text-muted-foreground">
              Weighted scores update instantly as you adjust the sliders. Hover the info icons to
              read the rationale behind each rating.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-background">
                <tr>
                  <th className="w-64 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Metric
                  </th>
                  {planViews.map((view) => {
                    const Icon = planIconMap[view.plan.id] ?? Target;
                    return (
                      <th
                        key={view.plan.id}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted">
                              <Icon className="size-4 text-primary" aria-hidden="true" />
                            </span>
                            <span>{view.plan.title}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Composite score: {formatScore(view.aggregateScore)}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {metricRows.map((row) => (
                  <tr key={row.definition.id} className="border-t">
                    <td className="p-4 align-top">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <Target className="size-4 text-primary" aria-hidden="true" />
                          <span>{row.definition.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {row.definition.description}
                        </p>
                        {row.definition.unit ? (
                          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                            Unit: {row.definition.unit}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    {row.cells.map((cell, index) => (
                      <td key={`${row.definition.id}-${index}`} className="p-4 align-top">
                        {cell ? (
                          <div className="space-y-3 rounded-md border border-border/50 bg-muted/40 p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold text-foreground">
                                {formatScore(cell.weightedScore)}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex size-7 items-center justify-center rounded-full border border-transparent bg-background text-muted-foreground shadow-sm transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="View rationale"
                                  >
                                    <Info className="size-4" aria-hidden="true" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs leading-relaxed">
                                  {cell.comparison.rationale}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-muted-foreground">
                              {COMPARISON_DIMENSIONS.map((dimension) => {
                                const metadata = dimensionMetadata[dimension];
                                return (
                                  <div key={dimension} className="flex items-center gap-1">
                                    <metadata.icon
                                      className="size-3 text-primary"
                                      aria-hidden="true"
                                    />
                                    <span>
                                      {formatScore(cell.comparison.dimensionScores[dimension])}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-dashed border-border/60 p-3 text-xs text-muted-foreground">
                            No data modeled for this metric.
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="Plan details" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Strategy deep dives</h2>
            <p className="text-sm text-muted-foreground">
              Review capital allocation, execution phases, pros and cons, and the mitigations we
              model for the major risks in each approach.
            </p>
          </div>
          <div className="space-y-6">
            {planViews.map((view) => (
              <PlanSummaryCard key={view.plan.id} planView={view} />
            ))}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

interface ComparisonScoreCardProps {
  plan: StrategicPlan;
  aggregateScore: number;
  dimensionAverages: ComparisonDimensionScores;
  isPrimary: boolean;
  isSecondary: boolean;
  onSelectPrimary: (planId: string) => void;
  onSelectSecondary: (planId: string) => void;
}

function ComparisonScoreCard({
  plan,
  aggregateScore,
  dimensionAverages,
  isPrimary,
  isSecondary,
  onSelectPrimary,
  onSelectSecondary,
}: ComparisonScoreCardProps) {
  const Icon = planIconMap[plan.id] ?? Target;

  return (
    <Card className="h-full border-dashed">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-primary" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl">{plan.title}</CardTitle>
            <CardDescription>{plan.subtitle}</CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPrimary ? <Badge>Primary plan</Badge> : null}
          {isSecondary ? <Badge variant="secondary">Backup plan</Badge> : null}
          <Badge variant="outline" className="ml-auto text-xs font-medium">
            Weighted score {formatScore(aggregateScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Founder fit</p>
            <p className="text-sm text-muted-foreground">{plan.idealFounderProfile[0]}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPrimary ? "default" : "outline"}
              onClick={() => onSelectPrimary(plan.id)}
            >
              {isPrimary ? "Selected as primary" : "Set primary"}
            </Button>
            <Button
              size="sm"
              variant={isSecondary ? "default" : "outline"}
              onClick={() => onSelectSecondary(plan.id)}
            >
              {isSecondary ? "Selected as backup" : "Set backup"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {COMPARISON_DIMENSIONS.map((dimension) => {
            const metadata = dimensionMetadata[dimension];
            return (
              <Badge key={dimension} variant="muted" className="gap-2">
                <metadata.icon className="size-3 text-primary" aria-hidden="true" />
                <span>
                  {metadata.label}: {formatScore(dimensionAverages[dimension])}
                </span>
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanSummaryCard({ planView }: { planView: PlanViewModel }) {
  const { plan } = planView;

  const budgetByPhase = useMemo(() => {
    const lookup = new Map<string, { burnRate: number; notes: string }>();
    plan.budgetTimeline.forEach((entry) => {
      lookup.set(entry.phaseId, { burnRate: entry.burnRate, notes: entry.notes });
    });
    return lookup;
  }, [plan.budgetTimeline]);

  const totalCapital = plan.capitalAllocations.reduce(
    (total, allocation) => total + allocation.amount,
    0,
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-semibold">{plan.title}</CardTitle>
          <CardDescription className="text-base">{plan.subtitle}</CardDescription>
        </div>
        <p className="text-sm text-muted-foreground">{plan.summary}</p>
      </CardHeader>
      <CardContent className="space-y-8">
        <section aria-label="Founder profile" className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ideal founder profile
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            {plan.idealFounderProfile.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Capital allocation" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Capital allocation breakdown
            </h3>
            <Badge variant="outline" className="text-xs">
              Total modeled spend {formatCurrency(totalCapital)}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {plan.capitalAllocations.map((allocation) => (
              <div key={allocation.category} className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{allocation.category}</h4>
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatPercentage(allocation.percentage)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{allocation.description}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${allocation.percentage}%` }}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground">
                  {formatCurrency(allocation.amount)} allocated
                </p>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Phases" className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Phase timeline
          </h3>
          <ol className="space-y-4">
            {plan.phases.map((phase) => {
              const budget = budgetByPhase.get(phase.id);
              return (
                <li
                  key={phase.id}
                  className="relative rounded-lg border bg-background p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-foreground">{phase.title}</span>
                    <Badge variant="secondary">{phase.duration}</Badge>
                    {budget ? (
                      <Badge variant="outline" className="gap-1 text-xs">
                        Burn {formatCurrency(budget.burnRate)} / mo
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{phase.focus}</p>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                    <div>
                      <p className="font-semibold uppercase tracking-wide">Objectives</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {phase.objectives.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold uppercase tracking-wide">Milestones</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {phase.milestones.map((milestone) => (
                          <li key={milestone}>{milestone}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {budget ? (
                    <p className="mt-3 text-xs italic text-muted-foreground">{budget.notes}</p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Pros and cons" className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" aria-hidden="true" /> Pros
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {plan.pros.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <MinusCircle className="size-4 text-destructive" aria-hidden="true" /> Cons
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {plan.cons.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 text-destructive" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Risks" className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Modeled risks &amp; mitigations
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {plan.risks.map((risk) => (
              <div key={risk.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{risk.title}</h4>
                  <Badge variant="secondary" className="text-xs capitalize">
                    Likelihood: {risk.likelihood}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    Impact: {risk.impact}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{risk.description}</p>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-semibold uppercase tracking-wide">Mitigations</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {risk.mitigation.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {risk.contingency ? (
                    <div className="flex items-start gap-2">
                      <LifeBuoy className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                      <p className="leading-relaxed">{risk.contingency}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
