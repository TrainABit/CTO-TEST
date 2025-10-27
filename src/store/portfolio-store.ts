import { create } from "zustand";

export type TimeRange = "1M" | "3M" | "6M" | "1Y" | "5Y";

interface PortfolioState {
  range: TimeRange;
  setRange: (range: TimeRange) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  range: "1Y",
  setRange: (range) => set({ range }),
}));
