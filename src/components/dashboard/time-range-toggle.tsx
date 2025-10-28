"use client";

import { Button } from "@/components/ui/button";
import { TimeRange, usePortfolioStore } from "@/store/portfolio-store";

const ranges: TimeRange[] = ["1M", "3M", "6M", "1Y", "5Y"];

export function TimeRangeToggle() {
  const range = usePortfolioStore((state) => state.range);
  const setRange = usePortfolioStore((state) => state.setRange);

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
      {ranges.map((item) => {
        const isActive = item === range;
        return (
          <Button
            key={item}
            variant={isActive ? "default" : "ghost"}
            className="h-9 px-3"
            onClick={() => setRange(item)}
            type="button"
            aria-pressed={isActive}
            disabled={isActive}
          >
            {item}
          </Button>
        );
      })}
    </div>
  );
}
