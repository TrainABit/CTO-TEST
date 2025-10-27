import { FormEvent, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatCurrency } from '../utils/format';
import { collectValidationErrors, toNumber, validateNumeric } from '../utils/validation';

const DEALFLOW_STORAGE_KEY = 'dealflow-pipeline-v1';

export type DealStage = 'Sourcing' | 'Diligence' | 'Offer' | 'Closed';

type DealRecord = {
  id: string;
  name: string;
  stage: DealStage;
  value: number | null;
  notes: string;
  updatedAt: string;
};

type DealFormState = {
  name: string;
  stage: DealStage;
  value: string;
  notes: string;
};

const defaultForm: DealFormState = {
  name: '',
  stage: 'Sourcing',
  value: '',
  notes: '',
};

const STAGES: DealStage[] = ['Sourcing', 'Diligence', 'Offer', 'Closed'];

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export function DealFlowTracker() {
  const [deals, setDeals] = useLocalStorage<DealRecord[]>(DEALFLOW_STORAGE_KEY, []);
  const [form, setForm] = useState<DealFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedValue = form.value.trim().length ? toNumber(form.value) : null;

    const errors = collectValidationErrors([
      form.name.trim().length === 0 ? 'Opportunity name is required.' : null,
      parsedValue !== null ? validateNumeric(parsedValue, { fieldLabel: 'Deal value', allowZero: true }) : null,
    ]);

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const timestamp = new Date().toISOString();

    if (editingId) {
      setDeals((current) =>
        current.map((deal) =>
          deal.id === editingId
            ? {
                ...deal,
                name: form.name.trim(),
                stage: form.stage,
                value: parsedValue,
                notes: form.notes.trim(),
                updatedAt: timestamp,
              }
            : deal
        )
      );
    } else {
      setDeals((current) => [
        ...current,
        {
          id: generateId(),
          name: form.name.trim(),
          stage: form.stage,
          value: parsedValue,
          notes: form.notes.trim(),
          updatedAt: timestamp,
        },
      ]);
    }

    setFormErrors([]);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (deal: DealRecord) => {
    setForm({
      name: deal.name,
      stage: deal.stage,
      value: deal.value ? String(deal.value) : '',
      notes: deal.notes,
    });
    setEditingId(deal.id);
  };

  const handleDelete = (dealId: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Remove this opportunity from the pipeline?');
      if (!confirmed) {
        return;
      }
    }

    setDeals((current) => current.filter((deal) => deal.id !== dealId));

    if (editingId === dealId) {
      setForm(defaultForm);
      setEditingId(null);
    }
  };

  const updateStageInline = (dealId: string, stage: DealStage) => {
    setDeals((current) =>
      current.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              stage,
              updatedAt: new Date().toISOString(),
            }
          : deal
      )
    );
  };

  const updateNotesInline = (dealId: string, notes: string) => {
    setDeals((current) =>
      current.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              notes,
              updatedAt: new Date().toISOString(),
            }
          : deal
      )
    );
  };

  const groupedDeals = useMemo(() => {
    return STAGES.reduce<Record<DealStage, DealRecord[]>>(
      (acc, stage) => {
        acc[stage] = deals.filter((deal) => deal.stage === stage);
        return acc;
      },
      {
        Sourcing: [],
        Diligence: [],
        Offer: [],
        Closed: [],
      }
    );
  }, [deals]);

  return (
    <section id="dealflow" className="dealflow-section">
      <div className="dealflow-header">
        <div>
          <h2>Deal Flow Tracker</h2>
          <p>Track sourcing through close with persistent notes across stages.</p>
        </div>
        <div className="view-toggle" role="group" aria-label="Change deal tracker view">
          <button type="button" className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>
            Kanban
          </button>
          <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            List
          </button>
        </div>
      </div>

      <form className="deal-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="deal-name">Opportunity</label>
            <input
              id="deal-name"
              name="deal-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Company or asset"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="deal-stage">Stage</label>
            <select
              id="deal-stage"
              name="deal-stage"
              value={form.stage}
              onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as DealStage }))}
            >
              {STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="deal-value">Estimated value (USD)</label>
            <input
              id="deal-value"
              name="deal-value"
              value={form.value}
              onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
              placeholder="Optional — e.g. 4500000"
            />
          </div>
          <div className="form-field" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="deal-notes">Notes</label>
            <textarea
              id="deal-notes"
              name="deal-notes"
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Key diligence considerations, ownership structure, timing..."
            />
          </div>
        </div>
        {formErrors.length > 0 ? (
          <div className="alert alert--error" role="alert">
            <strong>Review required:</strong>
            <ul>
              {formErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="deal-form__actions">
          {editingId ? (
            <button type="button" className="button-secondary" onClick={() => { setForm(defaultForm); setEditingId(null); }}>
              Cancel edit
            </button>
          ) : null}
          <button type="submit" className="button-primary">
            {editingId ? 'Update opportunity' : 'Add opportunity'}
          </button>
        </div>
      </form>

      {deals.length === 0 ? (
        <div className="empty-state">Add your first opportunity to start visualizing the pipeline.</div>
      ) : view === 'list' ? (
        <table className="deal-table">
          <thead>
            <tr>
              <th>Opportunity</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Notes</th>
              <th>Last updated</th>
              <th aria-label="Deal actions" />
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td>{deal.name}</td>
                <td>
                  <span className="tag">{deal.stage}</span>
                </td>
                <td>{deal.value !== null ? formatCurrency(deal.value) : '—'}</td>
                <td>{deal.notes || '—'}</td>
                <td>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(deal.updatedAt))}</td>
                <td>
                  <div className="action-buttons">
                    <button type="button" data-variant="edit" onClick={() => handleEdit(deal)}>
                      Edit
                    </button>
                    <button type="button" data-variant="delete" onClick={() => handleDelete(deal.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="kanban" role="list">
          {STAGES.map((stage) => (
            <div key={stage} className="kanban-column">
              <h3>
                {stage}
                <span className="chip">{groupedDeals[stage].length}</span>
              </h3>
              {groupedDeals[stage].length === 0 ? (
                <div className="empty-state" role="listitem">
                  {stage === 'Sourcing' ? 'Generate leads to populate the funnel.' : 'Nothing here yet.'}
                </div>
              ) : (
                groupedDeals[stage].map((deal) => (
                  <article key={deal.id} className="kanban-card" role="listitem">
                    <header>
                      <strong>{deal.name}</strong>
                      {deal.value !== null ? <div className="chip">{formatCurrency(deal.value)}</div> : null}
                    </header>
                    <label>
                      Stage
                      <select value={deal.stage} onChange={(event) => updateStageInline(deal.id, event.target.value as DealStage)}>
                        {STAGES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notes
                      <textarea value={deal.notes} onChange={(event) => updateNotesInline(deal.id, event.target.value)} />
                    </label>
                    <footer className="action-buttons">
                      <button type="button" data-variant="edit" onClick={() => handleEdit(deal)}>
                        Edit
                      </button>
                      <button type="button" data-variant="delete" onClick={() => handleDelete(deal.id)}>
                        Remove
                      </button>
                    </footer>
                  </article>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
