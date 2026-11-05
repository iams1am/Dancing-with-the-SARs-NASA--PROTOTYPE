"use client";

/* NASA GIBS imagery is intentionally rendered as a regular image so the map
 * has no third-party initialization or teardown lifecycle. */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Bounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type MapPanelProps = {
  center: { latitude: number; longitude: number };
  location: string;
  projection: string;
  imagery: string;
  overlayMeasurement: string;
  overlayUnits: string;
  geographicBounds: Bounds;
  contextBounds: Bounds;
};

type ViewportSize = {
  width: number;
  height: number;
};

const WORLD_BOUNDS: Bounds = { south: -85, west: -180, north: 85, east: 180 };
const MIN_ZOOM = 0.45;

function percentagePosition(bounds: Bounds, longitude: number, latitude: number) {
  return {
    left: `${((longitude - bounds.west) / (bounds.east - bounds.west)) * 100}%`,
    top: `${(1 - (latitude - bounds.south) / (bounds.north - bounds.south)) * 100}%`,
  };
}

function fitImage(bounds: Bounds, viewport: ViewportSize) {
  const aspect = (bounds.east - bounds.west) / Math.max(bounds.north - bounds.south, 0.001);
  const width = Math.max(viewport.width, viewport.height * aspect);
  const height = Math.max(viewport.height, viewport.width / aspect);
  return {
    aspect,
    width,
    height,
    left: (viewport.width - width) / 2,
    top: (viewport.height - height) / 2,
  };
}

function buildMapUrl(bounds: Bounds, aspect: number, attempt: number) {
  const query = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.3.0",
    LAYERS: "BlueMarble_ShadedRelief",
    STYLES: "",
    CRS: "EPSG:4326",
    BBOX: `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`,
    WIDTH: "2200",
    HEIGHT: Math.max(800, Math.round(2200 / aspect)).toString(),
    FORMAT: "image/jpeg",
    TIME: "2004-01-01",
  });
  /* A failed image request can be reused from the browser cache, so the retry
   * needs a changed URL before the browser will request the basemap again. */
  if (attempt > 0) query.set("retry", String(attempt));
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${query.toString()}`;
}

function formatLatitude(value: number) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? "N" : "S"}`;
}

function formatLongitude(value: number) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? "E" : "W"}`;
}

export default function MapPanel({
  center,
  location,
  projection,
  imagery,
  overlayMeasurement,
  overlayUnits,
  geographicBounds,
  contextBounds,
}: MapPanelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scienceVisible, setScienceVisible] = useState(false);
  const [opacity, setOpacity] = useState(0.72);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState<ViewportSize>({ width: 0, height: 0 });
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [worldReady, setWorldReady] = useState(false);
  const [detailReady, setDetailReady] = useState(false);
  const [worldError, setWorldError] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [assetAttempt, setAssetAttempt] = useState(0);
  const zoomRef = useRef(zoom);
  const offsetRef = useRef(offset);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const didDragRef = useRef(false);

  useEffect(() => {
    zoomRef.current = zoom;
    offsetRef.current = offset;
  }, [offset, zoom]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const updateSize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setViewport((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      );
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const worldImage = fitImage(WORLD_BOUNDS, viewport);
  const detailImage = fitImage(contextBounds, viewport);
  const worldUrl = useMemo(
    () => buildMapUrl(WORLD_BOUNDS, worldImage.aspect, assetAttempt),
    [assetAttempt, worldImage.aspect],
  );
  const detailUrl = useMemo(
    () => buildMapUrl(contextBounds, detailImage.aspect, assetAttempt),
    [assetAttempt, contextBounds, detailImage.aspect],
  );
  const detailScale = Math.max(1, zoom);
  const detailOpacity = zoom >= 1 ? 1 : 0;
  const worldMode = zoom < 1;

  useEffect(() => {
    setWorldReady(false);
    setDetailReady(false);
    setWorldError(false);
    setDetailError(false);
  }, [worldUrl, detailUrl, assetAttempt]);

  const markerPercent = percentagePosition(contextBounds, center.longitude, center.latitude);
  const overlayPercent = percentagePosition(contextBounds, geographicBounds.west, geographicBounds.north);
  /* Detail-view layers are placed in the basemap's rendered pixel space.
   * Percentage positions would resolve against the viewport instead, which
   * drifts whenever the fitted map image is letterboxed or overflows. */
  const marker = {
    left: detailImage.left + detailImage.width * parseFloat(markerPercent.left) / 100,
    top: detailImage.top + detailImage.height * parseFloat(markerPercent.top) / 100,
  };
  const overlayStyle = {
    left: detailImage.left + detailImage.width * parseFloat(overlayPercent.left) / 100,
    top: detailImage.top + detailImage.height * parseFloat(overlayPercent.top) / 100,
    width: detailImage.width * ((geographicBounds.east - geographicBounds.west) / (contextBounds.east - contextBounds.west)),
    height: detailImage.height * ((geographicBounds.north - geographicBounds.south) / (contextBounds.north - contextBounds.south)),
  };
  const worldMarker = percentagePosition(WORLD_BOUNDS, center.longitude, center.latitude);
  const worldOverlayTopLeft = percentagePosition(WORLD_BOUNDS, geographicBounds.west, geographicBounds.north);
  const worldOverlayStyle = {
    ...worldOverlayTopLeft,
    width: `${((geographicBounds.east - geographicBounds.west) / (WORLD_BOUNDS.east - WORLD_BOUNDS.west)) * 100}%`,
    height: `${((geographicBounds.north - geographicBounds.south) / (WORLD_BOUNDS.north - WORLD_BOUNDS.south)) * 100}%`,
  };
  const selectedDetailMarker = selectedLocation
    ? percentagePosition(contextBounds, selectedLocation.longitude, selectedLocation.latitude)
    : null;
  const selectedWorldMarker = selectedLocation
    ? percentagePosition(WORLD_BOUNDS, selectedLocation.longitude, selectedLocation.latitude)
    : null;

  const clampOffset = useCallback((x: number, y: number, nextZoom: number) => {
    const isWorldView = nextZoom < 1;
    const coverageWidth = isWorldView ? worldImage.width : detailImage.width * nextZoom;
    const coverageHeight = isWorldView ? worldImage.height : detailImage.height * nextZoom;
    const maxX = Math.max(0, (coverageWidth - viewport.width) / 2);
    const maxY = Math.max(0, (coverageHeight - viewport.height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, [
    detailImage.height,
    detailImage.width,
    viewport.height,
    viewport.width,
    worldImage.height,
    worldImage.width,
  ]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const currentZoom = zoomRef.current;
      const nextZoom = Math.min(2.4, Math.max(MIN_ZOOM, currentZoom - event.deltaY * 0.001));
      const bounds = element.getBoundingClientRect();
      const cursorX = event.clientX - bounds.left - viewport.width / 2;
      const cursorY = event.clientY - bounds.top - viewport.height / 2;
      const currentScale = currentZoom < 1 ? 1 : currentZoom;
      const nextScale = nextZoom < 1 ? 1 : nextZoom;
      const ratio = nextScale / currentScale;
      const currentOffset = offsetRef.current;
      const nextOffset = clampOffset(
        nextZoom < 1 ? 0 : currentOffset.x - cursorX * (ratio - 1),
        nextZoom < 1 ? 0 : currentOffset.y - cursorY * (ratio - 1),
        nextZoom,
      );
      zoomRef.current = nextZoom;
      offsetRef.current = nextOffset;
      setZoom(nextZoom);
      setOffset(nextOffset);
    };
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [clampOffset, viewport.height, viewport.width]);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    didDragRef.current = false;
    /* Controls inside the viewport, such as the retry button, must receive
     * their own pointer events; capturing the pointer here would swallow them. */
    if ((event.target as HTMLElement).closest("button, a, input, label")) return;
    /* At 1.00× the fitted map does not need vertical panning. Let touch users
     * scroll the page past the map; panning becomes available after zooming. */
    if (event.pointerType === "touch" && zoomRef.current <= 1) {
      return;
    }
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) didDragRef.current = true;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    const nextOffset = clampOffset(offsetRef.current.x + deltaX, offsetRef.current.y + deltaY, zoomRef.current);
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };
  const endDrag = () => {
    dragRef.current.active = false;
  };
  const resetView = () => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedLocation(null);
  };
  const selectLocation = (event: React.MouseEvent<HTMLDivElement>) => {
    if (didDragRef.current) return;
    if ((event.target as HTMLElement).closest("button, a, input, label")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (worldMode) {
      const longitude = WORLD_BOUNDS.west + (x - worldImage.left) / worldImage.width * (WORLD_BOUNDS.east - WORLD_BOUNDS.west);
      const latitude = WORLD_BOUNDS.north - (y - worldImage.top) / worldImage.height * (WORLD_BOUNDS.north - WORLD_BOUNDS.south);
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        setSelectedLocation({ latitude, longitude });
      }
      return;
    }
    const imageX = (x - viewport.width / 2 - offset.x) / detailScale + viewport.width / 2;
    const imageY = (y - viewport.height / 2 - offset.y) / detailScale + viewport.height / 2;
    const longitude = contextBounds.west + (imageX - detailImage.left) / detailImage.width * (contextBounds.east - contextBounds.west);
    const latitude = contextBounds.north - (imageY - detailImage.top) / detailImage.height * (contextBounds.north - contextBounds.south);
    if (longitude >= contextBounds.west && longitude <= contextBounds.east && latitude >= contextBounds.south && latitude <= contextBounds.north) {
      setSelectedLocation({ latitude, longitude });
    }
  };
  const adjustZoom = (delta: number) => {
    const currentZoom = zoomRef.current;
    const nextZoom = Math.min(2.4, Math.max(MIN_ZOOM, currentZoom + delta));
    const nextOffset = nextZoom < 1
      ? { x: 0, y: 0 }
      : clampOffset(offsetRef.current.x, offsetRef.current.y, nextZoom);
    zoomRef.current = nextZoom;
    offsetRef.current = nextOffset;
    setZoom(nextZoom);
    setOffset(nextOffset);
  };
  const handleMapKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const panStep = 42;
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      adjustZoom(0.15);
      return;
    }
    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      adjustZoom(-0.15);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      resetView();
      return;
    }
    const pan = {
      ArrowLeft: { x: panStep, y: 0 },
      ArrowRight: { x: -panStep, y: 0 },
      ArrowUp: { x: 0, y: panStep },
      ArrowDown: { x: 0, y: -panStep }
    }[event.key];
    if (!pan || zoomRef.current < 1) return;
    event.preventDefault();
    const nextOffset = clampOffset(
      offsetRef.current.x + pan.x,
      offsetRef.current.y + pan.y,
      zoomRef.current
    );
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };
  const retryImagery = () => {
    setWorldReady(false);
    setDetailReady(false);
    setWorldError(false);
    setDetailError(false);
    setAssetAttempt((value) => value + 1);
  };
  const mapAssetError = worldError || (!worldMode && detailError);
  const mapAssetLoading = !mapAssetError && (!worldReady || (!worldMode && !detailReady));

  return (
    <div className="map-panel-shell">
      <div className="map-panel-toolbar">
        <div className="map-context">
          <span className="map-context-kicker">Map context / NASA GIBS</span>
          <strong>{location}</strong>
          <span className="map-context-note">
            Blue Marble basemap · navigation context, not a NISAR measurement
          </span>
        </div>
        <div className="map-controls" role="group" aria-label="Map controls">
          <div className="map-zoom-controls" role="group" aria-label="Map zoom controls">
            <button
              className="map-zoom-button"
              type="button"
              aria-label="Zoom out"
              title="Zoom out (keyboard: minus)"
              disabled={zoom <= MIN_ZOOM}
              onClick={() => adjustZoom(-0.15)}
            >
              −
            </button>
            <span className="map-zoom-readout" aria-live="polite">{zoom.toFixed(2)}×</span>
            <button
              className="map-zoom-button"
              type="button"
              aria-label="Zoom in"
              title="Zoom in (keyboard: plus)"
              disabled={zoom >= 2.4}
              onClick={() => adjustZoom(0.15)}
            >
              +
            </button>
          </div>
          <button
            className="map-overlay-toggle"
            type="button"
            aria-pressed={scienceVisible}
            title={scienceVisible ? "Hide the source-derived phase overlay" : "Show the source-derived phase overlay"}
            onClick={() => setScienceVisible((current) => !current)}
          >
            <span className="map-overlay-state" data-active={scienceVisible} aria-hidden="true" />
            <span>Radar overlay / {scienceVisible ? "On" : "Off"}</span>
          </button>
          <button
            className="map-reset-button"
            type="button"
            title="Reset zoom, pan, and selected coordinate (Home)"
            onClick={resetView}
          >
            Reset view
          </button>
        </div>
      </div>
      <div
        className="map-viewport"
        ref={viewportRef}
        data-map-interaction={zoom > 1 ? "active" : "scroll"}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={selectLocation}
        onKeyDown={handleMapKeyDown}
        role="group"
        aria-label={`Interactive NASA geographic context map of ${location}. Drag to pan, scroll or use plus and minus to zoom, use arrow keys to pan, and click to select a contextual coordinate. Press Home to reset. On touch screens, the page scrolls normally at 1.00×; zoom in to pan the map.`}
        aria-busy={mapAssetLoading}
        tabIndex={0}
      >
        {viewport.width > 0 && viewport.height > 0 ? (
          <>
            {!worldError && (
            <div className="map-world-surface" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
              <img
                className="map-world-image"
                src={worldUrl}
                alt="NASA Blue Marble full world overview"
                style={{ left: worldImage.left, top: worldImage.top, width: worldImage.width, height: worldImage.height }}
                key={`world-${assetAttempt}`}
                onLoad={() => setWorldReady(true)}
                onError={() => setWorldError(true)}
                draggable={false}
              />
              <div
                className="map-footprint map-world-footprint"
                style={{
                  left: worldImage.left + worldImage.width * parseFloat(worldOverlayStyle.left) / 100,
                  top: worldImage.top + worldImage.height * parseFloat(worldOverlayStyle.top) / 100,
                  width: worldImage.width * parseFloat(worldOverlayStyle.width) / 100,
                  height: worldImage.height * parseFloat(worldOverlayStyle.height) / 100,
                }}
              />
              <span className="map-marker map-world-marker" style={{ left: worldImage.left + worldImage.width * parseFloat(worldMarker.left) / 100, top: worldImage.top + worldImage.height * parseFloat(worldMarker.top) / 100 }}>
                <span /><b>TC001</b>
              </span>
              {selectedWorldMarker && (
                <span className="map-selected-marker" style={{ left: worldImage.left + worldImage.width * parseFloat(selectedWorldMarker.left) / 100, top: worldImage.top + worldImage.height * parseFloat(selectedWorldMarker.top) / 100 }}>
                  <span /><b>SELECTED</b>
                </span>
              )}
            </div>
            )}
            {!detailError && (
            <div
              className="map-surface"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${detailScale})`, opacity: detailOpacity }}
            >
              <img className="map-basemap" src={detailUrl} alt="NASA Blue Marble detailed basemap" style={{ left: detailImage.left, top: detailImage.top, width: detailImage.width, height: detailImage.height }} key={`detail-${assetAttempt}`} onLoad={() => setDetailReady(true)} onError={() => setDetailError(true)} draggable={false} />
              {scienceVisible && <img className="map-scientific-raster" src={imagery} alt="Source-derived GUNW phase overlay" style={{ ...overlayStyle, opacity }} draggable={false} />}
              <div className="map-footprint" style={overlayStyle} aria-hidden />
              <span className="map-marker" style={marker}><span /><b>TC001</b></span>
              {selectedDetailMarker && <span className="map-selected-marker" style={{ left: detailImage.left + detailImage.width * parseFloat(selectedDetailMarker.left) / 100, top: detailImage.top + detailImage.height * parseFloat(selectedDetailMarker.top) / 100 }}><span /><b>SELECTED</b></span>}
            </div>
            )}
          </>
        ) : null}
        {mapAssetError ? (
          <div className="map-asset-state map-asset-error" role="alert">
            <strong>NASA basemap unavailable</strong>
            <span>The map could not be loaded. The sample data is still available below.</span>
            <button type="button" onClick={retryImagery}>Try the map again</button>
          </div>
        ) : mapAssetLoading ? (
          <div className="map-asset-state" role="status" aria-live="polite">
            <span className="data-state-spinner" />
            <span>Loading the NASA basemap…</span>
          </div>
        ) : null}
      </div>
      <div className="map-panel-footer">
        <ul className="map-legend" aria-label="Map layers and symbols">
          <li className="map-legend-item">
            <span className="map-legend-swatch map-legend-basemap" aria-hidden="true" />
            <span>Context basemap · NASA Blue Marble (2004)</span>
          </li>
          <li className="map-legend-item" data-active={scienceVisible}>
            <span className="map-legend-swatch map-legend-overlay" aria-hidden="true" />
            <span>
              Radar overlay / {scienceVisible ? "On" : "Off"}
              {scienceVisible
                ? ` · ${overlayMeasurement} (${overlayUnits})${worldMode ? " · zoom to AOI" : ""}`
                : " · no source-derived raster shown"}
            </span>
          </li>
          <li className="map-legend-item">
            <span className="map-legend-swatch map-legend-footprint" aria-hidden="true" />
            <span className="map-legend-swatch map-legend-center" aria-hidden="true" />
            <span>AOI footprint / sample center</span>
          </li>
        </ul>
        <div className="map-footer-readouts">
          {scienceVisible ? (
            <label className="map-opacity">
              <span>Overlay opacity · {Math.round(opacity * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={opacity}
                onChange={(event) => setOpacity(Number(event.target.value))}
                aria-label="Scientific raster opacity"
              />
            </label>
          ) : null}
          <div className="map-coordinate-readout" aria-live="polite">
            <span>{selectedLocation ? "Selected coordinate" : "Sample center"}</span>
            <strong>
              {selectedLocation
                ? `${formatLatitude(selectedLocation.latitude)} · ${formatLongitude(selectedLocation.longitude)}`
                : `${formatLatitude(center.latitude)} · ${formatLongitude(center.longitude)}`}
            </strong>
          </div>
        </div>
        <div className="map-footer-notes">
          <p className="map-footer-hint">
            AOI footprint in {projection} · click the map to read a coordinate ·
            drag to pan · scroll or + / − to zoom
          </p>
          <p className="map-touch-note">
            {zoom > 1
              ? "Map panning is active. Use Reset view to release page scrolling."
              : "Touch screens: the page scrolls freely at 1.00×. Zoom in to pan the map."}
          </p>
        </div>
        <a className="map-attribution" href="https://gibs.earthdata.nasa.gov/" target="_blank" rel="noreferrer">
          NASA GIBS imagery ↗
        </a>
      </div>
    </div>
  );
}
