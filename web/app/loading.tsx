export default function Loading() {
  return (
    <div className="page">
      <div className="shell">
        <div className="page-main">
          <div className="route-state route-loading" role="status" aria-live="polite" aria-busy="true">
            <span className="data-state-spinner" />
            <div>
              <div className="kicker">TERRACASCADE</div>
              <p className="route-state-title">Loading the project data.</p>
              <p>This should only take a moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
