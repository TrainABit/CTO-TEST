export type LikelihoodLevel = 'low' | 'medium' | 'high';
export type ImpactLevel = 'contained' | 'material' | 'severe';
export type TimelineGranularity = 'week' | 'month' | 'quarter';
export type Frequency = 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'per-phase';

export type ComparisonDimension =
  | 'speed'
  | 'efficiency'
  | 'complexityInverse'
  | 'downsideInverse'
  | 'upside';

export interface ComparisonWeightingConfig {
  speed: number;
  efficiency: number;
  complexityInverse: number;
  downsideInverse: number;
  upside: number;
}

export interface KPI {
  id: string;
  label: string;
  description: string;
  target: string;
  frequency: Frequency;
  category: 'growth' | 'operational' | 'financial' | 'product';
  owner?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  mitigation: string[];
  contingency?: string;
}

export interface ComparisonMetricDefinition {
  id: string;
  label: string;
  description: string;
  unit?: string;
  bestFor: string[];
}

export type ComparisonDimensionScores = Record<ComparisonDimension, number>;

export interface PlanComparisonScore {
  metricId: string;
  rationale: string;
  dimensionScores: ComparisonDimensionScores;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  owner: string;
  stage: 'pre-launch' | 'build' | 'scale' | 'exit';
}

export interface CalculatorInput {
  id: string;
  label: string;
  description: string;
  defaultValue: number;
  unit?: string;
  min?: number;
  max?: number;
}

export interface CalculatorOutputScenario {
  id: string;
  label: string;
  description: string;
  formula: string;
}

export interface CalculatorConfig {
  id: string;
  title: string;
  description: string;
  inputs: CalculatorInput[];
  scenarios: CalculatorOutputScenario[];
}

export interface BudgetAllocation {
  category: string;
  description: string;
  amount: number;
  percentage: number;
}

export interface BudgetTimelineEntry {
  phaseId: string;
  timeline: string;
  granularity: TimelineGranularity;
  burnRate: number;
  notes: string;
}

export interface ExitCriteria {
  strategic: string[];
  financial: string[];
  triggerToReevaluate: string[];
}

export interface Phase {
  id: string;
  title: string;
  duration: string;
  focus: string;
  objectives: string[];
  milestones: string[];
  kpisTracked: string[];
}

export interface StrategicPlan {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  idealFounderProfile: string[];
  capitalAllocations: BudgetAllocation[];
  phases: Phase[];
  pros: string[];
  cons: string[];
  risks: Risk[];
  kpis: KPI[];
  comparisonScores: PlanComparisonScore[];
  checklist: ChecklistItem[];
  calculators: CalculatorConfig[];
  exitCriteria: ExitCriteria;
  budgetTimeline: BudgetTimelineEntry[];
  supportingCopyIds: string[];
}
