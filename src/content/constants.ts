import { ComparisonMetricDefinition } from "./types";

export const DISCLAIMERS = {
  notInvestmentAdvice:
    "The following strategies are illustrative only and do not constitute investment, legal, or accounting advice. Validate all assumptions for your specific context.",
  executionRisk:
    "Execution risk remains with the operator. Market, regulatory, and operational variables can materially impact the modeled outcomes.",
  operatingAssumptions:
    "Financial models assume disciplined cost management, measured hiring, and reinvestment of early cash flow into core growth levers.",
};

export const COPY_SNIPPETS = {
  founderFit:
    "This strategy favors operators with a bias toward rapid experimentation, hands-on go-to-market ownership, and an appetite for structured data-driven decisions.",
  capitalDiscipline:
    "Maintain a 12- to 18-month runway buffer by sequencing hiring behind revenue validation milestones and prioritizing variable cost structures.",
  toolingStack:
    "Leverage a lightweight stack of collaborative documentation, CRM, and analytics tools to maintain cadence without incurring enterprise overhead.",
};

export const COMPARISON_METRIC_DEFINITIONS: ComparisonMetricDefinition[] = [
  {
    id: "time-to-revenue",
    label: "Time to Meaningful Revenue",
    description: "Speed to first $25k monthly recurring or repeatable profit baseline.",
    unit: "months",
    bestFor: ["speed", "bootstrapped founders"],
  },
  {
    id: "capital-efficiency",
    label: "Capital Efficiency",
    description:
      "How effectively the strategy converts every dollar of investment into EBITDA or enterprise value.",
    unit: "score",
    bestFor: ["efficiency", "cash-constrained teams"],
  },
  {
    id: "operating-complexity",
    label: "Operating Complexity",
    description:
      "Breadth of disciplines required day-to-day and the systems burden to achieve scale.",
    unit: "score",
    bestFor: ["complexity management", "lean teams"],
  },
  {
    id: "downside-protection",
    label: "Downside Protection",
    description:
      "Resilience of the model when growth stalls, including asset re-deployability and fixed cost exposure.",
    unit: "score",
    bestFor: ["risk-aware founders"],
  },
  {
    id: "upside-potential",
    label: "Upside Potential",
    description: "Magnitude of the opportunity if execution outperforms baseline assumptions.",
    unit: "score",
    bestFor: ["ambitious expansion", "fundraising narratives"],
  },
];
