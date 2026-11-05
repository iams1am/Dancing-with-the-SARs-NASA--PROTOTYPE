"use client";

import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "./ui/Primitives";

type SnapshotData = {
  event: {
    id: string;
    location: string;
    projection: string;
  };
  observations: {
    measurement: {
      name: string;
      units: string;
      statistics: {
        valid_pixel_count: number;
      };
    };
    quality: {
      valid_pixel_ratio: number;
    };
    observation_pair: {
      temporal_baseline_days: number;
    };
  };
};

function SnapshotHeader({ id }: { id?: string }) {
  return (
    <div className="home-section-head home-snapshot-head">
      <div>
        <p className="home-kicker">
          Current sample{id ? ` / ${id}` : ""}
        </p>
        <h2 id="home-snapshot-title">The demo record at a glance.</h2>
      </div>
      <p>
        Five values read from the prepared event and observation records. Open
        the Explorer to inspect the imagery, quality checks, and source
        details.
      </p>
    </div>
  );
}

export function HomeSnapshot() {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = (path: string) =>
      fetch(path).then((response) => {
        if (!response.ok) {
          throw new Error(`Unable to load ${path} (${response.status})`);
        }
        return response.json();
      });
    Promise.all([
      load("/data/event.json"),
      load("/data/observations.json")
    ]).then(([event, observations]) => {
      if (cancelled) return;
      setData({ event, observations });
    }).catch((reason: unknown) => {
      if (cancelled) return;
      setError(reason instanceof Error ? reason.message : "Unable to load project snapshot.");
    });
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (error) {
    return (
      <section className="home-snapshot" aria-labelledby="home-snapshot-title">
        <SnapshotHeader />
        <ErrorState
          className="home-snapshot-state"
          title="The sample summary could not be loaded"
          description={error}
          onRetry={() => {
            setError(null);
            setData(null);
            setRetryCount((value) => value + 1);
          }}
        />
      </section>
    );
  }

  if (!data) {
    return (
      <section className="home-snapshot" aria-labelledby="home-snapshot-title">
        <SnapshotHeader />
        <LoadingState
          className="home-snapshot-state"
          title="Loading the sample summary"
          description="Reading the prepared project files."
        />
      </section>
    );
  }

  const { event, observations } = data;
  const measurement = observations.measurement;
  const readouts = [
    {
      label: "Measurement",
      value: measurement.name,
      detail: `Source measurement in ${measurement.units}`,
      text: true
    },
    {
      label: "Temporal separation",
      value: `${observations.observation_pair.temporal_baseline_days} days`,
      detail: "Between the reference and secondary acquisitions",
      text: false
    },
    {
      label: "Valid coverage",
      value: `${(observations.quality.valid_pixel_ratio * 100).toFixed(1)}%`,
      detail: `${measurement.statistics.valid_pixel_count.toLocaleString()} valid pixels after quality screening`,
      text: false
    },
    {
      label: "Sample region",
      value: event.location,
      detail: "Documented sample location",
      text: true
    },
    {
      label: "Projection",
      value: event.projection,
      detail: "Projected coordinate grid",
      text: false
    }
  ];

  return (
    <section className="home-snapshot" aria-labelledby="home-snapshot-title">
      <SnapshotHeader id={event.id} />

      <div className="home-snapshot-grid">
        {readouts.map((readout) => (
          <article className="home-snapshot-item" key={readout.label}>
            <span className="home-snapshot-label">{readout.label}</span>
            <p
              className={
                readout.text
                  ? "home-snapshot-value home-snapshot-value-text"
                  : "home-snapshot-value"
              }
            >
              {readout.value}
            </p>
            <span className="home-snapshot-detail">{readout.detail}</span>
          </article>
        ))}
      </div>

      <div className="home-snapshot-foot">
        <span>Historical NASA/ASF sample GUNW product</span>
        <span>Values are shown in their original scientific units</span>
      </div>
    </section>
  );
}
