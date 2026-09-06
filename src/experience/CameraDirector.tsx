"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEngine } from "@/engine/store";
import { centroid } from "@/semantic/hitTest";
import { portalFor, regionById } from "@/content/artworks";
import { uvToLocal } from "@/experience/geometry";
import {
  approachDistance,
  ENCOUNTER_FOV,
  fitDistance,
  touchDistance,
} from "@/experience/framing";

const encounterLook = new THREE.Vector3(0, 0, 0);

export function CameraDirector() {
  const { camera, size } = useThree();
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
      artworkId,
    } = useEngine.getState();

    const portal = portalFor(artworkId);
    const portalCenter = uvToLocal(
      centroid(portal.polygon).x,
      centroid(portal.polygon).y,
    );

    const aspect = size.width / Math.max(size.height, 1);
    const encounterZ = fitDistance(aspect);
    const approachZ = approachDistance(aspect);
    const touchZ = touchDistance(aspect);

    if (phase === "encounter" || phase === "notice" || phase === "boot") {
      desired.current.set(0, 0.02, encounterZ);
      desiredLook.current.copy(encounterLook);
      if (!reducedMotion) {
        desired.current.x += pointer.ndcX * 0.05;
        desired.current.y += pointer.ndcY * 0.032;
      }
    } else if (phase === "approach" || phase === "response") {
      const { hoveredRegionId, focusedRegionId } = useEngine.getState();
      const regionId = hoveredRegionId ?? focusedRegionId ?? portal.id;
      const region = regionById[regionId] ?? portal;
      const focus = uvToLocal(centroid(region.polygon).x, centroid(region.polygon).y);
      desired.current.set(focus.x * 0.16, focus.y * 0.14, approachZ);
      desiredLook.current.set(focus.x * 0.38, focus.y * 0.34, 0);
    } else if (phase === "touch") {
      desired.current.set(portalCenter.x * 0.28, portalCenter.y * 0.26, touchZ);
      desiredLook.current.copy(portalCenter);
    } else if (phase === "transform") {
      const t = progress;
      desired.current.lerpVectors(
        new THREE.Vector3(portalCenter.x * 0.32, portalCenter.y * 0.28, touchZ * 0.9),
        new THREE.Vector3(portalCenter.x * 0.08, portalCenter.y * 0.18 + 0.12, 0.22),
        t,
      );
      desiredLook.current.lerpVectors(
        portalCenter,
        new THREE.Vector3(0, 0.95, -4.2),
        t,
      );
    } else if (phase === "enter") {
      desired.current.lerpVectors(
        new THREE.Vector3(portalCenter.x * 0.06, 0.88, 0.08),
        new THREE.Vector3(0, 0.82, -1.55),
        progress,
      );
      desiredLook.current.lerpVectors(
        new THREE.Vector3(0, 0.9, -2.4),
        new THREE.Vector3(0, 1.12, -4.1),
        progress,
      );
    } else if (phase === "explore") {
      desired.current.set(
        pointer.ndcX * 0.22,
        0.82 + pointer.ndcY * 0.08,
        -1.55 - rail * 2.1,
      );
      desiredLook.current.set(pointer.ndcX * 0.35, 1.08, -4.4 - rail * 1.6);
    } else if (phase === "return") {
      desired.current.lerpVectors(
        new THREE.Vector3(0, 0.82, -2.8),
        new THREE.Vector3(0, 0.02, encounterZ),
        progress,
      );
      desiredLook.current.lerpVectors(
        new THREE.Vector3(0, 1.08, -4.4),
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
      phase === "explore" || phase === "enter" ? 36 : ENCOUNTER_FOV;
    persp.fov = THREE.MathUtils.damp(persp.fov, reducedMotion ? ENCOUNTER_FOV : fovTarget, 2, delta);
    persp.updateProjectionMatrix();
  });

  return null;
}
