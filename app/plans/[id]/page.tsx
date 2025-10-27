import React from 'react';
import { notFound } from 'next/navigation';
import { plans } from '@/data/plans';
import PlanDetail from '@/components/PlanDetail';

type PlanPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return plans.map((plan) => ({ id: plan.id }));
}

export function generateMetadata({ params }: PlanPageProps) {
  const plan = plans.find((candidate) => candidate.id === params.id);
  if (!plan) {
    return {
      title: 'Plan not found | Strategic Plan Tracker',
    };
  }

  return {
    title: `${plan.name} | Strategic Plan Tracker`,
    description: plan.description,
  };
}

export default function PlanDetailPage({ params }: PlanPageProps) {
  const plan = plans.find((candidate) => candidate.id === params.id);
  if (!plan) {
    notFound();
  }

  return (
    <main>
      <div className="container">
        <PlanDetail plan={plan} />
      </div>
    </main>
  );
}
