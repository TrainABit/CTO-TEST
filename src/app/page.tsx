import { ArrowUpRight, BarChart3, PiggyBank, Settings, ShieldCheck } from "lucide-react";

import { SelectedPlansSummary } from "@/components/plans/selected-plans-summary";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { TimeRangeToggle } from "@/components/dashboard/time-range-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    name: "Total portfolio value",
    value: "$132,100",
    change: "+4.2%",
    description: "Month-over-month growth",
    icon: BarChart3,
  },
  {
    name: "Recurring contributions",
    value: "$1,250",
    change: "Next draft: 3 days",
    description: "Across 4 active plans",
    icon: PiggyBank,
  },
  {
    name: "Protection score",
    value: "A-",
    change: "Policy review due",
    description: "Shielded against market swings",
    icon: ShieldCheck,
  },
];

const quickLinks = [
  {
    title: "Plans",
    description: "Manage recurring deposits, contributions, and scheduled adjustments.",
    href: "/plans",
  },
  {
    title: "Investment",
    description: "Review portfolio allocation, rebalance targets, and tax strategy.",
    href: "/investment",
  },
  {
    title: "Tools",
    description: "Access calculators, simulators, and investment research helpers.",
    href: "/tools",
  },
  {
    title: "Settings",
    description: "Update organization details, billing preferences, and notifications.",
    href: "/settings",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="overview-heading" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Overview</p>
            <h1
              id="overview-heading"
              className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Dashboard summary
            </h1>
          </div>
          <TimeRangeToggle />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                Track the cumulative value of your managed assets over time.
              </CardDescription>
            </div>
            <ArrowUpRight className="hidden size-5 text-muted-foreground md:block" />
          </CardHeader>
          <CardContent className="pt-0">
            <PerformanceChart />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="selected-plans-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="selected-plans-heading" className="text-xl font-semibold">
            Selected strategies
          </h2>
          <a
            href="/plans"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-muted-foreground",
            )}
          >
            Manage comparison
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <SelectedPlansSummary />
      </section>

      <section aria-labelledby="insights-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="insights-heading" className="text-xl font-semibold">
            Key allocation insights
          </h2>
          <a
            href="/investment"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1 text-muted-foreground",
            )}
          >
            View detailed analytics
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.name} className="border-dashed">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{item.description}</CardDescription>
                  <CardTitle className="mt-2 text-2xl">{item.value}</CardTitle>
                  <p className="text-sm text-muted-foreground">{item.name}</p>
                </div>
                <item.icon className="size-5 text-primary" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-success">{item.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-links-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="quick-links-heading" className="text-xl font-semibold">
            Quick links
          </h2>
          <Settings className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Card key={link.title} className="transition hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {link.title}
                  <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={link.href} className={cn(buttonVariants({ variant: "link" }), "px-0")}>
                  Manage {link.title.toLowerCase()}
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
