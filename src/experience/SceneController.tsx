"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEngine } from "@/engine/store";
import { DRAWING_HEIGHT, DRAWING_WIDTH } from "@/engine/types";
import { adaptFromFps } from "@/quality/detect";
import { canExplore } from "@/engine/phases";

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

export function SceneController() {
  const { camera, gl, clock } = useThree();
  const drawingPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const hit = useRef(new THREE.Vector3());
  const fpsWindow = useRef<number[]>([]);
  const lastAdapt = useRef(0);

  useEffect(() => {
    const element = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      useEngine.getState().setWebgl(false);
    };
    element.addEventListener("webglcontextlost", onContextLost, false);
    return () => element.removeEventListener("webglcontextlost", onContextLost);
  }, [gl]);

  useFrame((state, delta) => {
    const engine = useEngine.getState();

    const fps = 1 / Math.max(delta, 0.0001);
    fpsWindow.current.push(fps);
    if (fpsWindow.current.length > 45) fpsWindow.current.shift();
    const avg =
      fpsWindow.current.reduce((sum, value) => sum + value, 0) / fpsWindow.current.length;
    if (clock.elapsedTime - lastAdapt.current > 2.5) {
      engine.setFps(avg);
      const next = adaptFromFps(engine.quality, avg);
      if (next !== engine.quality) engine.setQuality(next);
      lastAdapt.current = clock.elapsedTime;
    }

    pointerNdc.set(engine.pointer.ndcX, engine.pointer.ndcY);
    raycaster.setFromCamera(pointerNdc, camera);
    const planeHit = raycaster.ray.intersectPlane(drawingPlane.current, hit.current);
    if (planeHit && !engine.pointer.inside) {
      const u = hit.current.x / DRAWING_WIDTH + 0.5;
      const v = 0.5 - hit.current.y / DRAWING_HEIGHT;
      engine.setPointer({ u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 });
    }

    if (canExplore(engine.phase) && engine.pointer.active) {
      engine.setRail(engine.rail + delta * 0.08);
    }

    state.scene.fog = state.scene.fog ?? new THREE.Fog("#e8e0d4", 18, 52);
    const fog = state.scene.fog as THREE.Fog;
    if (engine.phase === "explore" || engine.phase === "enter") {
      fog.near = 3.5;
      fog.far = 12;
      fog.color.set("#cfc4b4");
    } else if (engine.phase === "return" || engine.phase === "transform") {
      fog.near = 5;
      fog.far = 16;
      fog.color.set("#d9d0c3");
    } else {
      fog.near = 18;
      fog.far = 52;
      fog.color.set("#e8e0d4");
    }
  });

  return null;
}
