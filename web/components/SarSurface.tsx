"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ErrorState,
  EvidenceLabel,
  LoadingState,
  ScientificNotice,
  SegmentedControl
} from "./ui/Primitives";

type SurfaceData = {
  rows: number;
  columns: number;
  phase: Array<number | null>;
  coherence: Array<number | null>;
  phase_min: number;
  phase_max: number;
  phase_units: string;
};

type DisplayMode = "phase" | "coherence";

const MODE_OPTIONS = [
  { value: "phase", label: "Phase" },
  { value: "coherence", label: "Coherence" }
] as const;

function colorFor(value: number, mode: DisplayMode, target = new THREE.Color()) {
  if (mode === "coherence") {
    return target.setHSL(0.08 + value * 0.11, 0.78, 0.38 + value * 0.28);
  }
  return target.setHSL(0.7 - value * 0.7, 0.75, 0.42 + value * 0.18);
}

type SurfaceView = {
  phase: THREE.Points;
  coherence: THREE.Points;
  group: THREE.Group;
  camera: THREE.PerspectiveCamera;
};

function buildSurfaceGeometry(surface: SurfaceData, mode: DisplayMode) {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const colors: number[] = [];
  const color = new THREE.Color();
  for (let index = 0; index < surface.phase.length; index += 1) {
    const row = Math.floor(index / surface.columns);
    const column = index % surface.columns;
    const value = mode === "phase" ? surface.phase[index] : surface.coherence[index];
    if (value === null) continue;
    const normalized = mode === "phase"
      ? (value - surface.phase_min) / Math.max(surface.phase_max - surface.phase_min, 0.0001)
      : value;
    positions.push(
      (column / Math.max(surface.columns - 1, 1) - 0.5) * 3.15,
      0.04 + normalized * 0.95,
      (row / Math.max(surface.rows - 1, 1) - 0.5) * 2.35,
    );
    colorFor(normalized, mode, color);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

export function SarSurface() {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<SurfaceView | null>(null);
  const [mode, setMode] = useState<DisplayMode>("phase");
  const modeRef = useRef(mode);
  const [surface, setSurface] = useState<SurfaceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/surface.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load SAR surface (${response.status})`);
        return response.json() as Promise<SurfaceData>;
      })
      .then((value) => {
        if (!controller.signal.aborted) setSurface(value);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "Unable to load SAR surface.");
      });
    return () => {
      controller.abort();
    };
  }, [retryCount]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !surface) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.35, 3.65);
    camera.lookAt(0, 0.28, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D SAR surface. Use arrow keys to rotate and plus or minus to zoom."
    );
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const phaseGeometry = buildSurfaceGeometry(surface, "phase");
    const coherenceGeometry = buildSurfaceGeometry(surface, "coherence");
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.96
    });
    const phasePoints = new THREE.Points(phaseGeometry, pointsMaterial);
    const coherencePoints = new THREE.Points(coherenceGeometry, pointsMaterial);
    phasePoints.visible = modeRef.current === "phase";
    coherencePoints.visible = modeRef.current === "coherence";
    group.add(phasePoints, coherencePoints);

    const grid = new THREE.GridHelper(3.2, 12, 0x6daeb8, 0x234553);
    grid.position.y = 0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.45;
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xa8e9ee, 2));

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      group.rotation.y += (event.clientX - previousX) * 0.008;
      group.rotation.x = THREE.MathUtils.clamp(
        group.rotation.x + (event.clientY - previousY) * 0.005,
        -0.65,
        0.65,
      );
      previousX = event.clientX;
      previousY = event.clientY;
    };
    const onPointerUp = () => { dragging = false; };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.0015, 2.35, 5);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        group.rotation.y += event.key === "ArrowLeft" ? -0.08 : 0.08;
        event.preventDefault();
      } else if (event.key === "+" || event.key === "=" || event.key === "-" || event.key === "_") {
        camera.position.z = THREE.MathUtils.clamp(
          camera.position.z + (event.key === "-" || event.key === "_" ? 0.2 : -0.2),
          2.35,
          5
        );
        event.preventDefault();
      }
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
    renderer.domElement.addEventListener("keydown", onKeyDown);

    viewRef.current = { phase: phasePoints, coherence: coherencePoints, group, camera };

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!dragging) group.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      viewRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("keydown", onKeyDown);
      phaseGeometry.dispose();
      coherenceGeometry.dispose();
      pointsMaterial.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      mount.removeChild(renderer.domElement);
    };
  }, [surface]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.phase.visible = mode === "phase";
    view.coherence.visible = mode === "coherence";
    view.group.rotation.set(0, 0, 0);
    view.camera.position.set(0, 1.35, 3.65);
    view.camera.lookAt(0, 0.28, 0);
  }, [mode, surface]);

  if (error) {
    return (
      <ErrorState
        className="ex-surface-state"
        title="The 3D view could not be loaded"
        description={error}
        onRetry={() => {
          setError(null);
          setSurface(null);
          setRetryCount((value) => value + 1);
        }}
      />
    );
  }
  if (!surface) {
    return (
      <LoadingState
        className="ex-surface-state"
        title="Loading the 3D data view"
        description="Preparing the sampled phase and coherence values."
      />
    );
  }

  const isPhase = mode === "phase";
  const legendMin = isPhase ? surface.phase_min : 0;
  const legendMax = isPhase ? surface.phase_max : 1;
  const legendUnits = isPhase ? surface.phase_units : "unitless";

  return (
    <section className="ex-surface" aria-label="3D phase and coherence analysis">
      <header className="ex-surface-head">
        <div className="ex-surface-heading">
          <span className="ex-surface-kicker">3D analysis · sampled values</span>
          <h3 className="ex-surface-title">Phase and coherence surface</h3>
        </div>
        <SegmentedControl
          label="3D surface measurement mode"
          value={mode}
          options={MODE_OPTIONS}
          size="sm"
          onChange={(next) => setMode(next as DisplayMode)}
        />
      </header>

      <div
        className="ex-surface-canvas"
        ref={mountRef}
        aria-label="Interactive 3D SAR surface visualization"
      />

      <div className="ex-surface-range">
        <div className="ex-surface-range-copy">
          <span>{isPhase ? "Relative unwrapped phase" : "Coherence"}</span>
          <strong>
            {legendMin.toFixed(2)} to {legendMax.toFixed(2)} {legendUnits}
          </strong>
        </div>
        <div
          className="ex-surface-range-bar"
          data-mode={mode}
          aria-hidden="true"
        />
        <div className="ex-surface-range-scale" aria-hidden="true">
          <span>{legendMin.toFixed(2)}</span>
          <span>{legendUnits}</span>
          <span>{legendMax.toFixed(2)}</span>
        </div>
      </div>

      <div className="ex-surface-guidance">
        <span>Drag to rotate · scroll or + / − to zoom · arrow keys rotate</span>
        <EvidenceLabel kind="observed" />
      </div>

      <ScientificNotice tone="limitation" title="Height is not terrain or displacement">
        Height only separates sampled values so they can be inspected.{" "}
        {isPhase
          ? `Phase is shown in ${surface.phase_units} and has not been converted to displacement.`
          : "Coherence is shown as a unitless quality value, not displacement."}
      </ScientificNotice>
    </section>
  );
}
