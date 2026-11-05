import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import {
  ButtonLink,
  MetadataLabel,
  ScientificNotice
} from "../../components/ui/Primitives";

export const metadata: Metadata = {
  title: "About",
  description:
    "TerraCascade is an independent NASA Space Apps Challenge project that makes a documented NISAR GUNW sample inspectable without overstating it."
};

const capabilities = [
  {
    index: "01",
    title: "Geographic context",
    copy: "A map and globe locate the footprint. Both are labeled as context, not as NISAR measurements."
  },
  {
    index: "02",
    title: "Phase and coherence",
    copy: "The Explorer shows the prepared radar preview and a 3D surface with separate phase and coherence modes."
  },
  {
    index: "03",
    title: "Observation timeline",
    copy: "Reference and secondary acquisitions are shown in order with the 46-day temporal baseline."
  },
  {
    index: "04",
    title: "Change DNA",
    copy: "Independent indicators retain their own units, methods, and sources. No combined risk score is produced."
  },
  {
    index: "05",
    title: "Evidence sequence",
    copy: "Observed, derived, contextual, and potential steps each state their explanation, source, and limitation."
  },
  {
    index: "06",
    title: "Provenance and downloads",
    copy: "The full product identifier, processing steps, units, limitations, source link, and prepared files stay available."
  }
] as const;

const nextSteps = [
  {
    index: "01",
    title: "Establish a documented conversion",
    copy: "Identify and validate the product-supported relationship between phase and displacement before displaying physical units."
  },
  {
    index: "02",
    title: "Add compatible acquisitions",
    copy: "Build a multi-date series with consistent processing and a stated uncertainty budget rather than extrapolating from one pair."
  },
  {
    index: "03",
    title: "Test against independent context",
    copy: "Compare any candidate signal with ground, geodetic, or other documented observations that can challenge the interpretation."
  },
  {
    index: "04",
    title: "Carry uncertainty through the interface",
    copy: "Make the effect of masking, coherence, and acquisition geometry visible instead of collapsing them into one score."
  },
  {
    index: "05",
    title: "Review with domain and public users",
    copy: "Check whether the labels, units, and limits remain understandable to radar specialists and to non-specialists."
  }
] as const;

export default function AboutPage() {
  return (
    <div className="info-page about-page">
      <main id="main-content">
        <header className="info-hero about-hero">
          <div className="shell info-hero-inner">
            <div className="info-hero-copy">
              <p className="info-eyebrow">About / TerraCascade</p>
              <h1 className="info-title">
                Radar data, shown with its limits attached.
              </h1>
              <p className="info-lede">
                TerraCascade is an independent NASA Space Apps Challenge 2026
                project. It turns one documented NISAR GUNW sample into an
                Explorer where each value can be traced to its source, method,
                and limitation.
              </p>
              <div className="info-hero-meta" aria-label="Project summary">
                <span>Status <strong>Independent prototype</strong></span>
                <span>Event <strong>NASA Space Apps 2026</strong></span>
                <span>Record <strong>One GUNW pair</strong></span>
                <span>Region <strong>Southern California</strong></span>
              </div>
            </div>

            <aside className="info-hero-aside" aria-label="Project at a glance">
              <MetadataLabel>Project at a glance</MetadataLabel>
              <p className="info-aside-copy">
                A small, evidence-first prototype built around a public sample
                product rather than a live operational feed.
              </p>
              <dl className="info-fact-list">
                <div>
                  <dt>Record</dt>
                  <dd>TC001 · historical NASA/ASF sample</dd>
                </div>
                <div>
                  <dt>Measurement</dt>
                  <dd>Unwrapped phase · radians</dd>
                </div>
                <div>
                  <dt>Baseline</dt>
                  <dd>46 days · one pair</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Prototype, not operational</dd>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="shell">
          <ScientificNotice
            tone="info"
            title="Independent challenge project"
            className="about-disclaimer"
          >
            TerraCascade is not affiliated with, endorsed by, or operated by
            NASA, ISRO, or the NASA Space Apps Challenge. It is an independent
            entry that uses publicly documented resources and a NASA/ASF sample
            product.
          </ScientificNotice>

          <div className="about-lede-grid">
            <p className="about-statement">
              The goal is not to make radar look simple. It is to make the
              difference between a measurement, a calculation, and a conclusion
              visible at every step.
            </p>
            <div className="about-lede-copy">
              <p>
                Radar can reveal surface change through cloud and darkness, but
                a single interferogram is easy to overread. TerraCascade keeps
                the source product, quality screen, observation dates, units,
                and limitations attached to the view.
              </p>
              <p>
                That constraint shapes the product: fewer claims, more
                traceability, and a clear stop where the current evidence ends.
              </p>
            </div>
          </div>

          <section className="about-section" id="mission" aria-labelledby="about-mission">
            <div className="about-section-label">
              <span>01</span>
              <MetadataLabel>Mission</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-mission">Make the evidence legible before making the map impressive.</h2>
              <div className="about-prose">
                <p>
                  TerraCascade is built for people who want to inspect a radar
                  sample without first becoming interferometry specialists. The
                  interface explains what is measured, how the product was
                  screened, and which statements remain outside the data.
                </p>
                <p>
                  The scientific boundary is part of the design. A value is not
                  presented as a hazard, a cause, or a forecast simply because
                  it appears on a map. The evidence label travels with the
                  result.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section" id="context" aria-labelledby="about-context">
            <div className="about-section-label">
              <span>02</span>
              <MetadataLabel>Challenge context</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-context">An independent entry to the NASA Space Apps Challenge.</h2>
              <div className="about-prose">
                <p>
                  TerraCascade was prepared for the NASA Space Apps Challenge
                  2026 and the Dancing with the SARs challenge. The event
                  provides the context for the prototype; it does not imply NASA
                  endorsement or operational affiliation.
                </p>
                <p>
                  The build uses a public NASA/ASF GUNW sample with historical
                  2008 acquisition dates. The record is useful because its
                  fields, processing paths, and metadata are documented, not
                  because it represents a current NISAR observation.
                </p>
              </div>
              <dl className="about-context-facts">
                <div>
                  <dt>Event</dt>
                  <dd>NASA Space Apps Challenge 2026</dd>
                </div>
                <div>
                  <dt>Challenge</dt>
                  <dd>Dancing with the SARs</dd>
                </div>
                <div>
                  <dt>Relationship</dt>
                  <dd>Independent project, no endorsement</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="about-section" id="problem" aria-labelledby="about-problem">
            <div className="about-section-label">
              <span>03</span>
              <MetadataLabel>The scientific problem</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-problem">A single radar pair can look more certain than it is.</h2>
              <div className="about-prose">
                <p>
                  Interferometric phase is sensitive to surface motion, but it
                  is also sensitive to atmosphere, orbit geometry, terrain, and
                  processing choices. Coherence helps identify where the phase
                  relationship is stable, but it is not a hazard score.
                </p>
              </div>
              <ul className="about-points">
                <li>
                  <span>01</span>
                  <div>
                    <strong>Phase is relative.</strong>
                    <p>Radians are not millimetres. A documented conversion is required before claiming displacement.</p>
                  </div>
                </li>
                <li>
                  <span>02</span>
                  <div>
                    <strong>Quality is not certainty.</strong>
                    <p>A mask and a coherence threshold remove unusable pixels; they do not remove every source of error.</p>
                  </div>
                </li>
                <li>
                  <span>03</span>
                  <div>
                    <strong>One pair is one interval.</strong>
                    <p>It cannot establish persistence, velocity, a cause, or an upcoming hazard.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="about-section" id="prototype" aria-labelledby="about-prototype">
            <div className="about-section-label">
              <span>04</span>
              <MetadataLabel>What it demonstrates</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-prototype">What the current prototype demonstrates.</h2>
              <div className="about-prose">
                <p>
                  The Explorer connects six views around the same prepared
                  record. Each view has a defined role, and none substitutes for
                  a measurement it does not contain.
                </p>
              </div>
              <ol className="about-capabilities">
                {capabilities.map((capability) => (
                  <li className="about-capability" key={capability.index}>
                    <span className="about-capability-index">{capability.index}</span>
                    <div>
                      <h3>{capability.title}</h3>
                      <p>{capability.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="about-section" id="scope" aria-labelledby="about-scope">
            <div className="about-section-label">
              <span>05</span>
              <MetadataLabel>Scope</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-scope">Scope, stated plainly.</h2>
              <div className="about-prose">
                <p>
                  The prototype is a browser-based reading of one prepared
                  sample. It is not an ingestion pipeline, a monitoring service,
                  or a scientific validation of regional deformation.
                </p>
              </div>
              <div className="about-scope">
                <section aria-labelledby="about-scope-current">
                  <h3 id="about-scope-current">Current technical scope</h3>
                  <ul>
                    <li>One prepared NISAR GUNW sample with phase, coherence, mask, and geocoding.</li>
                    <li>Static PNG, JSON, and GeoJSON assets read by the browser.</li>
                    <li>Phase and coherence views, a quality-screened preview, and a 3D surface.</li>
                    <li>Map and globe context, observation timeline, Change DNA, evidence sequence, and provenance.</li>
                    <li>Next.js, React, and Three.js on the client.</li>
                  </ul>
                </section>
                <section aria-labelledby="about-scope-not-supported">
                  <h3 id="about-scope-not-supported">Not yet supported</h3>
                  <ul>
                    <li>Displacement in millimetres or any undocumented phase conversion.</li>
                    <li>Multi-date time series, velocity, persistence, or seasonal analysis.</li>
                    <li>Deformation cause, infrastructure diagnosis, hazard prediction, or alerts.</li>
                    <li>Live NISAR ingest, arbitrary product upload, or operational monitoring.</li>
                    <li>Other sensors, products, or polarizations beyond the prepared sample.</li>
                    <li>Full uncertainty propagation beyond the documented mask and coherence threshold.</li>
                  </ul>
                </section>
                <p className="about-scope-note">
                  Technical boundary: the browser does not parse HDF5 or run
                  InSAR processing. It reads prepared assets with their source
                  metadata attached.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section" id="next" aria-labelledby="about-next">
            <div className="about-section-label">
              <span>06</span>
              <MetadataLabel>Next research</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-next">What we would investigate next.</h2>
              <div className="about-prose">
                <p>
                  The next steps are evidence steps, not feature steps. Each one
                  would need to make a claim more defensible before it makes the
                  interface larger.
                </p>
              </div>
              <ol className="about-next">
                {nextSteps.map((step) => (
                  <li key={step.index}>
                    <span>{step.index}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="about-section" id="acknowledgements" aria-labelledby="about-acknowledgements">
            <div className="about-section-label">
              <span>07</span>
              <MetadataLabel>Acknowledgements</MetadataLabel>
            </div>
            <div className="about-section-body">
              <h2 id="about-acknowledgements">Sources and acknowledgement.</h2>
              <div className="about-prose">
                <p>
                  The prototype relies on public documentation, a public sample
                  product, and open-source tools. These acknowledgements do not
                  imply review or endorsement of the project.
                </p>
              </div>
              <ul className="about-ack-list">
                <li>
                  The{" "}
                  <a className="about-link" href="https://nisar.jpl.nasa.gov/" target="_blank" rel="noreferrer">
                    NASA-ISRO NISAR mission
                  </a>{" "}
                  for mission and product documentation.
                </li>
                <li>
                  The{" "}
                  <a className="about-link" href="https://asf.alaska.edu/" target="_blank" rel="noreferrer">
                    Alaska Satellite Facility
                  </a>{" "}
                  for hosting the public GUNW sample product used in this record.
                </li>
                <li>
                  <a className="about-link" href="https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs" target="_blank" rel="noreferrer">
                    NASA Global Imagery Browse Services
                  </a>{" "}
                  for contextual Blue Marble imagery used by the map.
                </li>
                <li>
                  The{" "}
                  <a className="about-link" href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer">
                    NASA Space Apps Challenge
                  </a>{" "}
                  for the event and challenge context.
                </li>
                <li>
                  The open-source Next.js, React, and Three.js communities for
                  the tools used to build the interface.
                </li>
              </ul>
              <p className="about-endnote">
                TerraCascade is an independent project. No NASA, ISRO, ASF, or
                challenge-organizer endorsement is claimed or implied.
              </p>
            </div>
          </section>

          <section className="about-cta" aria-labelledby="about-cta-title">
            <div>
              <p className="info-eyebrow">Continue</p>
              <h2 id="about-cta-title">Inspect the record, then check the method.</h2>
            </div>
            <div className="about-cta-actions">
              <ButtonLink href="/explore" variant="primary" size="lg" trailingIcon="→">
                Open the Explorer
              </ButtonLink>
              <ButtonLink href="/methodology" variant="secondary" size="lg">
                Read the methodology
              </ButtonLink>
            </div>
          </section>

        </div>
      </main>
      <div className="shell">
        <SiteFooter
          label="TerraCascade / Independent project"
          note="NASA Space Apps Challenge 2026 · sample data from NASA/ASF"
        />
      </div>
    </div>
  );
}
