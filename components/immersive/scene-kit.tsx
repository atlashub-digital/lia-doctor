'use client';

import { RoundedBox } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { DataTexture, Path, RepeatWrapping, RGBAFormat, Shape } from 'three';

export function archPath<T extends Shape | Path>(path: T, radius: number, base = 0, spring = 2.8): T {
  path.moveTo(-radius, base); path.lineTo(radius, base); path.lineTo(radius, spring);
  path.absarc(0, spring, radius, 0, Math.PI, false); path.lineTo(-radius, base);
  return path;
}

// An arched ring: outer arch minus inner opening. Defaults match the lobby door frames.
export function archFrame(outer = 1.22, inner = 1.04, spring = 2.8, base = -0.03) {
  const shape = archPath(new Shape(), outer, base, spring) as Shape;
  // The opening starts a hair above the outer base so the frame keeps a sill and the hole stays inside the shape.
  const sill = base + 0.03;
  const hole = new Path();
  hole.moveTo(-inner, sill); hole.lineTo(-inner, spring); hole.absarc(0, spring, inner, Math.PI, 0, true); hole.lineTo(inner, sill); hole.lineTo(-inner, sill);
  shape.holes.push(hole);
  return shape;
}

export function usePlaster(repeat = 6) {
  const map = useMemo(() => {
    const pixels = new Uint8Array(64 * 64 * 4);
    for (let i = 0; i < 64 * 64; i++) { const tone = 110 + ((i * 73 + (i % 17) * 29) % 55); pixels.set([tone, tone, tone, 255], i * 4); }
    const texture = new DataTexture(pixels, 64, 64, RGBAFormat); texture.wrapS = texture.wrapT = RepeatWrapping; texture.repeat.set(repeat, repeat); texture.needsUpdate = true; return texture;
  }, [repeat]);
  useEffect(() => () => map.dispose(), [map]);
  return map;
}

export function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh castShadow position={[0, .29, 0]}><cylinderGeometry args={[.24, .18, .56, 16]} /><meshStandardMaterial color="#bc9f79" roughness={.94} /></mesh>
    <mesh position={[0, .98, 0]}><cylinderGeometry args={[.018, .035, 1.1, 7]} /><meshStandardMaterial color="#63583c" /></mesh>
    {[0, 1, 2, 3, 4, 5].map(i => <mesh castShadow key={i} position={[Math.sin(i * 2.4) * .16, .74 + i * .13, Math.cos(i * 2.4) * .16]} rotation={[.4, i * 2.4, -.6]} scale={[.18, .42, .075]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? '#51684a' : '#344e35'} roughness={.8} /></mesh>)}
  </group>;
}

export function Chair({ position, color = '#e6d4b7' }: { position: [number, number, number]; color?: string }) {
  return <group position={position}>
    <RoundedBox args={[1.4, .3, 1.05]} radius={.13} position={[0, .48, 0]} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.98} /></RoundedBox>
    <RoundedBox args={[1.4, .7, .24]} radius={.12} position={[0, .9, -.43]} castShadow><meshStandardMaterial color={color} roughness={.98} /></RoundedBox>
    {[-.6, .6].map(x => <RoundedBox key={x} args={[.22, .5, 1.05]} radius={.1} position={[x, .73, 0]} castShadow><meshStandardMaterial color={color} roughness={.96} /></RoundedBox>)}
    {[-.5, .5].flatMap(x => [-.35, .35].map(z => <mesh key={`${x}:${z}`} position={[x, .15, z]}><cylinderGeometry args={[.035, .045, .3, 8]} /><meshStandardMaterial color="#6e5035" /></mesh>))}
  </group>;
}
