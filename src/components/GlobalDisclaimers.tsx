export function GlobalDisclaimers() {
  return (
    <section id="disclaimers" className="disclaimer-section" aria-labelledby="disclaimer-heading">
      <h2 id="disclaimer-heading">Important notices</h2>
      <div className="disclaimer-grid">
        <article className="disclaimer-card">
          <h3>Not investment advice</h3>
          <p>
            These tools are for scenario planning only and do not constitute financial, legal, or investment advice. Use
            your own judgment and engage qualified advisors before making capital allocation decisions.
          </p>
        </article>
        <article className="disclaimer-card">
          <h3>Privacy-first storage</h3>
          <p>
            All data you enter stays on this device. Enabling persistence uses browser storage; disabling it keeps data in
            memory only. Export snapshots to move information between devices.
          </p>
        </article>
      </div>
    </section>
  );
}
