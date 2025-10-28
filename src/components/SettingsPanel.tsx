import { FormEvent, useEffect, useState } from 'react';
import { useAppSettings } from '../context/AppSettingsContext';

export function SettingsPanel() {
  const { settings, setPersistenceEnabled, updateDefaultDiscountRate, clearAllData, exportSnapshot, importSnapshot } =
    useAppSettings();

  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<null | { type: 'success' | 'error'; message: string }>(null);
  const [discountRateInput, setDiscountRateInput] = useState(() => String(settings.defaultDiscountRate));
  const [isCopySupported, setIsCopySupported] = useState(false);

  useEffect(() => {
    setDiscountRateInput(String(settings.defaultDiscountRate));
  }, [settings.defaultDiscountRate]);

  useEffect(() => {
    setIsCopySupported(typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function');
  }, []);

  const handleTogglePersistence = (event: FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    setPersistenceEnabled(target.checked);
    setFeedback({
      type: 'success',
      message: target.checked
        ? 'Local persistence enabled. Data will be written to localStorage.'
        : 'Local persistence disabled. Data will stay in-memory for this session.',
    });
  };

  const handleDiscountCommit = () => {
    const parsed = Number.parseFloat(discountRateInput);
    updateDefaultDiscountRate(Number.isFinite(parsed) ? parsed : settings.defaultDiscountRate);
    setFeedback({ type: 'success', message: 'Default discount rate updated for new hybrid scenarios.' });
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Clear all stored data? Active session values will reset.');
      if (!confirmed) {
        return;
      }
    }

    clearAllData();
    setFeedback({ type: 'success', message: 'Stored data cleared. Forms have been reset to their defaults.' });
  };

  const handleExport = () => {
    const snapshot = exportSnapshot();
    setExportText(snapshot);
    setImportText(snapshot);
    setFeedback({ type: 'success', message: 'Snapshot generated. Securely store it or copy it for safekeeping.' });
  };

  const handleCopy = async () => {
    if (!isCopySupported) {
      return;
    }

    try {
      await navigator.clipboard.writeText(exportText || importText);
      setFeedback({ type: 'success', message: 'Snapshot copied to clipboard.' });
    } catch (error) {
      console.warn('SettingsPanel: failed to copy snapshot', error);
      setFeedback({ type: 'error', message: 'Unable to copy snapshot automatically. Please copy manually.' });
    }
  };

  const handleImport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (importText.trim().length === 0) {
      setFeedback({ type: 'error', message: 'Paste a previously exported snapshot before importing.' });
      return;
    }

    const result = importSnapshot(importText);
    if (result.success) {
      setFeedback({ type: 'success', message: 'Snapshot imported successfully.' });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <section id="settings" className="settings-section">
      <header className="settings-section__header">
        <div>
          <h2>Workspace settings</h2>
          <p>Decide how your planning data is stored and tune assumptions used by the calculators.</p>
        </div>
        <a
          className="settings-section__roadmap"
          href="https://cto.new/roadmap"
          target="_blank"
          rel="noreferrer"
        >
          Backend roadmap →
        </a>
      </header>

      <div className="settings-grid">
        <article className="settings-card">
          <header>
            <h3>Data persistence</h3>
            <p>Choose whether deal flow entries and configuration should persist between sessions.</p>
          </header>
          <label className="settings-toggle">
            <input type="checkbox" checked={settings.persistenceEnabled} onChange={handleTogglePersistence} />
            <span>
              {settings.persistenceEnabled ? 'Persistence enabled' : 'Persistence disabled'}
            </span>
          </label>
          <p className="settings-helper">
            When disabled, data is kept in-memory and cleared when the tab closes. You can still export it for safekeeping.
          </p>
          <button type="button" className="button-secondary" onClick={handleClear}>
            Clear stored data
          </button>
        </article>

        <article className="settings-card">
          <header>
            <h3>Assumption defaults</h3>
            <p>Set the baseline discount rate used for new hybrid cashflow scenarios.</p>
          </header>
          <label className="settings-input">
            <span>Default discount rate (%)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.1}
              value={discountRateInput}
              onChange={(event) => setDiscountRateInput(event.target.value)}
              onBlur={handleDiscountCommit}
            />
          </label>
          <p className="settings-helper">
            Adjust to reflect your hurdle rate or WACC assumptions. Existing calculator entries remain unchanged.
          </p>
        </article>

        <article className="settings-card settings-card--span">
          <header>
            <h3>Portability</h3>
            <p>Export a JSON snapshot for sharing or import one to restore a prior workspace state.</p>
          </header>
          <div className="settings-actions">
            <button type="button" className="button-primary" onClick={handleExport}>
              Generate snapshot
            </button>
            {isCopySupported ? (
              <button type="button" className="button-secondary" onClick={handleCopy} disabled={!exportText && !importText}>
                Copy snapshot
              </button>
            ) : null}
          </div>
          <form className="snapshot-form" onSubmit={handleImport}>
            <label>
              <span className="sr-only">Snapshot JSON</span>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                placeholder="Paste snapshot JSON here or generate a new export."
                rows={6}
              />
            </label>
            <div className="snapshot-form__actions">
              <button type="submit" className="button-primary">
                Import snapshot
              </button>
            </div>
          </form>
        </article>
      </div>

      {feedback ? (
        <div className={`settings-feedback settings-feedback--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      ) : null}
    </section>
  );
}
