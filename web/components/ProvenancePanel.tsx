type Provenance = {
  mission: string;
  product: string;
  processing_level: string;
  observation: {
    reference: string;
    secondary: string;
    temporal_baseline_days: number;
  };
  source_product: string;
  source_url: string;
  download_date: string;
  processing: string[];
  units: {
    measurement: string;
    coordinates: string;
    coherence: string;
  };
  limitations: string[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function ProvenancePanel({ provenance }: { provenance: Provenance }) {
  return (
    <section className="ex-prov" aria-labelledby="ex-prov-title">
      <header className="ex-prov-head">
        <div>
          <span className="ex-prov-kicker">Source and processing</span>
          <h3 className="ex-prov-title" id="ex-prov-title">
            Where these numbers came from.
          </h3>
        </div>
        <p>
          Trace the mission, product, observation dates, units, processing
          steps, limitations, and prepared downloads.
        </p>
      </header>

      <dl className="ex-prov-summary">
        <div>
          <dt>Mission</dt>
          <dd>{provenance.mission}</dd>
        </div>
        <div>
          <dt>Product type</dt>
          <dd>{provenance.product}</dd>
        </div>
        <div>
          <dt>Processing level</dt>
          <dd>{provenance.processing_level}</dd>
        </div>
        <div>
          <dt>Metadata downloaded</dt>
          <dd>
            <time dateTime={provenance.download_date}>
              {formatDate(provenance.download_date)}
            </time>
          </dd>
        </div>
      </dl>

      <div className="ex-prov-observation">
        <span className="ex-prov-label">Observation pair</span>
        <div className="ex-prov-dates">
          <div>
            <span>Reference</span>
            <time dateTime={provenance.observation.reference}>
              {formatDate(provenance.observation.reference)}
            </time>
          </div>
          <span className="ex-prov-arrow" aria-hidden="true">
            →
          </span>
          <div>
            <span>Secondary</span>
            <time dateTime={provenance.observation.secondary}>
              {formatDate(provenance.observation.secondary)}
            </time>
          </div>
          <span className="ex-prov-baseline">
            {provenance.observation.temporal_baseline_days} day temporal baseline
          </span>
        </div>
      </div>

      <div className="ex-prov-columns">
        <section className="ex-prov-block" aria-labelledby="ex-prov-processing">
          <h4 id="ex-prov-processing">Processing steps</h4>
          <ol className="ex-prov-steps">
            {provenance.processing.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="ex-prov-block" aria-labelledby="ex-prov-units">
          <h4 id="ex-prov-units">Measurement units</h4>
          <dl className="ex-prov-units">
            <div>
              <dt>Measurement</dt>
              <dd>{provenance.units.measurement}</dd>
            </div>
            <div>
              <dt>Coordinates</dt>
              <dd>{provenance.units.coordinates}</dd>
            </div>
            <div>
              <dt>Coherence</dt>
              <dd>{provenance.units.coherence}</dd>
            </div>
          </dl>
          <h4>Original source</h4>
          <a
            className="ex-prov-link"
            href={provenance.source_url}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the NASA/ASF source product in a new tab"
          >
            Open NASA/ASF product ↗
          </a>
          <p className="ex-prov-download-date">
            Product metadata downloaded{" "}
            <time dateTime={provenance.download_date}>
              {formatDate(provenance.download_date)}
            </time>
            .
          </p>
        </section>
      </div>

      <section className="ex-prov-source" aria-labelledby="ex-prov-source-title">
        <div>
          <span className="ex-prov-label">Source identifier</span>
          <h4 id="ex-prov-source-title">Full product identifier</h4>
          <p>Exact identifier carried by the prepared source metadata.</p>
        </div>
        <code>{provenance.source_product}</code>
      </section>

      <section className="ex-prov-limits" aria-labelledby="ex-prov-limits-title">
        <div>
          <span className="ex-prov-label">Limitations</span>
          <h4 id="ex-prov-limits-title">What this record does not establish.</h4>
        </div>
        <ul>
          {provenance.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      <section className="ex-prov-downloads" aria-labelledby="ex-prov-downloads-title">
        <div>
          <span className="ex-prov-label">Prepared files</span>
          <h4 id="ex-prov-downloads-title">Download the data used here.</h4>
        </div>
        <div className="ex-prov-download-links">
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
    </section>
  );
}
