import { StrategicPlan } from '../types';

import { agencyProductHybridPlan } from './agencyProductHybrid';
import { microPeRollUpPlan } from './microPeRollUp';
import { verticalAiSaasPlan } from './verticalAiSaas';

export const STRATEGIC_PLANS: StrategicPlan[] = [
  verticalAiSaasPlan,
  microPeRollUpPlan,
  agencyProductHybridPlan,
];

export const STRATEGIC_PLAN_MAP: Record<string, StrategicPlan> = STRATEGIC_PLANS.reduce(
  (accumulator, plan) => {
    accumulator[plan.id] = plan;
    return accumulator;
  },
  {} as Record<string, StrategicPlan>,
);

export {
  agencyProductHybridPlan,
  microPeRollUpPlan,
  verticalAiSaasPlan,
};
