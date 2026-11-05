"use client";

import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import MapPanel from "./MapPanel";
import { ProvenancePanel } from "./ProvenancePanel";
import { ExplorerInspector } from "./ExplorerInspector";
import {
  EVIDENCE_LABELS,
  ErrorState,
  EvidenceLabel,
  LoadingState,
  MetadataLabel,
  ScientificNotice,
  TabGroup,
  tabIds
} from "./ui/Primitives";
import type { EvidenceKind, TabItem } from "./ui/Primitives";

const SarSurface = dynamic(
  () => import("./SarSurface").then((module) => module.SarSurface),
  {
    ssr: false,
    loading: () => (
      <LoadingState
        className="ex-surface-state"
        title="Loading the 3D data view"
        description="Preparing the sampled phase and coherence values."
      />
    )
  }
);

const GlobeScene = dynamic(
  () => import("./GlobeScene").then((module) => module.GlobeScene),
  {
    ssr: false,
    loading: () => (
      <div className="ex-view-loading" role="status" aria-live="polite">
        <span className="tc-spinner" aria-hidden="true" />
        <span>Loading the Earth view</span>
      </div>
    )
  }
);

type EventData = {
  id: string;
  title: string;
  location: string;
  source_product: string;
  projection: string;
  bounds: { x_min: number; y_min: number; x_max: number; y_max: number };
  center: { latitude: number; longitude: number };
  geographic_bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  context_bounds: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  imagery: string;
  map_overlay: string;
  map_overlay_units: string;
};

type ObservationsData = {
  measurement: {
    name: string;
    units: string;
    statistics: {
      valid_pixel_count: number;
      minimum: number;
      maximum: number;
      median: number;
    };
  };
  quality: {
    coherence: { median: number };
    valid_pixel_ratio: number;
    threshold: number;
  };
  observation_pair: {
    reference: string;
    secondary: string;
    temporal_baseline_days: number;
  };
  imagery: string;
  limitations: string[];
};

type ChangeDna = {
  indicators: Array<{
    name: string;
    value: number;
    display_percent: number | null;
    units: string;
    evidence_level: string;
    calculation: string;
    source: string;
  }>;
  omitted: string[];
};

type Cascade = {
  nodes: Array<{
    id: string;
    label: string;
    evidence: string;
    explanation: string;
    source: string;
    limitation: string;
  }>;
};
type Provenance = ComponentProps<typeof ProvenancePanel>["provenance"];

const ANALYSIS_TABS: readonly TabItem[] = [
  { value: "preview", label: "Radar preview" },
  { value: "surface", label: "3D surface" },
  { value: "context", label: "Earth context" },
  { value: "dna", label: "Change DNA" },
  { value: "evidence", label: "Evidence" },
  { value: "sources", label: "Sources" }
];

type AnalysisTab = "preview" | "surface" | "context" | "dna" | "evidence" | "sources";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

function evidenceKind(value: string): EvidenceKind | null {
  const key = value.toLowerCase();
  return key in EVIDENCE_LABELS ? (key as EvidenceKind) : null;
}

function formatCoordinate(value: number, axis: "latitude" | "longitude") {
  const hemisphere =
    axis === "latitude"
      ? value >= 0 ? "N" : "S"
      : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(3)}° ${hemisphere}`;
}

function changeDnaValue(indicator: ChangeDna["indicators"][number]) {
  if (indicator.units === "fraction of pixels" && indicator.display_percent !== null) {
    return { value: `${indicator.display_percent}%`, detail: "of AOI pixels" };
  }
  if (Number.isInteger(indicator.value)) {
    return { value: String(indicator.value), detail: indicator.units };
  }
  return { value: indicator.value.toFixed(3), detail: indicator.units };
}

export function ExplorerDashboard() {
  const [data, setData] = useState<{
    event: EventData;
    observations: ObservationsData;
    dna: ChangeDna;
    cascade: Cascade;
    provenance: Provenance;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AnalysisTab>("preview");
  const [selectedObservation, setSelectedObservation] = useState<"reference" | "secondary">("secondary");

  useEffect(() => {
    const controller = new AbortController();
    const load = (path: string) =>
      fetch(path, { signal: controller.signal }).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${path} (${response.status})`);
        }
        return response.json();
      });
    Promise.all([
      load("/data/event.json"),
      load("/data/observations.json"),
      load("/data/change-dna.json"),
      load("/data/cascade.json"),
      load("/data/provenance.json")
    ]).then(([event, observations, dna, cascade, provenance]) => {
      if (controller.signal.aborted) return;
      setData({ event, observations, dna, cascade, provenance });
      setActiveNode(cascade.nodes[0]?.id ?? null);
    }).catch((reason: unknown) => {
      if (controller.signal.aborted) return;
      setError(reason instanceof Error ? reason.message : "Unable to load observation assets.");
    });
    return () => {
      controller.abort();
    };
  }, [retryCount]);

  if (error) {
    return (
      <ErrorState
        title="The sample data could not be loaded"
        description={error}
        onRetry={() => {
          setError(null);
          setData(null);
          setRetryCount((value) => value + 1);
        }}
      />
    );
  }

  if (!data) {
    return (
      <div className="ex-shell ex-shell-loading">
        <LoadingState
          title="Loading the sample data"
          description="Reading the prepared files and source information."
        />
      </div>
    );
  }

  const { event, observations, dna, cascade, provenance } = data;
  const activeCascadeNode = cascade.nodes.find((node) => node.id === activeNode);
  const activeCascadeIndex = cascade.nodes.findIndex((node) => node.id === activeNode);
  const activeCascadeKind = activeCascadeNode
    ? evidenceKind(activeCascadeNode.evidence)
    : null;
  const observationPair = observations.observation_pair;

  /* Complementary views are mounted one at a time on purpose: the map stays
   * mounted as the primary surface, and only one WebGL scene can exist at
   * once, so switching tabs cannot create duplicate render loops or resize a
   * hidden canvas to zero. Each tab owns a stable panel id, so every tab still
   * points at a real tabpanel even while only the active view is mounted. */
  function renderAnalysis(tab: AnalysisTab) {
    switch (tab) {
      case "preview":
        return (
          <figure className="ex-preview">
            <div className="ex-preview-head">
              <div>
                <MetadataLabel>Observed preview</MetadataLabel>
                <h3 className="ex-preview-title">Unwrapped phase and coherence</h3>
              </div>
              <EvidenceLabel kind="observed" />
            </div>
            <div className="ex-preview-frame">
              <Image
                src={observations.imagery}
                alt={`Filtered ${observations.measurement.name} and coherence preview for ${event.location}`}
                width={2340}
                height={990}
                sizes="(max-width: 900px) 100vw, 70vw"
                unoptimized
              />
            </div>
            <figcaption className="ex-preview-caption">
              <div
                className="ex-preview-key"
                role="group"
                aria-label="Scientific preview reading key"
              >
                <span><b className="key-index">01</b> Unwrapped phase · radians</span>
                <span><b className="key-index">02</b> Coherence · unitless</span>
                <span className="key-muted">Masked pixels omitted</span>
              </div>
              <div className="ex-preview-source">
                <span>
                  NASA/ASF GUNW sample · {event.projection} · AOI in projected metres
                </span>
                <a href={observations.imagery} target="_blank" rel="noreferrer">
                  Open preview image ↗
                </a>
              </div>
            </figcaption>
          </figure>
        );
      case "surface":
        return <SarSurface />;
      case "context":
        return (
          <>
            <div className="ex-view-head">
              <div>
                <MetadataLabel>Earth context</MetadataLabel>
                <h3 className="ex-view-title">Where the footprint sits.</h3>
              </div>
              <EvidenceLabel kind="contextual" />
            </div>
            <div className="ex-globe-shell">
              <div className="ex-globe-topline">
                <span className="ex-globe-role">
                  Contextual globe · Not a radar measurement
                </span>
                <span className="ex-globe-locator">
                  Locator marks the sample center
                </span>
              </div>
              <div className="ex-globe">
                <GlobeScene />
              </div>
            </div>
            <dl className="ex-context-facts">
              <div>
                <dt>Sample center</dt>
                <dd>
                  {formatCoordinate(event.center.latitude, "latitude")} ·{" "}
                  {formatCoordinate(event.center.longitude, "longitude")}
                </dd>
              </div>
              <div>
                <dt>Projection</dt>
                <dd>{event.projection}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>Geographic orientation only</dd>
              </div>
            </dl>
            <ScientificNotice tone="info" title="Context, not measurement">
              The globe is navigation context for the sample footprint. It does
              not encode NISAR phase, coherence, or displacement.
            </ScientificNotice>
          </>
        );
      case "dna":
        return (
          <>
            <div className="ex-view-head">
              <div>
                <MetadataLabel>Change DNA</MetadataLabel>
                <h3 className="ex-view-title">Independent indicators, not a score.</h3>
              </div>
            </div>
            <p className="ex-view-copy">
              Each readout keeps its own units, source, and method. No composite
              value is calculated from them.
            </p>
            <ul className="ex-dna">
              {dna.indicators.map((indicator, index) => {
                const kind = evidenceKind(indicator.evidence_level);
                const display = changeDnaValue(indicator);
                const hasBar = indicator.display_percent !== null;
                return (
                  <li className="ex-dna-item" key={indicator.name}>
                    <div className="ex-dna-head">
                      <span className="ex-dna-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4 className="ex-dna-name">{indicator.name}</h4>
                      {kind ? (
                        <EvidenceLabel kind={kind} />
                      ) : (
                        <span className="ex-dna-kind">{indicator.evidence_level}</span>
                      )}
                    </div>
                    <p className="ex-dna-value">
                      {display.value}
                      <small>{display.detail}</small>
                    </p>
                    {hasBar ? (
                      <>
                        <div className="ex-dna-track" aria-hidden="true">
                          <span
                            style={{
                              width: `${Math.min(100, Math.max(0, indicator.display_percent ?? 0))}%`
                            }}
                          />
                        </div>
                        <div className="ex-dna-scale" aria-hidden="true">
                          <span>0</span>
                          <span>
                            {indicator.units === "unitless"
                              ? "full coherence scale (0–1)"
                              : "AOI pixel coverage"}
                          </span>
                          <span>{indicator.units === "unitless" ? "1" : "100%"}</span>
                        </div>
                      </>
                    ) : null}
                    <p className="ex-dna-calc">{indicator.calculation}</p>
                    <p className="ex-dna-source">
                      <span>Source</span>
                      <code>{indicator.source}</code>
                    </p>
                  </li>
                );
              })}
            </ul>
            <ScientificNotice tone="warning" title="No combined risk score">
              <p>
                These indicators are independent analytical readouts. They are
                not combined into a risk score and do not jointly predict hazards.
              </p>
              <div className="ex-dna-omitted">
                <span>Intentionally omitted</span>
                <ul>
                  {dna.omitted.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </ScientificNotice>
          </>
        );
      case "evidence":
        return (
          <>
            <div className="ex-view-head">
              <div>
                <MetadataLabel>Evidence sequence</MetadataLabel>
                <h3 className="ex-view-title">What supports each step.</h3>
              </div>
            </div>
            <p className="ex-view-copy">
              Select a step to inspect its evidence category, explanation,
              source, and limitation.
            </p>
            <div className="ex-evidence">
              <div className="ex-evidence-rail">
                <ol className="ex-evidence-list">
                  {cascade.nodes.map((node, index) => {
                    const kind = evidenceKind(node.evidence);
                    return (
                      <li key={node.id}>
                        <button
                          className="ex-evidence-node"
                          type="button"
                          aria-pressed={activeNode === node.id}
                          aria-controls="ex-evidence-detail"
                          onClick={() => setActiveNode(node.id)}
                        >
                          <span
                            className={`ex-evidence-number ex-evidence-${node.evidence.toLowerCase()}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="ex-evidence-node-copy">
                            <strong>{node.label}</strong>
                            <span className="ex-evidence-node-meta">
                              {kind ? (
                                <EvidenceLabel kind={kind} />
                              ) : (
                                node.evidence
                              )}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <div
                className="ex-evidence-detail"
                id="ex-evidence-detail"
                aria-live="polite"
              >
                {activeCascadeNode ? (
                  <>
                    <div className="ex-evidence-detail-head">
                      <span className="ex-evidence-step">
                        Step {String(activeCascadeIndex + 1).padStart(2, "0")} of{" "}
                        {String(cascade.nodes.length).padStart(2, "0")}
                      </span>
                      {activeCascadeKind ? (
                        <EvidenceLabel kind={activeCascadeKind} />
                      ) : (
                        <span className="evidence-tag">
                          {activeCascadeNode.evidence}
                        </span>
                      )}
                    </div>
                    <h3>{activeCascadeNode.label}</h3>
                    <div className="ex-evidence-field">
                      <h4>Explanation</h4>
                      <p>{activeCascadeNode.explanation}</p>
                    </div>
                    <div className="ex-evidence-field">
                      <h4>Source</h4>
                      <code>{activeCascadeNode.source}</code>
                    </div>
                    <div className="ex-evidence-limitation">
                      <h4>Limitation</h4>
                      <p>{activeCascadeNode.limitation}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>Select a step</h3>
                    <p>You will see its source, explanation, and limitation here.</p>
                  </>
                )}
              </div>
            </div>
            <p className="ex-evidence-note">
              Selection changes the explanation only. Evidence categories
              describe support, not a probability ranking.
            </p>
          </>
        );
      case "sources":
        return <ProvenancePanel provenance={provenance} />;
    }
  }

  return (
    <div className="ex-shell">
      <div className="ex-record" role="group" aria-label="Record metadata">
        <div className="ex-record-id">
          <span className="ex-record-badge">{event.id}</span>
          <div>
            <strong>Historical NASA/ASF sample</strong>
            <span>Prepared for this demonstration · not a live observation</span>
          </div>
        </div>
        <dl className="ex-record-facts">
          <div>
            <dt>Region</dt>
            <dd>{event.location}</dd>
          </div>
          <div>
            <dt>Reference → secondary</dt>
            <dd>
              {formatDate(observationPair.reference)} →{" "}
              {formatDate(observationPair.secondary)}
            </dd>
          </div>
          <div>
            <dt>Temporal baseline</dt>
            <dd>{observationPair.temporal_baseline_days} days</dd>
          </div>
          <div>
            <dt>Phase units</dt>
            <dd>{observations.measurement.units}</dd>
          </div>
          <div>
            <dt>Quality gate</dt>
            <dd>coherence ≥ {observations.quality.threshold.toFixed(2)}</dd>
          </div>
        </dl>
      </div>

      <nav className="ex-quicknav" aria-label="Explorer sections">
        <a href="#ex-map">
          <span aria-hidden="true">01</span>
          Map
        </a>
        <a href="#ex-analysis">
          <span aria-hidden="true">02</span>
          Views
        </a>
        <a href="#ex-inspector">
          <span aria-hidden="true">03</span>
          Inspector
        </a>
      </nav>

      <div className="ex-grid">
        <div className="ex-main">
          <div
            className="ex-map"
            id="ex-map"
            role="region"
            aria-label="Interactive map"
            tabIndex={-1}
          >
            <MapPanel
              center={event.center}
              location={event.location}
              projection={event.projection}
              imagery={event.map_overlay}
              overlayMeasurement={observations.measurement.name}
              overlayUnits={event.map_overlay_units}
              geographicBounds={event.geographic_bounds}
              contextBounds={event.context_bounds}
            />
          </div>

          <section
            className="ex-analysis"
            id="ex-analysis"
            tabIndex={-1}
            aria-labelledby="ex-analysis-heading"
          >
            <h2 className="tc-sr-only" id="ex-analysis-heading">
              Complementary scientific views
            </h2>
            <div className="ex-analysis-tabs">
              <TabGroup
                label="Analysis views"
                value={activeTab}
                items={ANALYSIS_TABS}
                idBase="explorer-analysis"
                size="sm"
                onChange={(next) => setActiveTab(next as AnalysisTab)}
              />
            </div>
            {ANALYSIS_TABS.map((item) => {
              const tab = item.value as AnalysisTab;
              const ids = tabIds("explorer-analysis", tab);
              const isActive = activeTab === tab;
              return (
                <div
                  className="ex-panel-body"
                  role="tabpanel"
                  id={ids.panelId}
                  aria-labelledby={ids.tabId}
                  tabIndex={isActive ? 0 : -1}
                  hidden={!isActive}
                  key={tab}
                >
                  {isActive ? renderAnalysis(tab) : null}
                </div>
              );
            })}
          </section>
        </div>

        <ExplorerInspector
          event={event}
          observations={observations}
          provenance={provenance}
          selectedObservation={selectedObservation}
          onSelectObservation={setSelectedObservation}
        />
      </div>
    </div>
  );
}
