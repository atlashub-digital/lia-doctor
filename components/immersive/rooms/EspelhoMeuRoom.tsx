'use client';

import { Html, RoundedBox } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import { DoubleSide, Path, Shape, SRGBColorSpace, TextureLoader, type Group } from 'three';
import { espelhoLibrary, mirrorReflection, sceneTexture } from '@/lib/immersive';
import { archFrame, archPath, Plant, usePlaster } from '../scene-kit';

// Golden Room blockout (V1.1 S2). Layer contract: docs/immersive/05_V11_S1_AUDIT_GOLDEN_ROOM.md §3.
// Local space: x ∈ [-2.15, 2.15], z ∈ [-10, 0]; the arrival camera sits at (0, 1.65, -2.8) looking at z = -9.
const WIDTH = 4.3, HALF = WIDTH / 2, HEIGHT = 4.2;
const palette = { limestone: '#e7d6c1', peach: '#efc2aa', rose: '#d8aa9c', ivory: '#fbf8f0', copper: '#b77b5a', stone: '#e6d8c4' };
const coverTones = ['#efc2aa', '#d8aa9c', '#eec9b5', '#c99079', '#f4e6da'];
// Face-out volumes in the niche: [x, shelf y]. Order follows the catalogue (P01–P05).
const volumeSlots: [number, number][] = [[-.42, 1.22], [0, 1.22], [.42, 1.22], [-.22, 1.87], [.22, 1.87]];
const NICHE_X = .12, NICHE_Z = -9.86;
// Coastal window cut into the back wall, right of the niche: [centre x, half width, sill, spring].
const WINDOW = { x: 1.62, half: .42, sill: .55, spring: 2.55 };

// A rectangle of wall with an arched hole whose sides start at the rectangle's base.
function archedOpening(halfWidth: number, base: number, top: number, radius: number, spring: number) {
  const shape = new Shape();
  shape.moveTo(-halfWidth, base); shape.lineTo(halfWidth, base); shape.lineTo(halfWidth, top); shape.lineTo(-halfWidth, top); shape.lineTo(-halfWidth, base);
  const hole = new Path();
  hole.moveTo(-radius, base); hole.lineTo(-radius, spring); hole.absarc(0, spring, radius, Math.PI, 0, true); hole.lineTo(radius, base); hole.lineTo(-radius, base);
  shape.holes.push(hole);
  return shape;
}

function Volume({ slug, index, focused }: { slug: string; index: number; focused: boolean }) {
  const group = useRef<Group>(null);
  const { invalidate } = useThree();
  const [x, y] = volumeSlots[index];
  useEffect(() => {
    const target = group.current;
    if (!target) return;
    // Presented state: the volume slides off the shelf, lifts and turns its cover toward the visitor.
    const tween = gsap.to(target.position, { y: focused ? .07 : 0, z: focused ? .24 : 0, duration: .5, ease: 'power3.out', onUpdate: invalidate });
    const turn = gsap.to(target.rotation, { x: focused ? .1 : 0, y: focused ? (x <= 0 ? .42 : -.42) : 0, duration: .5, ease: 'power3.out', onUpdate: invalidate });
    return () => { tween.kill(); turn.kill(); };
  }, [focused, x, invalidate]);
  // Cover art is intentionally blank until the approved P01–P05 covers are supplied.
  return <group position={[NICHE_X + x, y, NICHE_Z + .2]}>
    <group ref={group} name={`espelho-book-${slug}`}>
      <mesh castShadow position={[0, .19, 0]} rotation={[-.07, 0, 0]}>
        <boxGeometry args={[.27, .38, .045]} />
        <meshStandardMaterial color={coverTones[index]} roughness={.82} emissive={focused ? '#ffb98c' : '#000000'} emissiveIntensity={focused ? .42 : 0} />
      </mesh>
      <mesh position={[-.128, .19, .006]} rotation={[-.07, 0, 0]}><boxGeometry args={[.016, .38, .047]} /><meshStandardMaterial color={palette.copper} roughness={.5} metalness={.35} /></mesh>
    </group>
  </group>;
}

function Spines({ x, y, count }: { x: number; y: number; count: number }) {
  const tones = ['#d9c3ae', '#c9a48e', '#eadbc8', '#b98a72', '#e3cdb8'];
  return <group position={[NICHE_X + x, y, NICHE_Z + .14]}>
    {Array.from({ length: count }, (_, i) => <mesh key={i} castShadow position={[i * .042, .15 + (i % 3) * .012, 0]} rotation={[0, 0, i === count - 1 ? -.16 : 0]}>
      <boxGeometry args={[.036, .3 + (i % 3) * .024, .2]} />
      <meshStandardMaterial color={tones[i % tones.length]} roughness={.9} />
    </mesh>)}
  </group>;
}

function NicheLibrary({ focusBook }: { focusBook: string | null }) {
  const frame = useMemo(() => archFrame(.86, .7, 2.32, 0), []);
  const back = useMemo(() => archPath(new Shape(), .7, 0, 2.32), []);
  return <group>
    <mesh castShadow receiveShadow position={[NICHE_X, 0, NICHE_Z]}><extrudeGeometry args={[frame, { depth: .26, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2, curveSegments: 32 }]} /><meshStandardMaterial color={palette.ivory} roughness={.88} /></mesh>
    <mesh receiveShadow position={[NICHE_X, 0, NICHE_Z + .01]}><shapeGeometry args={[back, 32]} /><meshStandardMaterial color="#e5d0bb" roughness={.95} /></mesh>
    <RoundedBox args={[1.38, .58, .36]} radius={.03} position={[NICHE_X, .29, NICHE_Z + .2]} castShadow receiveShadow><meshStandardMaterial color="#e8d9c6" roughness={.8} /></RoundedBox>
    {[1.2, 1.85, 2.5].map(y => <mesh key={y} castShadow receiveShadow position={[NICHE_X, y, NICHE_Z + .16]}><boxGeometry args={[1.38, .035, .3]} /><meshStandardMaterial color="#d9c1a3" roughness={.7} /></mesh>)}
    {espelhoLibrary.map((book, i) => <Volume key={book.slug} slug={book.slug} index={i} focused={focusBook === book.slug} />)}
    <Spines x={-.66} y={1.87} count={5} />
    <Spines x={.44} y={1.87} count={5} />
    <Spines x={-.5} y={2.52} count={9} />
    <mesh castShadow position={[NICHE_X + .36, 2.66, NICHE_Z + .16]}><sphereGeometry args={[.12, 24, 16]} /><meshStandardMaterial color="#e9e0d2" roughness={.6} /></mesh>
    <pointLight position={[NICHE_X, 2.9, NICHE_Z + .7]} color="#ffdcbc" intensity={1.4} distance={2.4} decay={2} />
  </group>;
}

function Mirror({ active }: { active: boolean }) {
  // Satin glass placeholder: no environment map yet, so a metallic mirror would read as a dark hole (V1 defect).
  return <group position={[-1.22, 0, -9.1]} rotation={[0, .36, 0]}>
    <group position={[0, 1.3, 0]} scale={[1, 2.05, 1]}>
      <mesh position={[0, 0, -.03]}><circleGeometry args={[.6, 64]} /><meshBasicMaterial color="#ffd8bb" transparent opacity={.32} /></mesh>
      <mesh><circleGeometry args={[.48, 64]} /><meshPhysicalMaterial color="#f3e6dc" roughness={.14} metalness={.08} clearcoat={1} clearcoatRoughness={.1} emissive="#f2cdb4" emissiveIntensity={.22} /></mesh>
      <mesh position={[0, 0, .01]}><torusGeometry args={[.5, .028, 12, 72]} /><meshPhysicalMaterial color={palette.copper} metalness={.6} roughness={.32} /></mesh>
    </group>
    {[-.2, .2].map(x => <mesh key={x} castShadow position={[x, .14, .05]} rotation={[.12, 0, 0]}><boxGeometry args={[.04, .3, .04]} /><meshStandardMaterial color={palette.copper} metalness={.55} roughness={.35} /></mesh>)}
    <pointLight position={[.2, 1.4, .5]} color="#ffd6b6" intensity={.9} distance={2} decay={2} />
    {active ? <Html position={[0, 1.42, .06]} center zIndexRange={[4, 0]} className="lia-mirror-phrase" pointerEvents="none">
      <p>{mirrorReflection}</p>
    </Html> : null}
  </group>;
}

function CoastWindow() {
  const { invalidate } = useThree();
  const view = useMemo(() => {
    // Placeholder for environment plate #7: the master's own coastline, never the navigable room.
    const texture = new TextureLoader().load(sceneTexture, () => invalidate());
    texture.colorSpace = SRGBColorSpace;
    // Coast and Sugarloaf only (x 20–188, y 285–440): stops left of the master's "MAIS TU." lettering.
    texture.repeat.set(168 / 1672, 155 / 941);
    texture.offset.set(20 / 1672, 1 - 440 / 941);
    return texture;
  }, [invalidate]);
  useEffect(() => () => view.dispose(), [view]);
  const frame = useMemo(() => archFrame(WINDOW.half + .1, WINDOW.half, WINDOW.spring, WINDOW.sill), []);
  const spandrel = useMemo(() => archedOpening(WINDOW.half, WINDOW.sill, 3.1, WINDOW.half, WINDOW.spring), []);
  return <group position={[WINDOW.x, 0, -10]}>
    <mesh position={[-.25, 1.85, -.7]}><planeGeometry args={[2.2, 2.04]} /><meshBasicMaterial map={view} toneMapped={false} /></mesh>
    <mesh position={[0, 0, -.1]}><extrudeGeometry args={[spandrel, { depth: .2, bevelEnabled: false, curveSegments: 32 }]} /><meshStandardMaterial color={palette.limestone} roughness={.95} /></mesh>
    <mesh castShadow position={[0, 0, .06]}><extrudeGeometry args={[frame, { depth: .1, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 2, curveSegments: 32 }]} /><meshStandardMaterial color={palette.ivory} roughness={.85} /></mesh>
    <mesh position={[0, WINDOW.sill, .14]}><boxGeometry args={[WINDOW.half * 2 + .24, .05, .2]} /><meshStandardMaterial color={palette.stone} roughness={.6} /></mesh>
  </group>;
}

function Bench() {
  return <group position={[1.42, 0, -9.42]}>
    <RoundedBox args={[1.3, .16, .46]} radius={.07} position={[0, .44, 0]} castShadow receiveShadow><meshStandardMaterial color={palette.rose} roughness={.97} /></RoundedBox>
    <RoundedBox args={[1.3, .2, .46]} radius={.04} position={[0, .27, 0]} castShadow><meshStandardMaterial color="#e2cdb6" roughness={.9} /></RoundedBox>
    {[-.56, .56].map(x => <mesh key={x} position={[x, .085, 0]}><boxGeometry args={[.08, .17, .38]} /><meshStandardMaterial color="#8a6648" roughness={.7} /></mesh>)}
    <RoundedBox args={[.38, .3, .12]} radius={.05} position={[.32, .66, -.1]} rotation={[-.2, 0, .05]} castShadow><meshStandardMaterial color="#eec9b5" roughness={.98} /></RoundedBox>
  </group>;
}

function StoneTable() {
  const stems = [[-.06, .02], [.05, -.03], [0, .05], [.08, .04], [-.04, -.05]] as const;
  return <group position={[.62, 0, -6.95]}>
    <mesh castShadow receiveShadow position={[0, .41, 0]} scale={[1, 1, .68]}><cylinderGeometry args={[.5, .48, .07, 48]} /><meshPhysicalMaterial color={palette.stone} roughness={.58} clearcoat={.15} /></mesh>
    <mesh castShadow position={[0, .19, 0]} scale={[1, 1, .7]}><cylinderGeometry args={[.2, .3, .38, 32]} /><meshStandardMaterial color="#ddcbb2" roughness={.7} /></mesh>
    <mesh castShadow position={[.14, .55, .02]}><cylinderGeometry args={[.06, .085, .22, 24]} /><meshStandardMaterial color="#efe6da" roughness={.55} /></mesh>
    {stems.map(([x, z], i) => <group key={i} position={[.14 + x, .66, .02 + z]}>
      <mesh position={[0, .08, 0]}><cylinderGeometry args={[.006, .006, .18, 5]} /><meshStandardMaterial color="#5d6b4a" /></mesh>
      <mesh castShadow position={[0, .19, 0]}><sphereGeometry args={[.042, 12, 10]} /><meshStandardMaterial color={i % 2 ? '#e7a99a' : '#f2c6b6'} roughness={.85} /></mesh>
    </group>)}
    <mesh castShadow position={[-.22, .46, .05]} rotation={[0, .4, 0]}><boxGeometry args={[.22, .03, .3]} /><meshStandardMaterial color="#efc2aa" roughness={.85} /></mesh>
  </group>;
}

export function EspelhoMeuRoom({ focusBook, active }: { focusBook: string | null; active: boolean }) {
  const plaster = usePlaster();
  // Foreground plane: the jambs of this arch occlude the room edges at arrival.
  const arch = useMemo(() => archedOpening(HALF, 0, HEIGHT, 1.25, 2.2), []);
  const curtain = useMemo(() => archPath(new Shape(), .8, .4, 2.6), []);
  return <group name="room-interior-espelho-meu">
    {/* Back wall split around the coastal window opening. */}
    {[[-HALF, WINDOW.x - WINDOW.half], [WINDOW.x + WINDOW.half, HALF]].map(([from, to]) => <mesh key={from} receiveShadow position={[(from + to) / 2, HEIGHT / 2, -10]}><boxGeometry args={[to - from + .02, HEIGHT, .2]} /><meshStandardMaterial color={palette.limestone} roughness={.93} bumpMap={plaster} bumpScale={.016} /></mesh>)}
    <mesh position={[WINDOW.x, WINDOW.sill / 2, -10]}><boxGeometry args={[WINDOW.half * 2, WINDOW.sill, .2]} /><meshStandardMaterial color={palette.limestone} roughness={.95} /></mesh>
    <mesh position={[WINDOW.x, (3.1 + HEIGHT) / 2, -10]}><boxGeometry args={[WINDOW.half * 2, HEIGHT - 3.1, .2]} /><meshStandardMaterial color={palette.limestone} roughness={.95} /></mesh>
    {[-HALF, HALF].map(x => <mesh key={x} receiveShadow position={[x, HEIGHT / 2, -5]}><boxGeometry args={[.15, HEIGHT, 10]} /><meshStandardMaterial color={palette.limestone} roughness={.95} bumpMap={plaster} bumpScale={.015} /></mesh>)}
    <mesh position={[0, HEIGHT, -5]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[WIDTH, 10]} /><meshStandardMaterial color="#e4d5c1" roughness={1} side={DoubleSide} /></mesh>
    <mesh receiveShadow position={[0, .015, -5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[WIDTH, 10]} /><meshPhysicalMaterial color="#d9c6ad" roughness={.5} clearcoat={.2} clearcoatRoughness={.4} bumpMap={plaster} bumpScale={.006} /></mesh>
    {[[-HALF + .09, -5, 10, Math.PI / 2], [HALF - .09, -5, 10, Math.PI / 2], [0, -9.89, WIDTH, 0]].map(([x, z, length, turn]) => <mesh key={`${x}:${z}`} position={[x, .06, z]} rotation={[0, turn, 0]}><boxGeometry args={[length, .12, .025]} /><meshStandardMaterial color="#e2d3bf" roughness={.7} /></mesh>)}
    {/* Sheer curtain over the left window: the key light source, kept off-axis behind the copy card. */}
    <group position={[-HALF + .1, 0, -6.9]} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0, 0]}><shapeGeometry args={[curtain, 32]} /><meshBasicMaterial color="#fff1dc" toneMapped={false} /></mesh>
    </group>
    <pointLight position={[-1.55, 2.3, -6.9]} color="#ffc69a" intensity={4} distance={6} decay={2} />
    <mesh position={[.15, .02, -7.45]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.45, 1, 1]}><circleGeometry args={[1.05, 64]} /><meshStandardMaterial color="#e8cfbf" roughness={1} bumpMap={plaster} bumpScale={.02} /></mesh>
    <mesh castShadow receiveShadow position={[0, 0, -5.15]}><extrudeGeometry args={[arch, { depth: .3, bevelEnabled: true, bevelSize: .02, bevelThickness: .02, bevelSegments: 2, curveSegments: 40 }]} /><meshStandardMaterial color={palette.peach} roughness={.9} bumpMap={plaster} bumpScale={.012} side={DoubleSide} /></mesh>
    <NicheLibrary focusBook={focusBook} />
    <Mirror active={active} />
    <CoastWindow />
    <Bench />
    <StoneTable />
    <Plant position={[-1.78, 0, -7.9]} scale={.85} />
  </group>;
}
