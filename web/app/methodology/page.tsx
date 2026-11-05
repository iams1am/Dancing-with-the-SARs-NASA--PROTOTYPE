import type { Metadata } from "next";
import { EvidenceOrbit } from "../../components/EvidenceOrbit";
import { SiteFooter } from "../../components/SiteFooter";
import {
  ButtonLink,
  EvidenceLabel,
  MetadataLabel,
  ScientificNotice
} from "../../components/ui/Primitives";
import type { EvidenceKind } from "../../components/ui/Primitives";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How TerraCascade reads, screens, exports, and explains a documented NISAR GUNW sample."
};

const toc = [
  ["01", "Pipeline", "pipeline"],
  ["02", "What SAR measures", "sar"],
  ["03", "NISAR and GUNW", "nisar"],
  ["04", "Sample and region", "sample"],
  ["05", "Fields and units", "fields"],
  ["06", "Quality screening", "quality"],
  ["07", "Acquisition pair", "pair"],
  ["08", "Evidence classes", "evidence"],
  ["09", "Limitations", "limits"],
  ["10", "Sources", "sources"]
] as const;

const pipeline = [
  {
    index: "01",
    output: "HDF5 · GUNW L2",
    title: "Read the source",
    copy: "Read the documented product fields, fill values, mask, geocoding, and acquisition metadata."
  },
  {
    index: "02",
    output: "Screened grid",
    title: "Screen the values",
    copy: "Apply the product mask and the stated coherence threshold before any value reaches the browser."
  },
  {
    index: "03",
    output: "PNG · JSON · GeoJSON",
    title: "Export bounded assets",
    copy: "Write preview imagery, surface samples, summaries, footprint geometry, and provenance as static files."
  },
  {
    index: "04",
    output: "Explorer views",
    title: "Read in the browser",
    copy: "The interface reads prepared assets only. The map and globe add context; they are not measurement surfaces."
  }
] as const;

const fields = [
  {
    field: "unwrappedPhase",
    path: "science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram/HH/unwrappedPhase",
    role: "Measurement",
    units: "radians",
    handling: "Displayed as relative unwrapped phase. Not converted to displacement."
  },
  {
    field: "coherenceMagnitude",
    path: "science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram/HH/coherenceMagnitude",
    role: "Quality",
    units: "unitless · 0 to 1",
    handling: "Used in the quality screen and shown as the coherence view."
  },
  {
    field: "mask",
    path: "science/LSAR/GUNW/grids/frequencyA/unwrappedInterferogram/mask",
    role: "Quality",
    units: "product-defined flags",
    handling: "Applies water, invalid-subswath, and fill exclusions."
  },
  {
    field: "projected coordinates",
    path: "GUNW boundingPolygon · EPSG:32611 geocoding",
    role: "Location",
    units: "meters · EPSG:32611",
    handling: "Preserved for the geocoded preview, footprint, and map bounds."
  },
  {
    field: "temporalBaseline",
    path: "science/LSAR/GUNW/metadata/orbit/temporalBaseline",
    role: "Acquisition metadata",
    units: "days",
    handling: "Displayed as the 46-day separation between the two acquisitions."
  }
] as const;

const screening = [
  {
    number: "01",
    title: "Remove non-finite values",
    copy: "Phase and coherence entries that are not finite are excluded."
  },
  {
    number: "02",
    title: "Apply the product mask",
    copy: "Water and invalid subswaths are removed using the product mask."
  },
  {
    number: "03",
    title: "Remove the documented fill value",
    copy: "The documented fill value 255 is excluded from the prepared view."
  },
  {
    number: "04",
    title: "Require coherence of at least 0.30",
    copy: "Pixels below the threshold are not displayed in the screened preview."
  }
] as const;

const evidenceClasses: Array<{
  kind: EvidenceKind;
  title: string;
  copy: string;
  example: string;
}> = [
  {
    kind: "observed",
    title: "Observed",
    copy: "Read directly from the source product or its metadata.",
    example: "Unwrapped phase, coherence magnitude, acquisition dates."
  },
  {
    kind: "derived",
    title: "Derived",
    copy: "Calculated from source values using a stated method.",
    example: "Valid-pixel coverage and the quality-screened result."
  },
  {
    kind: "contextual",
    title: "Contextual",
    copy: "Used to orient the record geographically.",
    example: "Map imagery, globe position, region name."
  },
  {
    kind: "potential",
    title: "Potential",
    copy: "A question that needs more evidence before it can be answered.",
    example: "Persistence, a deformation cause, or a hazard statement."
  }
];

const limitations = [
  "This is a NASA/ASF sample product with historical surrogate-era acquisition dates.",
  "The displayed scientific layer is unwrapped phase in radians, not converted displacement.",
  "One interferogram pair is available; a persistent multi-observation time series is not established.",
  "Radar phase alone does not establish a deformation cause or predict a disaster."
];

export default function MethodologyPage() {
  return (
    <div className="info-page method-page">
      <main id="main-content">
        <header className="info-hero">
          <div className="shell info-hero-inner">
            <div className="info-hero-copy">
              <p className="info-eyebrow">Methodology / source to browser</p>
              <h1 className="info-title">
                From a radar product to an inspectable claim.
              </h1>
              <p className="info-lede">
                TerraCascade carries one documented NISAR GUNW sample through
                screening, export, and a browser interface. This page records
                what each step does, which units survive, and where
                interpretation stops.
              </p>
              <div className="info-hero-meta" aria-label="Method summary">
                <span>Record <strong>TC001</strong></span>
                <span>Product <strong>GUNW L2</strong></span>
                <span>Baseline <strong>46 days</strong></span>
                <span>Projection <strong>EPSG:32611</strong></span>
              </div>
            </div>

            <aside className="info-hero-aside" aria-label="Method note">
              <MetadataLabel>Method note</MetadataLabel>
              <p className="info-aside-copy">
                A displayed value must remain traceable to its source field,
                processing step, units, and limitation.
              </p>
              <dl className="info-fact-list">
                <div>
                  <dt>Measurement</dt>
                  <dd>Unwrapped phase · radians</dd>
                </div>
                <div>
                  <dt>Quality screen</dt>
                  <dd>Product mask + coherence ≥ 0.30</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>Southern California</dd>
                </div>
                <div>
                  <dt>Output</dt>
                  <dd>Prepared static assets</dd>
                </div>
              </dl>
            </aside>
          </div>
        </header>

        <div className="shell info-layout">
          <aside className="info-toc" aria-label="On this page">
            <p className="info-toc-title">On this page</p>
            <nav aria-label="Methodology sections">
              <ol className="info-toc-list">
                {toc.map(([number, label, id]) => (
                  <li key={id}>
                    <a href={`#${id}`}>
                      <span>{number}</span>
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="info-toc-note">
              The same source fields and limits appear in the Explorer&rsquo;s
              Sources tab.
            </p>
          </aside>

          <article className="info-article">
            <section className="info-section" id="pipeline">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">01</span>
                <div>
                  <MetadataLabel>Pipeline</MetadataLabel>
                  <h2>One narrow path from product to interface.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The pipeline reads documented fields from the GUNW product,
                  applies the stated quality screen, and exports bounded browser
                  assets. It does not run a new interferometric process or infer
                  displacement.
                </p>
              </div>
              <ol className="method-pipeline" aria-label="Source-to-browser pipeline">
                {pipeline.map((stage) => (
                  <li className="method-stage" key={stage.index}>
                    <div className="method-stage-top">
                      <span className="method-stage-num">{stage.index}</span>
                      <span className="method-stage-output">{stage.output}</span>
                    </div>
                    <h3>{stage.title}</h3>
                    <p>{stage.copy}</p>
                  </li>
                ))}
              </ol>
              <p className="method-note">
                No HDF5 parsing or InSAR processing happens in the browser. The
                Explorer reads prepared assets and keeps their source metadata
                attached.
              </p>
            </section>

            <section className="info-section" id="sar">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">02</span>
                <div>
                  <MetadataLabel>What SAR measures</MetadataLabel>
                  <h2>Phase and coherence are measurements with specific meanings.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  Synthetic Aperture Radar sends microwave pulses toward Earth
                  and records the returned amplitude and phase. Interferometry
                  compares the phase from two acquisitions of the same area.
                </p>
                <p>
                  <strong>Unwrapped phase</strong> removes the 2π ambiguity in
                  the interferogram, but it remains a relative measurement. It
                  can contain contributions from surface motion, atmosphere,
                  orbit geometry, and terrain. TerraCascade therefore reports
                  phase in radians, not millimetres of displacement.
                </p>
                <p>
                  <strong>Coherence magnitude</strong> summarizes how stable
                  the phase relationship is across the pair. Values near 1
                  indicate a more consistent relationship; lower values point to
                  noise, change, or decorrelation.
                </p>
              </div>
              <dl className="method-terms">
                <div>
                  <dt>Phase</dt>
                  <dd>Relative position of a wave cycle. This product reports unwrapped phase in radians.</dd>
                </div>
                <div>
                  <dt>Coherence</dt>
                  <dd>A unitless quality measure from 0 to 1 for the acquisition pair.</dd>
                </div>
                <div>
                  <dt>Interferogram</dt>
                  <dd>The phase difference between the reference and secondary acquisitions.</dd>
                </div>
              </dl>
            </section>

            <section className="info-section" id="nisar">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">03</span>
                <div>
                  <MetadataLabel>NISAR and GUNW</MetadataLabel>
                  <h2>A documented mission product provides the starting point.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  NISAR is a NASA-ISRO radar mission. GUNW is a Level 2
                  Geocoded Unwrapped Interferogram product. It packages
                  unwrapped phase, coherence, masks, and geocoded coordinates
                  for a pair of acquisitions.
                </p>
                <p>
                  This demonstration uses a historical NASA/ASF sample with
                  2008 acquisition dates. It is a documented sample record, not
                  a live NISAR observation and not an operational monitoring
                  product. TerraCascade is an independent project and does not
                  claim NASA or ISRO endorsement.
                </p>
              </div>
              <div className="method-facts">
                <div className="method-fact">
                  <span>Mission</span>
                  <strong>NASA-ISRO NISAR</strong>
                </div>
                <div className="method-fact">
                  <span>Product</span>
                  <strong>GUNW</strong>
                </div>
                <div className="method-fact">
                  <span>Processing level</span>
                  <strong>L2</strong>
                </div>
                <div className="method-fact">
                  <span>Record</span>
                  <strong>Historical sample</strong>
                </div>
                <div className="method-fact">
                  <span>Acquisitions</span>
                  <strong>12 Oct and 27 Nov 2008</strong>
                </div>
                <div className="method-fact">
                  <span>Status</span>
                  <strong>Prepared demonstration</strong>
                </div>
              </div>
            </section>

            <section className="info-section" id="sample">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">04</span>
                <div>
                  <MetadataLabel>Sample and region</MetadataLabel>
                  <h2>A Southern California footprint with retained values.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The demonstration record covers a Southern California
                  footprint centered at 34.799° N, 117.964° W. The footprint
                  spans roughly 0.41° of latitude and 0.39° of longitude. The
                  prepared values below describe this sample, not current
                  surface conditions in the region.
                </p>
              </div>
              <div className="method-facts">
                <div className="method-fact">
                  <span>Region</span>
                  <strong>Southern California, United States</strong>
                </div>
                <div className="method-fact">
                  <span>Scene center</span>
                  <strong>34.799° N · 117.964° W</strong>
                </div>
                <div className="method-fact">
                  <span>Projection</span>
                  <strong>EPSG:32611 / UTM 11N</strong>
                </div>
                <div className="method-fact">
                  <span>Valid pixels</span>
                  <strong>200,656</strong>
                </div>
                <div className="method-fact">
                  <span>Phase range</span>
                  <strong>-3.431 to 6.908 radians</strong>
                </div>
                <div className="method-fact">
                  <span>Coherence median</span>
                  <strong>0.476 unitless</strong>
                </div>
              </div>
              <p className="method-note">
                Footprint bounds: 34.607°–35.015° N and 118.150°–117.763° W.
                Coordinates are preserved in EPSG:32611 for the map export.
              </p>
            </section>

            <section className="info-section" id="fields">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">05</span>
                <div>
                  <MetadataLabel>Fields and units</MetadataLabel>
                  <h2>Every displayed value keeps its source field.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  Field paths are preserved from the product. Units are shown as
                  documented, and no unit conversion is applied.
                </p>
              </div>
              <div
                className="method-table-wrap"
                role="region"
                aria-label="Source fields and units"
                tabIndex={0}
              >
                <table className="method-table">
                  <caption>GUNW fields used by the prototype</caption>
                  <thead>
                    <tr>
                      <th scope="col">Field</th>
                      <th scope="col">Role</th>
                      <th scope="col">Units</th>
                      <th scope="col">Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field) => (
                      <tr key={field.field}>
                        <td>
                          <code>{field.field}</code>
                          <small className="method-field-path">{field.path}</small>
                        </td>
                        <td>{field.role}</td>
                        <td>{field.units}</td>
                        <td>{field.handling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="info-section" id="quality">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">06</span>
                <div>
                  <MetadataLabel>Quality screening</MetadataLabel>
                  <h2>The preview is narrower than the full product.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The quality screen removes values the product marks as
                  unusable and pixels whose coherence is too low for a stable
                  phase comparison. It is a documented screen, not a claim that
                  every remaining pixel is correct.
                </p>
              </div>
              <ol className="method-screen">
                {screening.map((step) => (
                  <li key={step.number}>
                    <span className="method-screen-num">{step.number}</span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="method-result">
                <div>
                  <span>Retained for preview</span>
                  <strong>200,656 <small>pixels</small></strong>
                </div>
                <div>
                  <span>AOI coverage</span>
                  <strong>81.5%</strong>
                </div>
                <div className="method-result-label">
                  <span>Evidence class</span>
                  <EvidenceLabel kind="derived" />
                </div>
              </div>
              <p className="method-note">
                The 0.30 threshold is a screening choice. It does not remove
                every source of uncertainty, and it does not convert phase into
                displacement.
              </p>
            </section>

            <section className="info-section" id="pair">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">07</span>
                <div>
                  <MetadataLabel>Acquisition pair</MetadataLabel>
                  <h2>One pair describes one interval.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The product contains one reference and one secondary
                  acquisition. Their temporal baseline is 46 days. The Explorer
                  can highlight either acquisition role, but the raster still
                  represents the pair.
                </p>
              </div>
              <div className="method-pair" aria-label="Acquisition pair timeline">
                <div className="method-pair-node">
                  <span>Reference</span>
                  <strong>12 October 2008</strong>
                  <small>Acquisition A</small>
                </div>
                <div className="method-pair-bridge">
                  <span className="method-pair-line" aria-hidden="true" />
                  <b>46 days</b>
                  <small>temporal baseline</small>
                </div>
                <div className="method-pair-node">
                  <span>Secondary</span>
                  <strong>27 November 2008</strong>
                  <small>Acquisition B</small>
                </div>
              </div>
              <div className="method-pair-grid">
                <div>
                  <h3 className="method-mini-title">What the pair supports</h3>
                  <ul className="method-list">
                    <li>The phase difference between these two dates.</li>
                    <li>Coherence for the same acquisition pair.</li>
                    <li>The 46-day temporal separation.</li>
                    <li>One quality-screened view of the record.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="method-mini-title">What it cannot support</h3>
                  <ul className="method-list method-list-muted">
                    <li>Continuous change between the two dates.</li>
                    <li>A velocity, annual rate, or persistence claim.</li>
                    <li>A multi-date time series from this product alone.</li>
                    <li>A deformation cause, hazard alert, or forecast.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="info-section" id="evidence">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">08</span>
                <div>
                  <MetadataLabel>Evidence classes</MetadataLabel>
                  <h2>The label describes support, not importance.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  Every result in TerraCascade carries one of four labels. The
                  label states what kind of evidence stands behind a statement.
                  It is not a probability or a severity ranking.
                </p>
              </div>
              <ul className="method-evidence-list">
                {evidenceClasses.map((item) => (
                  <li className="method-evidence-row" key={item.kind}>
                    <EvidenceLabel kind={item.kind} />
                    <div>
                      <p>{item.copy}</p>
                      <small>Example: {item.example}</small>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="method-orbit-wrap">
                <div className="method-orbit-head">
                  <div>
                    <MetadataLabel>Explanatory model</MetadataLabel>
                    <h3>A conceptual index, not a measurement surface.</h3>
                  </div>
                  <p>
                    The orbit explains how the four labels relate. It does not
                    encode NISAR phase, coherence, or displacement. Drag to
                    rotate and select a label to read its definition.
                  </p>
                </div>
                <EvidenceOrbit />
              </div>
            </section>

            <section className="info-section" id="limits">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">09</span>
                <div>
                  <MetadataLabel>Limitations</MetadataLabel>
                  <h2>The record ends where the evidence ends.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The prototype is deliberately bounded by what one sample pair
                  can support. These are the same limitations attached to the
                  prepared record.
                </p>
              </div>
              <ScientificNotice
                tone="limitation"
                title="What this record does not establish"
                className="method-limits-notice"
              >
                <ul className="method-limits">
                  {limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </ScientificNotice>
              <p className="method-note">
                No combined risk score, displacement conversion, hazard
                prediction, or long-term change conclusion is calculated from
                this pair.
              </p>
            </section>

            <section className="info-section" id="sources">
              <header className="info-section-head">
                <span className="info-section-index" aria-hidden="true">10</span>
                <div>
                  <MetadataLabel>Sources and reproduction</MetadataLabel>
                  <h2>The record stays attached to its source.</h2>
                </div>
              </header>
              <div className="info-prose">
                <p>
                  The full product identifier, processing record, prepared
                  files, and source link remain available here and in the
                  Explorer&rsquo;s Sources tab.
                </p>
              </div>

              <div className="method-source">
                <span className="method-source-label">Full source identifier</span>
                <code>
                  NISAR_L2_PR_GUNW_001_030_A_019_002_2000_SH_20081012T060911_20081012T060925_20081127T061000_20081127T061014_D00404_N_F_J_001
                </code>
                <div className="method-source-actions">
                  <a
                    className="method-link"
                    href="https://nisar.asf.earthdatacloud.nasa.gov/NISAR-SAMPLE-DATA/GUNW/NISAR_L2_PR_GUNW_001_030_A_019_002_2000_SH_20081012T060911_20081012T060925_20081127T061000_20081127T061014_D00404_N_F_J_001/NISAR_L2_PR_GUNW_001_030_A_019_002_2000_SH_20081012T060911_20081012T060925_20081127T061000_20081127T061014_D00404_N_F_J_001.h5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open the NASA/ASF source product ↗
                  </a>
                  <ButtonLink href="/explore" variant="secondary" size="sm">
                    Inspect the record
                  </ButtonLink>
                </div>
              </div>

              <div className="method-repro">
                <div>
                  <span>Product metadata downloaded</span>
                  <strong>29 September 2026</strong>
                </div>
                <div>
                  <span>Prepared outputs</span>
                  <strong>Static PNG, JSON, and GeoJSON</strong>
                </div>
                <div>
                  <span>Quality rule</span>
                  <strong>Product mask + coherence ≥ 0.30</strong>
                </div>
                <div>
                  <span>Phase conversion</span>
                  <strong>None applied</strong>
                </div>
              </div>

              <div className="method-downloads">
                <a href="/data/observations.json" target="_blank" rel="noreferrer">
                  Observation JSON ↗
                </a>
                <a href="/data/footprint.geojson" target="_blank" rel="noreferrer">
                  Footprint GeoJSON ↗
                </a>
                <a href="/data/provenance.json" target="_blank" rel="noreferrer">
                  Processing metadata ↗
                </a>
              </div>
            </section>
          </article>
        </div>

      </main>
      <div className="shell">
        <SiteFooter
          label="Methodology / TerraCascade"
          note="Source · screen · export · inspect"
        />
      </div>
    </div>
  );
}
