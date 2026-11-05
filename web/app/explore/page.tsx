import Link from "next/link";
import { ExplorerDashboard } from "../../components/ExplorerDashboard";
import { SiteFooter } from "../../components/SiteFooter";

export default function ExplorePage() {
  return (
    <div className="page">
      <div className="shell shell-wide">
        <main className="page-main explorer-page-main" id="main-content">
          <header className="explorer-page-head">
            <div>
              <div className="kicker">NISAR SAMPLE DATA EXPLORER</div>
              <h1 className="explorer-page-title">Explore the sample record.</h1>
            </div>
            <p className="explorer-page-copy">
              This page brings the sample imagery, quality information,
              acquisition dates, processing notes, and source links together.
            </p>
          </header>
          <ExplorerDashboard />
          <Link className="back-link" href="/methodology">Review the processing method ↗</Link>
        </main>
        <SiteFooter
          label="TerraCascade Explorer"
          note="All displayed values come from prepared project assets."
        />
      </div>
    </div>
  );
}
