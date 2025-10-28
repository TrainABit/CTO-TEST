"use client";

import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

import { STRATEGIC_PLAN_MAP } from "@/content";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlanPreferenceStore } from "@/store/plan-preferences";
import { cn } from "@/lib/utils";

export function SelectedPlansSummary() {
  const { primaryPlanId, secondaryPlanId, clearSelections } = usePlanPreferenceStore();

  const primaryPlan = primaryPlanId ? STRATEGIC_PLAN_MAP[primaryPlanId] : null;
  const secondaryPlan = secondaryPlanId ? STRATEGIC_PLAN_MAP[secondaryPlanId] : null;
  const hasSelection = Boolean(primaryPlan || secondaryPlan);

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted">
            <Compass className="size-5 text-primary" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">Strategic focus</CardTitle>
            <CardDescription>
              {hasSelection
                ? "These picks sync across Atlas so your team stays aligned on plan priorities."
                : "Lock in your primary and backup plan to sync prioritization across the workspace."}
            </CardDescription>
          </div>
        </div>
        {hasSelection ? (
          <Button variant="outline" size="sm" onClick={clearSelections} className="gap-2">
            <Sparkles className="size-4" aria-hidden="true" />
            Clear selections
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSelection ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {primaryPlan ? (
              <SelectionTile
                label="Primary"
                tone="primary"
                planTitle={primaryPlan.title}
                quote={primaryPlan.subtitle}
              />
            ) : null}
            {secondaryPlan ? (
              <SelectionTile
                label="Backup"
                tone="secondary"
                planTitle={secondaryPlan.title}
                quote={secondaryPlan.subtitle}
              />
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/50 p-6 text-sm text-muted-foreground">
            <p>
              No plans selected yet. Compare the strategies side-by-side to choose a primary
              direction and a contingency option for your mandate.
            </p>
            <Link
              href="/plans"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "self-start")}
            >
              Review plans
            </Link>
          </div>
        )}
        {hasSelection ? (
          <p className="text-xs text-muted-foreground">
            Update your picks anytime from the comparison view. We surface them beside forecasting
            tools and governance workflows so everyone sees the same direction of travel.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SelectionTile({
  label,
  tone,
  planTitle,
  quote,
}: {
  label: string;
  tone: "primary" | "secondary";
  planTitle: string;
  quote: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg border bg-background p-4 shadow-sm">
      <div className="space-y-2">
        <Badge variant={tone === "primary" ? "default" : "secondary"}>{label} plan</Badge>
        <p className="text-base font-semibold text-foreground">{planTitle}</p>
        <p className="text-sm text-muted-foreground">{quote}</p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Visible across dashboards, investment tooling, and governance checklists.
      </p>
    </div>
  );
}
