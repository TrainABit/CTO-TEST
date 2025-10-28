'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plan,
  PlanPhase,
  PlanPhaseKpi,
  ExitChecklistItem,
  RiskTemplate,
  ChecklistTemplateItem,
} from '@/content/plans';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

type ChecklistItem = ChecklistTemplateItem & {
  completed: boolean;
  title: string;
  owner: string;
  dueDate: string;
};

type RiskEntry = RiskTemplate;

type KpiHistoryPoint = {
  timestamp: string;
  value: number;
};

type KpiValueState = {
  current: number | null;
  history: KpiHistoryPoint[];
  isMock: boolean;
};

type ExitReadinessState = {
  completed: boolean;
  notes: string;
};

type PlanPersistentState = {
  checklists: Record<string, ChecklistItem[]>;
  kpiValues: Record<string, KpiValueState>;
  notes: string;
  risks: RiskEntry[];
  exitReadiness: Record<string, ExitReadinessState>;
};

type ExtendedPlanPhaseKpi = PlanPhaseKpi & {
  phaseId: string;
  phaseName: string;
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

function createChecklistFromTemplate(template: ChecklistTemplateItem[]): ChecklistItem[] {
  return template.map((item) => ({
    ...item,
    completed: false,
    owner: item.owner || 'You',
    title: item.title,
    dueDate: item.dueDate,
  }));
}

function createMockHistory(values: number[]): KpiHistoryPoint[] {
  const now = Date.now();
  return values.map((value, index, array) => {
    const weeksFromNow = array.length - 1 - index;
    const timestamp = new Date(now - weeksFromNow * 7 * 24 * 60 * 60 * 1000).toISOString();
    return { timestamp, value };
  });
}

function createDefaultState(plan: Plan, kpis: ExtendedPlanPhaseKpi[]): PlanPersistentState {
  const checklists = Object.fromEntries(
    plan.phases.map((phase) => [phase.id, createChecklistFromTemplate(phase.checklist)]),
  );

  const kpiValues = Object.fromEntries(
    kpis.map((kpi) => {
      const history = createMockHistory(kpi.mockHistory);
      const lastValue = history.length ? history[history.length - 1] : undefined;
      return [
        kpi.id,
        {
          current: lastValue ? lastValue.value : null,
          history,
          isMock: true,
        } satisfies KpiValueState,
      ];
    }),
  );

  const exitReadiness = Object.fromEntries(
    plan.exitChecklist.map((item) => [
      item.id,
      {
        completed: false,
        notes: '',
      } satisfies ExitReadinessState,
    ]),
  );

  const risks = plan.baselineRisks.map((risk) => ({ ...risk }));

  return {
    checklists,
    kpiValues,
    notes: '',
    risks,
    exitReadiness,
  } satisfies PlanPersistentState;
}

function ensureChecklistIntegrity(
  desired: ChecklistItem[],
  fallback: ChecklistItem[],
): ChecklistItem[] {
  if (!Array.isArray(desired) || !desired.length) {
    return fallback.map((item) => ({ ...item }));
  }

  const byId = new Map(desired.map((item) => [item.id, item]));

  const merged = fallback.map((template) => {
    const existing = byId.get(template.id);
    if (existing) {
      return {
        ...template,
        ...existing,
        completed: Boolean(existing.completed),
        owner: existing.owner || template.owner || 'You',
        title: existing.title || template.title,
        dueDate: existing.dueDate || template.dueDate || '',
      };
    }
    return {
      ...template,
      completed: false,
      owner: template.owner || 'You',
      title: template.title,
      dueDate: template.dueDate,
    };
  });

  desired.forEach((item) => {
    if (!fallback.some((template) => template.id === item.id)) {
      merged.push({
        ...item,
        completed: Boolean(item.completed),
        owner: item.owner || 'You',
        title: item.title || 'Checklist item',
        dueDate: item.dueDate || '',
      });
    }
  });

  return merged;
}

function mergeState(
  current: PlanPersistentState | undefined,
  defaults: PlanPersistentState,
  kpis: ExtendedPlanPhaseKpi[],
): PlanPersistentState {
  const base = current ?? defaults;

  const checklists = Object.fromEntries(
    Object.entries(defaults.checklists).map(([phaseId, defaultList]) => [
      phaseId,
      ensureChecklistIntegrity(base.checklists?.[phaseId] ?? defaultList, defaultList),
    ]),
  );

  const exitReadiness = Object.fromEntries(
    Object.entries(defaults.exitReadiness).map(([itemId, defaultEntry]) => [
      itemId,
      {
        completed: base.exitReadiness?.[itemId]?.completed ?? defaultEntry.completed,
        notes: base.exitReadiness?.[itemId]?.notes ?? defaultEntry.notes,
      },
    ]),
  );

  const kpiValues = Object.fromEntries(
    kpis.map((kpi) => {
      const defaultValue = defaults.kpiValues[kpi.id];
      const currentValue = base.kpiValues?.[kpi.id];
      if (!currentValue) {
        return [kpi.id, { ...defaultValue }];
      }

      return [
        kpi.id,
        {
          current:
            currentValue.current !== undefined && currentValue.current !== null
              ? currentValue.current
              : defaultValue.current,
          history:
            Array.isArray(currentValue.history) && currentValue.history.length
              ? currentValue.history.map((point) => ({ ...point }))
              : defaultValue.history.map((point) => ({ ...point })),
          isMock:
            currentValue.isMock !== undefined ? currentValue.isMock : defaultValue.isMock,
        },
      ];
    }),
  );

  const risks = (base.risks && base.risks.length
    ? base.risks
    : defaults.risks
  ).map((risk) => ({ ...risk }));

  return {
    checklists,
    kpiValues,
    notes: base.notes ?? defaults.notes,
    risks,
    exitReadiness,
  } satisfies PlanPersistentState;
}

function formatDate(value: string): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return dateFormatter.format(parsed);
}

function formatShortDate(value: string): string {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return shortDateFormatter.format(parsed);
}

function formatRelative(timestamp?: string): string {
  if (!timestamp) {
    return '';
  }
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return dateFormatter.format(parsed);
}

function randomId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${random}`;
}

function getActualValue(state: KpiValueState | undefined): number | null {
  if (!state) {
    return null;
  }
  if (state.current !== null && state.current !== undefined) {
    return state.current;
  }
  const last = state.history[state.history.length - 1];
  return last ? last.value : null;
}

type SummaryMetrics = {
  totalTasks: number;
  completedTasks: number;
  progress: number;
  nextDue:
    | {
        title: string;
        dueDate: string;
        phaseName: string;
      }
    | null;
  exitReady: number;
  exitTotal: number;
  kpiOnTrack: number;
  kpiTotal: number;
};

function computeSummary(
  plan: Plan,
  state: PlanPersistentState,
  kpis: ExtendedPlanPhaseKpi[],
): SummaryMetrics {
  let totalTasks = 0;
  let completedTasks = 0;
  let nextDue: SummaryMetrics['nextDue'] = null;

  plan.phases.forEach((phase) => {
    const items = state.checklists[phase.id] ?? [];
    totalTasks += items.length;
    items.forEach((item) => {
      if (item.completed) {
        completedTasks += 1;
      } else if (item.dueDate) {
        const dueDate = new Date(item.dueDate);
        if (!Number.isNaN(dueDate.getTime())) {
          if (!nextDue || dueDate.getTime() < new Date(nextDue.dueDate).getTime()) {
            nextDue = {
              title: item.title,
              dueDate: item.dueDate,
              phaseName: phase.name,
            };
          }
        }
      }
    });
  });

  const exitEntries = Object.values(state.exitReadiness);
  const exitReady = exitEntries.filter((entry) => entry.completed).length;
  const exitTotal = exitEntries.length;

  let kpiOnTrack = 0;
  kpis.forEach((kpi) => {
    const actual = getActualValue(state.kpiValues[kpi.id]);
    if (actual === null) {
      return;
    }
    const onTrack =
      kpi.direction === 'increase' ? actual >= kpi.target : actual <= kpi.target;
    if (onTrack) {
      kpiOnTrack += 1;
    }
  });

  return {
    totalTasks,
    completedTasks,
    progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    nextDue,
    exitReady,
    exitTotal,
    kpiOnTrack,
    kpiTotal: kpis.length,
  };
}

type PlanDetailProps = {
  plan: Plan;
};

const PlanDetail: React.FC<PlanDetailProps> = ({ plan }) => {
  const kpiCatalog = useMemo<ExtendedPlanPhaseKpi[]>(
    () =>
      plan.phases.flatMap((phase) =>
        phase.kpis.map((kpi) => ({
          ...kpi,
          phaseId: phase.id,
          phaseName: phase.name,
        })),
      ),
    [plan.phases],
  );

  const defaultState = useMemo(() => createDefaultState(plan, kpiCatalog), [plan, kpiCatalog]);

  const [storedState, setStoredState] = useLocalStorageState<PlanPersistentState>(
    `plan-state-${plan.id}`,
    defaultState,
  );

  const mergedState = useMemo(
    () => mergeState(storedState, defaultState, kpiCatalog),
    [storedState, defaultState, kpiCatalog],
  );

  const updateState = useCallback(
    (mutation: (state: PlanPersistentState) => PlanPersistentState) => {
      setStoredState((previous) => {
        const base = mergeState(previous, defaultState, kpiCatalog);
        return mutation(base);
      });
    },
    [setStoredState, defaultState, kpiCatalog],
  );

  const summary = useMemo(
    () => computeSummary(plan, mergedState, kpiCatalog),
    [plan, mergedState, kpiCatalog],
  );

  const handleChecklistUpdate = useCallback(
    (phaseId: string, items: ChecklistItem[]) => {
      updateState((state) => ({
        ...state,
        checklists: {
          ...state.checklists,
          [phaseId]: items,
        },
      }));
    },
    [updateState],
  );

  const handleKpiValueChange = useCallback(
    (kpiId: string, rawValue: string) => {
      updateState((state) => {
        const existing = state.kpiValues[kpiId];
        if (!existing) {
          return state;
        }

        if (rawValue.trim() === '') {
          if (existing.current === null) {
            return state;
          }
          return {
            ...state,
            kpiValues: {
              ...state.kpiValues,
              [kpiId]: {
                ...existing,
                current: null,
              },
            },
          };
        }

        const numeric = Number(rawValue);
        if (Number.isNaN(numeric)) {
          return state;
        }

        if (!existing.isMock && existing.current === numeric) {
          return state;
        }

        const history = existing.isMock
          ? []
          : [...existing.history.filter((point) => Number.isFinite(point.value))];

        return {
          ...state,
          kpiValues: {
            ...state.kpiValues,
            [kpiId]: {
              current: numeric,
              isMock: false,
              history: [...history, { timestamp: new Date().toISOString(), value: numeric }],
            },
          },
        };
      });
    },
    [updateState],
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      updateState((state) => ({
        ...state,
        notes,
      }));
    },
    [updateState],
  );

  const handleRisksChange = useCallback(
    (risks: RiskEntry[]) => {
      updateState((state) => ({
        ...state,
        risks,
      }));
    },
    [updateState],
  );

  const handleExitReadinessChange = useCallback(
    (itemId: string, entry: ExitReadinessState) => {
      updateState((state) => ({
        ...state,
        exitReadiness: {
          ...state.exitReadiness,
          [itemId]: entry,
        },
      }));
    },
    [updateState],
  );

  return (
    <div className="plan-detail">
      <div className="top-nav">
        <Link className="back-link" href="/plans">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="16" height="16">
            <path
              d="M14 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          Back to comparison
        </Link>
        <span>{plan.timeline}</span>
      </div>

      <section className="card plan-head">
        <div>
          <div className="badge">Strategic plan</div>
          <h1>{plan.name}</h1>
          <p>{plan.description}</p>
          <div className="subtle-text" style={{ marginTop: '0.25rem' }}>
            Primary objective: {plan.primaryObjective}
          </div>
          <div className="tag-list">
            {plan.highlightTags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="meta-grid">
          <div className="meta-item">
            <span>Sponsor</span>
            <strong>{plan.sponsor}</strong>
          </div>
          <div className="meta-item">
            <span>Strategic theme</span>
            <strong>{plan.strategicTheme}</strong>
          </div>
          <div className="meta-item">
            <span>Capital allocation</span>
            <strong>{plan.totalBudget}</strong>
          </div>
          <div className="meta-item">
            <span>Phases</span>
            <strong>{plan.phases.length}</strong>
          </div>
        </div>
      </section>

      <div className="summary-strip">
        <div className="summary-card">
          <span>Checklist completion</span>
          <strong>{summary.progress}%</strong>
          <div className="subtle-text">
            {summary.completedTasks} of {summary.totalTasks} tasks complete
          </div>
        </div>
        <div className="summary-card">
          <span>Next due</span>
          <strong>
            {summary.nextDue
              ? `${summary.nextDue.phaseName}: ${formatShortDate(summary.nextDue.dueDate)}`
              : 'All tasks clear'}
          </strong>
          <div className="subtle-text">
            {summary.nextDue ? summary.nextDue.title : 'No outstanding checklist items.'}
          </div>
        </div>
        <div className="summary-card">
          <span>Exit readiness</span>
          <strong>
            {summary.exitReady} of {summary.exitTotal}
          </strong>
          <div className="subtle-text">
            KPI health: {summary.kpiOnTrack} / {summary.kpiTotal} on target
          </div>
        </div>
      </div>

      <section className="phase-grid">
        {plan.phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            checklistItems={mergedState.checklists[phase.id] ?? []}
            onChecklistChange={(items) => handleChecklistUpdate(phase.id, items)}
          />
        ))}
      </section>

      <section className="card kpi-section" aria-labelledby="kpi-dashboard-heading">
        <div>
          <h2 id="kpi-dashboard-heading" className="section-title">
            KPI dashboard
          </h2>
          <p className="section-subtitle">
            Track progress against plan targets, capture actuals, and monitor the trajectory once real values
            are entered.
          </p>
        </div>
        <KpiDashboard
          kpis={kpiCatalog}
          states={mergedState.kpiValues}
          onValueChange={handleKpiValueChange}
        />
      </section>

      <div className="grid-responsive">
        <section className="card notes-area" aria-labelledby="notes-heading">
          <h2 id="notes-heading" className="section-title">
            Notes & decisions
          </h2>
          <p className="section-subtitle">
            Keep a running log of steering committee notes, decisions, and context for the plan team.
          </p>
          <textarea
            aria-label="Plan notes"
            placeholder="Capture steering notes, decisions, and context..."
            value={mergedState.notes}
            onChange={(event) => handleNotesChange(event.target.value)}
          />
        </section>

        <section className="card" aria-labelledby="risk-register-heading">
          <div>
            <h2 id="risk-register-heading" className="section-title">
              Risk register
            </h2>
            <p className="section-subtitle">
              Track mitigation owners and status. Updates persist locally for quick follow-up.
            </p>
          </div>
          <RiskRegister risks={mergedState.risks} onChange={handleRisksChange} />
        </section>
      </div>

      <section className="card" aria-labelledby="exit-readiness-heading">
        <div>
          <h2 id="exit-readiness-heading" className="section-title">
            Exit readiness checklist
          </h2>
          <p className="section-subtitle">
            Ensure the plan can transition to steady-state operations. Toggle readiness and keep supporting
            notes.
          </p>
        </div>
        <ExitReadiness
          items={plan.exitChecklist}
          state={mergedState.exitReadiness}
          onChange={handleExitReadinessChange}
        />
      </section>
    </div>
  );
};

export default PlanDetail;

type PhaseCardProps = {
  phase: PlanPhase;
  checklistItems: ChecklistItem[];
  onChecklistChange: (items: ChecklistItem[]) => void;
};

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, checklistItems, onChecklistChange }) => {
  const [newItem, setNewItem] = useState({
    title: '',
    owner: 'You',
    dueDate: '',
  });

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const total = checklistItems.length || 1;
  const progress = Math.round((completedCount / total) * 100);

  const upcoming = useMemo(() => {
    const pendingWithDates = checklistItems
      .filter((item) => !item.completed && item.dueDate)
      .map((item) => ({ item, date: new Date(item.dueDate) }))
      .filter(({ date }) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return pendingWithDates.length ? pendingWithDates[0].item : null;
  }, [checklistItems]);

  const updateItem = useCallback(
    (itemId: string, updates: Partial<ChecklistItem>) => {
      const next = checklistItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...updates,
            }
          : item,
      );
      onChecklistChange(next);
    },
    [checklistItems, onChecklistChange],
  );

  const handleAddItem = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newItem.title.trim()) {
        return;
      }
      const nextItem: ChecklistItem = {
        id: randomId(`${phase.id}-task`),
        title: newItem.title.trim(),
        owner: newItem.owner.trim() || 'You',
        dueDate: newItem.dueDate,
        completed: false,
      };
      onChecklistChange([...checklistItems, nextItem]);
      setNewItem({ title: '', owner: newItem.owner, dueDate: '' });
    },
    [checklistItems, newItem, onChecklistChange, phase.id],
  );

  const handleResetChecklist = useCallback(() => {
    onChecklistChange(createChecklistFromTemplate(phase.checklist));
  }, [onChecklistChange, phase.checklist]);

  return (
    <article className="card phase-card">
      <header>
        <div className="badge">Phase</div>
        <h2>{phase.name}</h2>
        <p>{phase.summary}</p>
      </header>

      <div className="meta-grid" style={{ marginBottom: '1rem' }}>
        <div className="meta-item">
          <span>Start</span>
          <strong>{formatDate(phase.timeline.start)}</strong>
        </div>
        <div className="meta-item">
          <span>Finish</span>
          <strong>{formatDate(phase.timeline.end)}</strong>
        </div>
        <div className="meta-item">
          <span>Capital allocation</span>
          <strong>{phase.capitalAllocation.total}</strong>
        </div>
        <div className="meta-item">
          <span>Key milestone</span>
          <strong>{phase.timeline.keyMilestones[0]}</strong>
        </div>
      </div>

      <div>
        <h3 className="section-title" style={{ fontSize: '1.05rem' }}>
          Objectives
        </h3>
        <ul>
          {phase.objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div className="small-caps">Capital breakdown</div>
        <div className="tag-list">
          {phase.capitalAllocation.breakdown.map((item) => (
            <span key={item} className="tag">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div className="small-caps">Key milestones</div>
        <div className="tag-list">
          {phase.timeline.keyMilestones.map((milestone) => (
            <span key={milestone} className="tag">
              {milestone}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="small-caps">Phase KPIs</div>
        <ul>
          {phase.kpis.map((kpi) => (
            <li key={kpi.id}>
              <strong>{kpi.name}</strong> — Target: {kpi.target} {kpi.unit} ({
                kpi.direction === 'increase' ? '↑ increase' : '↓ decrease'
              })
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="small-caps">Risks</div>
        <ul>
          {phase.risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="small-caps">Kill criteria</div>
        <ul>
          {phase.killCriteria.map((criteria) => (
            <li key={criteria}>{criteria}</li>
          ))}
        </ul>
      </div>

      <div className="checklist" role="region" aria-label={`${phase.name} checklist`}>
        <div className="checklist-header">
          <div>
            <h3 style={{ margin: 0 }}>Execution checklist</h3>
            <div className="progress-meta">
              <span>{completedCount} completed</span>
              <span>
                {upcoming
                  ? `Next: ${upcoming.title} (${formatShortDate(upcoming.dueDate)})`
                  : 'All tasks complete'}
              </span>
            </div>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="subtle-text">{progress}% complete</div>
          </div>
        </div>

        <div className="checklist-items">
          {checklistItems.length ? (
            checklistItems.map((item) => (
              <div key={item.id} className="checklist-row">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => updateItem(item.id, { completed: !item.completed })}
                  aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                />
                <div>
                  <label className="task-title" htmlFor={`${phase.id}-${item.id}-title`}>
                    Task title
                  </label>
                  <input
                    id={`${phase.id}-${item.id}-title`}
                    type="text"
                    value={item.title}
                    onChange={(event) => updateItem(item.id, { title: event.target.value })}
                  />
                  <div className="inline-inputs">
                    <label htmlFor={`${phase.id}-${item.id}-owner`}>
                      Owner
                      <input
                        id={`${phase.id}-${item.id}-owner`}
                        type="text"
                        value={item.owner}
                        onChange={(event) => updateItem(item.id, { owner: event.target.value })}
                      />
                    </label>
                    <label htmlFor={`${phase.id}-${item.id}-due`}>
                      Due date
                      <input
                        id={`${phase.id}-${item.id}-due`}
                        type="date"
                        value={item.dueDate ?? ''}
                        onChange={(event) => updateItem(item.id, { dueDate: event.target.value })}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No checklist items yet.</div>
          )}
        </div>

        <form className="checklist-form" onSubmit={handleAddItem}>
          <label htmlFor={`${phase.id}-new-title`}>
            Task
            <input
              id={`${phase.id}-new-title`}
              type="text"
              placeholder="Add a new actionable"
              value={newItem.title}
              onChange={(event) => setNewItem((prev) => ({ ...prev, title: event.target.value }))}
            />
          </label>
          <label htmlFor={`${phase.id}-new-owner`}>
            Owner
            <input
              id={`${phase.id}-new-owner`}
              type="text"
              value={newItem.owner}
              onChange={(event) => setNewItem((prev) => ({ ...prev, owner: event.target.value }))}
            />
          </label>
          <label htmlFor={`${phase.id}-new-due`}>
            Due date
            <input
              id={`${phase.id}-new-due`}
              type="date"
              value={newItem.dueDate}
              onChange={(event) => setNewItem((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
          </label>
          <button type="submit" className="button secondary">
            Add item
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={handleResetChecklist}
            style={{ marginLeft: '0.5rem' }}
          >
            Reset to template
          </button>
        </form>
      </div>
    </article>
  );
};

type KpiDashboardProps = {
  kpis: ExtendedPlanPhaseKpi[];
  states: Record<string, KpiValueState>;
  onValueChange: (id: string, rawValue: string) => void;
};

const KpiDashboard: React.FC<KpiDashboardProps> = ({ kpis, states, onValueChange }) => {
  if (!kpis.length) {
    return <div className="empty-state">No KPIs have been configured for this plan yet.</div>;
  }

  return (
    <div className="kpi-grid">
      {kpis.map((kpi) => {
        const state = states[kpi.id];
        const actual = getActualValue(state);
        const variance = actual === null ? null : computeVariance(kpi, actual);
        const lastUpdate = state?.history[state.history.length - 1];

        return (
          <article key={kpi.id} className="kpi-card" aria-labelledby={`kpi-${kpi.id}`}>
            <header>
              <span className="pill">{kpi.phaseName}</span>
              <h3 id={`kpi-${kpi.id}`}>{kpi.name}</h3>
              <span>{kpi.description}</span>
            </header>
            <div className="kpi-metrics">
              <div className="metric">
                <div className="label">Target</div>
                <div className="value">
                  {numberFormatter.format(kpi.target)} {kpi.unit}
                </div>
              </div>
              <div className="metric">
                <div className="label">Current</div>
                <div className="value">
                  {actual === null ? '—' : `${numberFormatter.format(actual)} ${kpi.unit}`}
                </div>
                <div className={`delta ${variance ? (variance.positive ? 'positive' : 'negative') : ''}`}>
                  {variance ? variance.label : 'Set a value'}
                </div>
              </div>
            </div>
            <Sparkline history={state?.history ?? []} />
            <div className="kpi-input">
              <label htmlFor={`kpi-input-${kpi.id}`}>Update current value</label>
              <input
                id={`kpi-input-${kpi.id}`}
                type="number"
                step="any"
                value={state?.current ?? ''}
                onChange={(event) => onValueChange(kpi.id, event.target.value)}
                aria-describedby={`kpi-help-${kpi.id}`}
              />
              <div id={`kpi-help-${kpi.id}`} className="subtle-text">
                {state?.isMock
                  ? 'Showing mock trend until you enter your measurements.'
                  : lastUpdate
                  ? `Last updated ${formatRelative(lastUpdate.timestamp)}`
                  : 'Enter a value to start tracking history.'}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

type SparklineProps = {
  history: KpiHistoryPoint[];
};

const Sparkline: React.FC<SparklineProps> = ({ history }) => {
  if (!history.length) {
    return <div className="empty-state">No trend yet</div>;
  }

  const values = history.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = history.map((point, index) => {
    const x = history.length === 1 ? 50 : (index / (history.length - 1)) * 100;
    const y = 100 - ((point.value - min) / range) * 100;
    return { x, y };
  });

  const pointString = points.map((point) => `${point.x},${point.y}`).join(' ');
  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox="0 0 100 100" className="sparkline" role="presentation" aria-hidden="true">
      <polyline points={pointString} fill="none" />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={2.8}
        fill="var(--accent-strong)"
        stroke="var(--surface)"
        strokeWidth="1.2"
      />
    </svg>
  );
};

function computeVariance(kpi: ExtendedPlanPhaseKpi, actual: number) {
  if (Number.isNaN(actual)) {
    return null;
  }

  const difference =
    kpi.direction === 'increase' ? actual - kpi.target : kpi.target - actual;
  const positive = difference >= 0;
  const abs = Math.abs(difference);

  if (abs < 0.0001) {
    return {
      label: 'On target',
      positive: true,
    };
  }

  return {
    label: `${positive ? '+' : '−'}${numberFormatter.format(abs)} ${kpi.unit}`,
    positive,
  };
}

type RiskRegisterProps = {
  risks: RiskEntry[];
  onChange: (risks: RiskEntry[]) => void;
};

const RiskRegister: React.FC<RiskRegisterProps> = ({ risks, onChange }) => {
  const handleFieldChange = useCallback(
    (riskId: string, updates: Partial<RiskEntry>) => {
      onChange(
        risks.map((risk) =>
          risk.id === riskId
            ? {
                ...risk,
                ...updates,
              }
            : risk,
        ),
      );
    },
    [onChange, risks],
  );

  const handleAddRisk = useCallback(() => {
    const newRisk: RiskEntry = {
      id: randomId('risk'),
      title: 'New risk',
      owner: 'Assign owner',
      mitigation: '',
      status: 'Open',
      notes: '',
    };
    onChange([...risks, newRisk]);
  }, [onChange, risks]);

  const handleRemoveRisk = useCallback(
    (riskId: string) => {
      onChange(risks.filter((risk) => risk.id !== riskId));
    },
    [onChange, risks],
  );

  return (
    <div className="risk-table">
      {risks.map((risk) => (
        <div key={risk.id} className="risk-row">
          <div>
            <label htmlFor={`${risk.id}-title`} className="small-caps">
              Risk
            </label>
            <input
              id={`${risk.id}-title`}
              type="text"
              value={risk.title}
              onChange={(event) => handleFieldChange(risk.id, { title: event.target.value })}
            />
            <div className="inline-inputs" style={{ marginTop: '0.65rem' }}>
              <label htmlFor={`${risk.id}-owner`}>
                Owner
                <input
                  id={`${risk.id}-owner`}
                  type="text"
                  value={risk.owner}
                  onChange={(event) => handleFieldChange(risk.id, { owner: event.target.value })}
                />
              </label>
              <label htmlFor={`${risk.id}-status`}>
                Status
                <select
                  id={`${risk.id}-status`}
                  value={risk.status}
                  onChange={(event) =>
                    handleFieldChange(risk.id, {
                      status: event.target.value as RiskEntry['status'],
                    })
                  }
                >
                  <option value="Open">Open</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Mitigated">Mitigated</option>
                </select>
              </label>
            </div>
          </div>
          <div>
            <label htmlFor={`${risk.id}-mitigation`} className="small-caps">
              Mitigation plan
            </label>
            <textarea
              id={`${risk.id}-mitigation`}
              value={risk.mitigation}
              onChange={(event) => handleFieldChange(risk.id, { mitigation: event.target.value })}
              placeholder="Outline mitigation steps..."
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label htmlFor={`${risk.id}-notes`} className="small-caps">
              Notes & watch items
            </label>
            <textarea
              id={`${risk.id}-notes`}
              value={risk.notes}
              onChange={(event) => handleFieldChange(risk.id, { notes: event.target.value })}
              placeholder="Add observations or follow-up actions..."
            />
          </div>
          <div className="risk-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="button secondary" onClick={() => handleRemoveRisk(risk.id)}>
              Remove risk
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="button secondary" onClick={handleAddRisk}>
        Add risk entry
      </button>
    </div>
  );
};

type ExitReadinessProps = {
  items: ExitChecklistItem[];
  state: Record<string, ExitReadinessState>;
  onChange: (itemId: string, entry: ExitReadinessState) => void;
};

const ExitReadiness: React.FC<ExitReadinessProps> = ({ items, state, onChange }) => {
  return (
    <div className="exit-grid">
      {items.map((item) => {
        const entry = state[item.id] ?? { completed: false, notes: '' };
        const readyClass = entry.completed ? 'ready' : 'pending';
        return (
          <div key={item.id} className="exit-item">
            <header>
              <div className={`status-pill ${readyClass}`}>
                {entry.completed ? 'Ready' : 'Pending'}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </header>
            <div className="checkbox-row">
              <input
                id={`${item.id}-toggle`}
                type="checkbox"
                checked={entry.completed}
                onChange={(event) =>
                  onChange(item.id, {
                    ...entry,
                    completed: event.target.checked,
                  })
                }
              />
              <label htmlFor={`${item.id}-toggle`}>Ready for exit</label>
            </div>
            <label htmlFor={`${item.id}-notes`} className="small-caps">
              Notes & proof points
            </label>
            <textarea
              id={`${item.id}-notes`}
              value={entry.notes}
              onChange={(event) =>
                onChange(item.id, {
                  ...entry,
                  notes: event.target.value,
                })
              }
              placeholder="Add supporting evidence or open actions..."
            />
          </div>
        );
      })}
    </div>
  );
};
