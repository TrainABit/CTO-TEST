import { describe, expect, it } from 'vitest';

import { plans } from '@/data/plans';
import { generateStaticParams } from '@/app/plans/[id]/page';

describe('strategic plan content', () => {
  it('exposes static params for every plan id', () => {
    const params = generateStaticParams();
    const idsFromPlans = new Set(plans.map((plan) => plan.id));
    const idsFromParams = new Set(params.map((param) => param.id));

    expect(idsFromParams.size).toBe(idsFromPlans.size);
    idsFromPlans.forEach((id) => {
      expect(idsFromParams.has(id)).toBe(true);
    });
  });

  it('includes at least one phase and exit checklist item per plan', () => {
    plans.forEach((plan) => {
      expect(plan.phases.length).toBeGreaterThan(0);
      plan.phases.forEach((phase) => {
        expect(phase.kpis.length).toBeGreaterThan(0);
        expect(phase.checklist.length).toBeGreaterThan(0);
      });
      expect(plan.exitChecklist.length).toBeGreaterThan(0);
    });
  });
});
