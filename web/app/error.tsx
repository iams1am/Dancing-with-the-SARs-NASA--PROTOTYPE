"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "../components/ui/Primitives";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <div className="shell">
        <main className="page-main" id="main-content">
          <div className="route-state route-error" role="alert">
            <span className="data-state-mark">!</span>
            <div>
              <div className="kicker">TERRACASCADE</div>
              <h1>Something went wrong.</h1>
              <p>
                This page could not be loaded. You can try again or return to
                the home page.
              </p>
              <div className="actions">
                <Button variant="primary" onClick={() => reset()}>
                  Try again
                </Button>
                <ButtonLink href="/" variant="secondary">Return to home</ButtonLink>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
