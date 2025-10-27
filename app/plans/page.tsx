import Link from 'next/link';
import React from 'react';
import { plans } from '@/data/plans';

export const metadata = {
  title: 'Plan comparison | Strategic Plan Tracker',
};

export default function PlansPage() {
  return (
    <main>
      <div className="container">
        <section className="card hero">
          <div>
            <h1>Strategic plans overview</h1>
            <p>
              Compare active transformation plans, review key metrics, and jump into detailed execution
              tracking. Select a plan below to manage checklists, KPIs, risks, and exit readiness.
            </p>
          </div>
          <div className="summary-strip">
            <div className="summary-card">
              <span>Active plans</span>
              <strong>{plans.length}</strong>
            </div>
            <div className="summary-card">
              <span>Phases in motion</span>
              <strong>{plans.reduce((acc, plan) => acc + plan.phases.length, 0)}</strong>
            </div>
            <div className="summary-card">
              <span>Total capital allocated</span>
              <strong>
                {plans
                  .map((plan) => plan.totalBudget)
                  .join(' • ')}
              </strong>
            </div>
          </div>
        </section>

        <section className="plan-cards">
          {plans.map((plan) => (
            <article key={plan.id} className="plan-card">
              <header>
                <h2>{plan.name}</h2>
                <p>{plan.description}</p>
              </header>
              <div className="meta-grid">
                <div className="meta-item">
                  <span>Timeline</span>
                  <strong>{plan.timeline}</strong>
                </div>
                <div className="meta-item">
                  <span>Executive sponsor</span>
                  <strong>{plan.sponsor}</strong>
                </div>
                <div className="meta-item">
                  <span>Strategic theme</span>
                  <strong>{plan.strategicTheme}</strong>
                </div>
                <div className="meta-item">
                  <span>Phases</span>
                  <strong>{plan.phases.length}</strong>
                </div>
              </div>
              <div className="card-footer">
                <div>
                  <div className="small-caps">Focus areas</div>
                  <div className="tag-list">
                    {plan.highlightTags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Link className="button" href={`/plans/${plan.id}`}>
                  View plan detail
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="card table-card">
          <h2 className="section-title">Comparison snapshot</h2>
          <p className="section-subtitle">Key metrics at a glance before diving deeper.</p>
          <div className="divider" />
          <table className="comparison-table">
            <thead>
              <tr>
                <th scope="col">Plan</th>
                <th scope="col">Primary objective</th>
                <th scope="col">Capital allocation</th>
                <th scope="col">Current phase focus</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <Link href={`/plans/${plan.id}`}>{plan.name}</Link>
                  </td>
                  <td>{plan.primaryObjective}</td>
                  <td>{plan.totalBudget}</td>
                  <td>{plan.phases[0]?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
