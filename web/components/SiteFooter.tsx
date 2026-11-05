import type { ReactNode } from "react";

/**
 * Application-shell footer.
 *
 * The shell owns the structure and rhythm; each route supplies only its own
 * wording so the page ending stays consistent across the application.
 */
export function SiteFooter({
  label,
  note
}: {
  label: ReactNode;
  note: ReactNode;
}) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>{label}</span>
        <span>{note}</span>
      </div>
    </footer>
  );
}
