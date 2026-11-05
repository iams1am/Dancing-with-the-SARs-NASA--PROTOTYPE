import { ButtonLink } from "../components/ui/Primitives";

export default function NotFound() {
  return (
    <div className="page">
      <div className="shell">
        <main className="page-main" id="main-content">
          <div className="route-state route-error" role="status">
            <span className="data-state-mark">?</span>
            <div>
              <div className="kicker">PAGE NOT FOUND</div>
              <h1>We could not find that page.</h1>
              <p>Use the links below to return to the project.</p>
              <div className="actions">
                <ButtonLink href="/explore" variant="primary">Open the explorer</ButtonLink>
                <ButtonLink href="/" variant="secondary">Return to home</ButtonLink>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
