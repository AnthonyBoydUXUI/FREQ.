"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEngine } from "@/engine/store";
import { centroid } from "@/semantic/hitTest";
import { regionById } from "@/content/artworks";
import { uvToLocal } from "@/experience/geometry";

const encounterPos = new THREE.Vector3(0, 0.02, 4.85);
const encounterLook = new THREE.Vector3(0, 0, 0);
const cowlCenter = uvToLocal(
  centroid(regionById.cowl.polygon).x,
  centroid(regionById.cowl.polygon).y,
);

export function CameraDirector() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const {
      phase,
      phaseProgress: progress,
      pointer,
      reducedMotion,
      rail,
    } = useEngine.getState();

    if (phase === "encounter" || phase === "notice" || phase === "boot") {
      desired.current.copy(encounterPos);
      desiredLook.current.copy(encounterLook);
      if (!reducedMotion) {
        desired.current.x += pointer.ndcX * 0.05;
        desired.current.y += pointer.ndcY * 0.032;
      }
    } else if (phase === "approach" || phase === "response") {
      const { hoveredRegionId, focusedRegionId } = useEngine.getState();
      const regionId = hoveredRegionId ?? focusedRegionId ?? "cowl";
      const focus = uvToLocal(
        centroid(regionById[regionId].polygon).x,
        centroid(regionById[regionId].polygon).y,
      );
      desired.current.set(focus.x * 0.16, focus.y * 0.14, 3.55);
      desiredLook.current.set(focus.x * 0.38, focus.y * 0.34, 0);
    } else if (phase === "touch") {
      desired.current.set(cowlCenter.x * 0.28, cowlCenter.y * 0.26, 2.7);
      desiredLook.current.copy(cowlCenter);
    } else if (phase === "transform") {
      const t = progress;
      desired.current.lerpVectors(
        new THREE.Vector3(cowlCenter.x * 0.32, cowlCenter.y * 0.28, 2.45),
        new THREE.Vector3(cowlCenter.x * 0.08, cowlCenter.y * 0.18 + 0.12, 0.22),
        t,
      );
      desiredLook.current.lerpVectors(
        cowlCenter,
        new THREE.Vector3(0, 0.95, -4.2),
        t,
      );
    } else if (phase === "enter") {
      desired.current.lerpVectors(
        new THREE.Vector3(cowlCenter.x * 0.06, 0.92, 0.08),
        new THREE.Vector3(0, 1.02, -2.35),
        progress,
      );
      desiredLook.current.lerpVectors(
        new THREE.Vector3(0, 0.9, -3.2),
        new THREE.Vector3(0, 0.95, -6.5),
        progress,
      );
    } else if (phase === "explore") {
      desired.current.set(
        pointer.ndcX * 0.28,
        1.02 + pointer.ndcY * 0.1,
        -2.35 - rail * 2.6,
      );
      desiredLook.current.set(pointer.ndcX * 0.45, 0.95, -6.8 - rail * 2.2);
    } else if (phase === "return") {
      desired.current.lerpVectors(
        new THREE.Vector3(0, 1.02, -4.2),
        encounterPos,
        progress,
      );
      desiredLook.current.lerpVectors(
        new THREE.Vector3(0, 0.95, -6.5),
        encounterLook,
        progress,
      );
    }

    const damp = reducedMotion ? 8 : 2.05;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desired.current.x, damp, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desired.current.y, damp, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desired.current.z, damp, delta);
    look.current.x = THREE.MathUtils.damp(look.current.x, desiredLook.current.x, damp, delta);
    look.current.y = THREE.MathUtils.damp(look.current.y, desiredLook.current.y, damp, delta);
    look.current.z = THREE.MathUtils.damp(look.current.z, desiredLook.current.z, damp, delta);
    camera.lookAt(look.current);

    const persp = camera as THREE.PerspectiveCamera;
    const fovTarget =
      phase === "explore" || phase === "enter" ? 36 : 28;
    persp.fov = THREE.MathUtils.damp(persp.fov, reducedMotion ? 28 : fovTarget, 2, delta);
    persp.updateProjectionMatrix();
  });

  return null;
}
