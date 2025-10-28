"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PlanPreferenceState {
  primaryPlanId: string | null;
  secondaryPlanId: string | null;
  setPrimaryPlan: (planId: string | null) => void;
  setSecondaryPlan: (planId: string | null) => void;
  clearSelections: () => void;
}

export const usePlanPreferenceStore = create(
  persist<PlanPreferenceState>(
    (set, get) => ({
      primaryPlanId: null,
      secondaryPlanId: null,
      setPrimaryPlan: (planId) =>
        set((state) => ({
          primaryPlanId: planId,
          secondaryPlanId:
            planId && state.secondaryPlanId === planId ? null : state.secondaryPlanId,
        })),
      setSecondaryPlan: (planId) =>
        set((state) => ({
          secondaryPlanId: planId,
          primaryPlanId: planId && state.primaryPlanId === planId ? null : state.primaryPlanId,
        })),
      clearSelections: () => set({ primaryPlanId: null, secondaryPlanId: null }),
    }),
    {
      name: "plan-preferences",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<PlanPreferenceState>;
        return {
          primaryPlanId: state.primaryPlanId ?? null,
          secondaryPlanId: state.secondaryPlanId ?? null,
          setPrimaryPlan: () => {},
          setSecondaryPlan: () => {},
          clearSelections: () => {},
        };
      },
    },
  ),
);
