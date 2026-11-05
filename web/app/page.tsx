import { GlobeScene } from "../components/GlobeScene";
import { HomeSnapshot } from "../components/HomeSnapshot";
import { SiteFooter } from "../components/SiteFooter";
import { ButtonLink } from "../components/ui/Primitives";

const steps = [
  {
    index: "01",
    stage: "Region",
    title: "Inspect a region",
    copy: "Start with the documented Southern California footprint. The globe and map establish geographic context; neither is treated as a NISAR measurement."
  },
  {
    index: "02",
    stage: "Data",
    title: "Examine the radar data",
    copy: "Read unwrapped interferometric phase in radians, switch to coherence, and inspect the quality-screened 3D surface."
  },
  {
    index: "03",
    stage: "Evidence",
    title: "Verify the evidence",
    copy: "Follow each result to its source metadata, processing rule, and evidence label before drawing a conclusion."
  }
];

const evidence = [
  {
    kind: "observed",
    title: "Read from the source product.",
    copy: "Values taken directly from the documented GUNW product and its metadata."
  },
  {
    kind: "derived",
    title: "Calculated in this project.",
    copy: "Results produced from the source values using a stated method."
  },
  {
    kind: "contextual",
    title: "Used for orientation.",
    copy: "Maps and location information that help place the radar data."
  },
  {
    kind: "potential",
    title: "Needs more evidence.",
    copy: "Questions that cannot be answered from this sample alone."
  }
];

export default function HomePage() {
  return (
    <div className="page home-page">
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-eyebrow">Earth observation / SAR data explorer</p>
            <h1 id="home-title">
              See Earth&rsquo;s surface
              <br />
              through radar.
            </h1>
            <p className="home-lede">
              Explore a documented radar sample, inspect phase and coherence,
              and trace each result back to its source.
            </p>
            <div className="home-actions">
              <ButtonLink
                href="/explore"
                variant="primary"
                size="lg"
                trailingIcon="→"
              >
                Explore the data
              </ButtonLink>
              <ButtonLink href="/methodology" variant="secondary" size="lg">
                Understand the methodology
              </ButtonLink>
            </div>
            <p className="home-descriptor">
              Historical NASA/ASF sample · Southern California
            </p>
          </div>

          <div className="home-globe">
            <div className="home-globe-head">
              <span className="home-globe-label">
                3D Earth / Geographic context
              </span>
              <span className="home-globe-hint">Interactive</span>
            </div>
            <div className="home-globe-stage">
              <GlobeScene />
            </div>
            <div className="home-globe-foot">
              <p>
                This globe is for orientation and does not represent a NISAR
                measurement.
              </p>
              <span className="home-globe-hint">
                Drag to rotate · Scroll to zoom
              </span>
            </div>
          </div>
        </section>

        <div className="shell">
          <HomeSnapshot />

          <section
            className="home-section home-process"
            aria-labelledby="home-process-title"
          >
            <div className="home-section-head">
              <div>
                <p className="home-kicker">How it works</p>
                <h2 id="home-process-title">
                  From geographic context to documented evidence.
                </h2>
              </div>
              <p>
                Three steps, each tied to a view that already exists in the
                Explorer. No step asks you to trust a number without showing
                where it came from.
              </p>
            </div>

            <ol className="home-step-list">
              {steps.map((step) => (
                <li className="home-step" key={step.index}>
                  <div className="home-step-meta">
                    <span className="home-step-index">{step.index}</span>
                    <span>{step.stage}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="home-section home-evidence"
            aria-labelledby="home-evidence-title"
          >
            <div className="home-section-head">
              <div>
                <p className="home-kicker">Scientific confidence</p>
                <h2 id="home-evidence-title">
                  Four labels. Four kinds of evidence.
                </h2>
              </div>
              <p>
                Every statement in TerraCascade carries one label. The label
                describes the kind of evidence behind a result, not the size or
                importance of the result itself.
              </p>
            </div>

            <div className="home-evidence-grid">
              {evidence.map((item) => (
                <article
                  className="home-evidence-item"
                  data-evidence={item.kind}
                  key={item.kind}
                >
                  <span
                    className={`tc-evidence-label tc-evidence-${item.kind}`}
                  >
                    <span className="tc-evidence-dot" aria-hidden="true" />
                    {item.kind}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            className="home-closing"
            aria-labelledby="home-closing-title"
          >
            <div className="home-closing-main">
              <p className="home-kicker">Start with the sample</p>
              <h2 id="home-closing-title">
                Open the record. Follow the evidence.
              </h2>
              <p className="home-closing-copy">
                Inspect the radar layer, review its quality and processing, and
                see exactly where the interpretation stops.
              </p>
              <ButtonLink
                href="/explore"
                variant="primary"
                size="lg"
                trailingIcon="→"
              >
                Explore the data
              </ButtonLink>
            </div>

            <div className="home-limitation">
              <h3 className="home-limitation-label">Scientific limit</h3>
              <p>
                This historical sample pair can show a radar signal and its
                quality. It cannot establish a deformation cause, a hazard, or
                long-term change on its own.
              </p>
            </div>
          </section>
        </div>
      </main>

      <div className="shell">
        <SiteFooter
          label="TerraCascade / NASA Space Apps Challenge 2026"
          note="Sample radar data · processing notes · source links"
        />
      </div>
    </div>
  );
}
