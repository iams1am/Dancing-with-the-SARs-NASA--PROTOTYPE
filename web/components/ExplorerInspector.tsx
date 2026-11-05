"use client";

import { useState } from "react";
import {
  DataRow,
  EvidenceLabel,
  MetadataLabel,
  ScientificNotice
} from "./ui/Primitives";

type InspectorEvent = {
  id: string;
  location: string;
  projection: string;
};

type InspectorObservations = {
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
};

type InspectorProvenance = {
  mission: string;
  product: string;
  processing_level: string;
};

type ObservationRole = "reference" | "secondary";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(value));
}

/**
 * Compact inspector beside the map. Every value comes from the prepared
 * project assets and keeps its evidence classification. The acquisition
 * selector preserves the original behaviour: it highlights one date of the
 * single interferogram pair and never implies a separate raster or a
 * multi-date series.
 */
export function ExplorerInspector({
  event,
  observations,
  provenance,
  selectedObservation,
  onSelectObservation
}: {
  event: InspectorEvent;
  observations: InspectorObservations;
  provenance: InspectorProvenance;
  selectedObservation: ObservationRole;
  onSelectObservation: (role: ObservationRole) => void;
}) {
  const stats = observations.measurement.statistics;
  const pair = observations.observation_pair;
  const [detailsOpen, setDetailsOpen] = useState(false);

  const acquisitions: Array<{ role: ObservationRole; label: string; date: string }> = [
    { role: "reference", label: "Reference", date: pair.reference },
    { role: "secondary", label: "Secondary", date: pair.secondary }
  ];

  return (
    <aside
      className="ex-inspector"
      id="ex-inspector"
      aria-labelledby="ex-inspector-title"
      tabIndex={0}
    >
      <header className="ex-inspector-head">
        <MetadataLabel>Inspector</MetadataLabel>
        <h2 className="ex-inspector-title" id="ex-inspector-title">
          {event.id} · sample summary
        </h2>
        <p className="ex-inspector-subtitle">{event.location}</p>
        <p className="ex-inspector-qualification">
          Unwrapped phase · {observations.measurement.units} · not displacement
        </p>
        <button
          className="ex-inspector-toggle"
          type="button"
          aria-controls="ex-inspector-body"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((open) => !open)}
        >
          {detailsOpen ? "Hide record details" : "Show record details"}
          <span aria-hidden="true">{detailsOpen ? "−" : "+"}</span>
        </button>
      </header>

      <div
        className="ex-inspector-body"
        id="ex-inspector-body"
        data-collapsed={!detailsOpen}
      >
        <section className="ex-inspector-section" aria-labelledby="ex-insp-record">
        <h3 className="ex-inspector-heading" id="ex-insp-record">
          Selected record
        </h3>
        <DataRow
          label="Sample identifier"
          value={event.id}
          mono
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Data source"
          value={`${provenance.mission} · ${provenance.product} ${provenance.processing_level}`}
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Region"
          value={event.location}
          note={<EvidenceLabel kind="contextual" />}
        />
        <DataRow
          label="Projection"
          value={event.projection}
          mono
          note={<EvidenceLabel kind="observed" />}
        />
      </section>

      <section className="ex-inspector-section" aria-labelledby="ex-insp-measure">
        <h3 className="ex-inspector-heading" id="ex-insp-measure">
          Measurement
        </h3>
        <DataRow
          label="Quantity"
          value={observations.measurement.name}
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Units"
          value={observations.measurement.units}
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Valid range"
          value={`${stats.minimum.toFixed(2)} – ${stats.maximum.toFixed(2)}`}
          unit={observations.measurement.units}
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Median"
          value={stats.median.toFixed(3)}
          unit={observations.measurement.units}
          note={<EvidenceLabel kind="observed" />}
        />
      </section>

      <section className="ex-inspector-section" aria-labelledby="ex-insp-quality">
        <h3 className="ex-inspector-heading" id="ex-insp-quality">
          Quality
        </h3>
        <DataRow
          label="Coherence (median)"
          value={observations.quality.coherence.median.toFixed(3)}
          unit="unitless"
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Quality threshold"
          value={`coherence ≥ ${observations.quality.threshold.toFixed(2)}`}
          note={<EvidenceLabel kind="observed" />}
        />
        <DataRow
          label="Valid pixels"
          value={stats.valid_pixel_count.toLocaleString("en-US")}
          note={<EvidenceLabel kind="derived" />}
        />
        <DataRow
          label="Valid coverage"
          value={(observations.quality.valid_pixel_ratio * 100).toFixed(1)}
          unit="%"
          note={<EvidenceLabel kind="derived" />}
        />
      </section>

      <section className="ex-inspector-section" aria-labelledby="ex-insp-acquire">
        <h3 className="ex-inspector-heading" id="ex-insp-acquire">
          Observation timeline
        </h3>
        <div className="ex-timeline" role="group" aria-label="Highlight an acquisition">
          <span className="ex-timeline-caption">
            One interferogram pair · same source product
          </span>
          {acquisitions.map((acquisition, index) => (
            <div className="ex-timeline-row" key={acquisition.role}>
              {index > 0 ? (
                <div className="ex-timeline-baseline" role="note">
                  <span className="ex-timeline-line" aria-hidden="true" />
                  <b>{pair.temporal_baseline_days} days</b>
                  <span>temporal baseline</span>
                </div>
              ) : null}
              <button
                className="ex-timeline-stop"
                type="button"
                aria-pressed={selectedObservation === acquisition.role}
                onClick={() => onSelectObservation(acquisition.role)}
              >
                <span className="ex-timeline-dot" aria-hidden="true" />
                <span className="ex-timeline-copy">
                  <small>{acquisition.label} acquisition</small>
                  <span>{formatDate(acquisition.date)}</span>
                </span>
                {selectedObservation === acquisition.role ? (
                  <span className="ex-timeline-selected">Selected</span>
                ) : null}
              </button>
            </div>
          ))}
        </div>
        <p className="ex-inspector-note" aria-live="polite">
          Both dates belong to the same interferogram pair. Selecting a date only
          highlights its acquisition role; it does not load a separate raster or
          interpolate surface motion. One pair is not a multi-date series.
        </p>
      </section>

        <ScientificNotice tone="limitation" title="Unwrapped phase, not displacement">
          Values are reported in {observations.measurement.units} and have not been
          converted to displacement.
        </ScientificNotice>

        <a className="ex-inspector-return" href="#ex-map">
          Back to map <span aria-hidden="true">↑</span>
        </a>
      </div>
    </aside>
  );
}
