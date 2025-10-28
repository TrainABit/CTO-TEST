import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PlanDetail from "@/components/PlanDetail";
import { plans } from "@/data/plans";

type PlanPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return plans.map((plan) => ({ id: plan.id }));
}

export function generateMetadata({ params }: PlanPageProps): Metadata {
  const plan = plans.find((candidate) => candidate.id === params.id);

  if (!plan) {
    return {
      title: "Plan not found | Strategic Plan Tracker",
    };
  }

  return {
    title: `${plan.name} | Strategic Plan Tracker`,
    description: plan.description,
  };
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const plan = plans.find((candidate) => candidate.id === params.id) ?? notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <PlanDetail plan={plan} />
    </main>
  );
}
