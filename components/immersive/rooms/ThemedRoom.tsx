'use client';

import { Html, RoundedBox } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CatmullRomCurve3, Color, DoubleSide, EllipseCurve, InstancedMesh, MeshPhysicalMaterial, MeshStandardMaterial,
  Object3D, Path, PlaneGeometry, PMREMGenerator, type PointLight, Shape, ShapeGeometry, SRGBColorSpace, TextureLoader, Vector2, Vector3, type Group, type Material, type Texture,
} from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mirrorReflection } from '@/lib/immersive';
import type { RoomId } from '@/lib/immersive';
import { workbookCover, type ShelfItem } from '@/lib/shelves';
import { archFrame, archPath } from '../scene-kit';
import { bookcloth, coastView, isSharedTexture, limePlaster, linen, oak, pendingCover, spineLabel, travertine } from './espelho-materials';

// Themed rooms of the LIA house. The EspelhoMeu Golden Room (V1.1 look-dev, docs 05–06) is the reference kit; each
// theme swaps palette, furniture and shelf: EspelhoMeu "Galeria do Reflexo", Me Sentir Leve "Jardim da Leveza",
// Corpo "Atelier da Força Serena", Mente & Calma "Sala da Pausa".
// Local space: x ∈ [-2.15, 2.15], z ∈ [-10, 0]; the arrival camera sits at (0, 1.65, -2.8) looking at z = -9.
const WIDTH = 4.3, HALF = WIDTH / 2, HEIGHT = 4.2;
type Theme = {
  wall: [string, string]; arch: [string, string]; floor: [string, string]; stone: [string, string];
  upA: string; upB: string; wood: string; tones: string[]; rug: 'a' | 'b';
  furniture: 'salon' | 'garden' | 'atelier' | 'pause'; sun: number;
};
export const THEMES: Record<RoomId, Theme> = {
  'espelho-meu': { wall: ['#dcc2a4', '#c6a483'], arch: ['#e9b69c', '#d59c82'], floor: ['#d9c19f', '#c3a37c'], stone: ['#e6d6be', '#cdb593'], upA: '#d9a493', upB: '#ecc5ae', wood: '#c9a57c', tones: ['#e7b59c', '#cf9a8b', '#efcdb8', '#b9806a', '#efe0d0'], rug: 'b', furniture: 'salon', sun: 1 },
  'me-sentir-leve': { wall: ['#e0d9c4', '#c9c4a8'], arch: ['#56715b', '#435e4a'], floor: ['#d8c6a6', '#c2ab87'], stone: ['#e6dcc6', '#cdbf9f'], upA: '#9daf91', upB: '#efe6d2', wood: '#b8956a', tones: ['#3f5e4b', '#9daf91', '#e5d7c0', '#6f7d57', '#d8c6a6'], rug: 'a', furniture: 'garden', sun: 1 },
  corpo: { wall: ['#e2d3bb', '#cdb896'], arch: ['#d8c6a7', '#c4ae88'], floor: ['#cdb48f', '#b89a72'], stone: ['#e3d6bf', '#cbb894'], upA: '#3d6b5a', upB: '#e8dbc2', wood: '#a8885b', tones: ['#24493e', '#e8dbc2', '#a8885b', '#70816a', '#d8c6a7'], rug: 'a', furniture: 'atelier', sun: 1.1 },
  'mente-e-calma': { wall: ['#e9e2d2', '#d6cdb8'], arch: ['#a3b3a0', '#8fa08c'], floor: ['#ddd0b8', '#c9b998'], stone: ['#eae2d1', '#d3c7ae'], upA: '#c9d2c2', upB: '#f2ebde', wood: '#c2a27a', tones: ['#a3b3a0', '#dccfb7', '#efe6d6', '#8fa08c', '#c9b998'], rug: 'b', furniture: 'pause', sun: .75 },
};
// The room's official volumes stand spine-out together on the middle shelf, in catalogue order.
const VOLUME_SHELF = 1.22, VOLUME_WIDTH = .26;
const volumeX = (count: number) => Array.from({ length: count }, (_, i) => -.04 + (i - (count - 1) / 2) * .065);
// Where a selected volume is presented, in room space (arrival camera at z = -2.8). Desktop leaves the right third
// to the editorial sheet; mobile lifts the book above the bottom sheet.
const PRESENT = { desktop: { x: -.2, y: 1.6, z: -4.35, scale: 1.55 }, mobile: { x: 0, y: 2.04, z: -4.3, scale: .61 } };
const NICHE_X = .12, NICHE_Z = -9.86;
// Coastal window in the back wall, right of the niche.
const WINDOW = { x: 1.62, half: .42, sill: .55, spring: 2.55 };
// Sun window in the left wall (camera-left key light, as in the lobby master).
const SUN_WINDOW = { z: -6.9, half: .62, sill: .45, spring: 2.35 };

// A rectangle of wall with an arched hole whose sides start at the rectangle's base.
function archedOpening(halfWidth: number, base: number, top: number, radius: number, spring: number) {
  const shape = new Shape();
  shape.moveTo(-halfWidth, base); shape.lineTo(halfWidth, base); shape.lineTo(halfWidth, top); shape.lineTo(-halfWidth, top); shape.lineTo(-halfWidth, base);
  const hole = new Path();
  hole.moveTo(-radius, base); hole.lineTo(-radius, spring); hole.absarc(0, spring, radius, Math.PI, 0, true); hole.lineTo(radius, base); hole.lineTo(-radius, base);
  shape.holes.push(hole);
  return shape;
}

function roundedRect(width: number, depth: number, radius: number) {
  const shape = new Shape(), w = width / 2, d = depth / 2;
  shape.moveTo(-w + radius, -d); shape.lineTo(w - radius, -d); shape.quadraticCurveTo(w, -d, w, -d + radius);
  shape.lineTo(w, d - radius); shape.quadraticCurveTo(w, d, w - radius, d); shape.lineTo(-w + radius, d);
  shape.quadraticCurveTo(-w, d, -w, d - radius); shape.lineTo(-w, -d + radius); shape.quadraticCurveTo(-w, -d, -w + radius, -d);
  return shape;
}

// Soft organic slab outline (superellipse with a gentle wobble) for the stone table.
function pebble(rx: number, rz: number) {
  const shape = new Shape();
  for (let i = 0; i <= 96; i++) {
    const t = i / 96 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), wobble = 1 + .035 * Math.sin(3 * t + .6);
    const x = Math.sign(c) * Math.abs(c) ** .7 * rx * wobble, y = Math.sign(s) * Math.abs(s) ** .7 * rz * wobble;
    if (i === 0) shape.moveTo(x, y); else shape.lineTo(x, y);
  }
  return shape;
}

const lathe = (points: [number, number][]) => points.map(([x, y]) => new Vector2(x, y));

function useDisposable<T extends { dispose: () => void }>(factory: () => T[], deps: unknown[] = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(factory, deps);
  useEffect(() => () => items.forEach(item => { if (!isSharedTexture(item)) item.dispose(); }), [items]);
  return items;
}

// All materials of the room, built once. Procedural maps stand in for a sourced PBR library (asset #5/#6).
function useRoomMaterials(theme: Theme) {
  const gl = useThree(state => state.gl);
  const env = useMemo(() => {
    const generator = new PMREMGenerator(gl);
    const texture = generator.fromScene(new RoomEnvironment(), .04).texture;
    generator.dispose();
    return texture;
  }, [gl]);
  useEffect(() => () => env.dispose(), [env]);

  const textures = useDisposable<Texture>(() => {
    const wall = limePlaster(...theme.wall, 11, [3, 2]);
    const archTone = limePlaster(...theme.arch, 23, [2, 2]);
    const floor = travertine(...theme.floor, 5, [2, 5]);
    const stone = travertine(...theme.stone, 9, [1, 1]);
    const rose = linen(theme.upA, 31, [3, 3]);
    const peach = linen(theme.upB, 37, [3, 3]);
    const sheer = linen('#fbf2e4', 41, [6, 6]);
    return [wall.map, wall.bump, archTone.map, archTone.bump, floor.map, floor.rough, floor.bump, stone.map, stone.rough, rose.map, rose.bump, peach.map, peach.bump, sheer.map, oak(theme.wood, 51, [1, 1]), coastView(61), ...theme.tones.map((tone, i) => bookcloth(tone, 70 + i))];
  }, [theme]);
  const [wallMap, wallBump, archMap, archBump, floorMap, floorRough, floorBump, stoneMap, stoneRough, roseMap, roseBump, peachMap, peachBump, sheerMap, oakMap, coastMap, ...coverMaps] = textures;

  const materials = useDisposable<Material>(() => {
    const standard = (options: ConstructorParameters<typeof MeshStandardMaterial>[0]) => new MeshStandardMaterial({ envMap: env, envMapIntensity: .3, ...options });
    const physical = (options: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) => new MeshPhysicalMaterial({ envMap: env, envMapIntensity: .38, ...options });
    return [
      standard({ map: wallMap, bumpMap: wallBump, bumpScale: .9, roughness: .93 }),
      standard({ map: archMap, bumpMap: archBump, bumpScale: .9, roughness: .9 }),
      physical({ map: floorMap, roughnessMap: floorRough, bumpMap: floorBump, bumpScale: 1.4, roughness: .62, clearcoat: .22, clearcoatRoughness: .35 }),
      physical({ map: stoneMap, roughnessMap: stoneRough, roughness: .55, clearcoat: .15 }),
      standard({ map: roseMap, bumpMap: roseBump, bumpScale: 1.5, roughness: .97, envMapIntensity: .3 }),
      standard({ map: peachMap, bumpMap: peachBump, bumpScale: 1.5, roughness: .97, envMapIntensity: .3 }),
      standard({ map: sheerMap, color: '#fff6ea', emissive: new Color('#ffe6c4'), emissiveIntensity: .32, transparent: true, opacity: .62, side: DoubleSide, roughness: 1, depthWrite: false }),
      standard({ map: oakMap, roughness: .58 }),
      physical({ color: '#b97a55', metalness: .92, roughness: .3, envMapIntensity: 1.1 }),
      physical({ color: '#efe6d8', roughness: .38, clearcoat: .6, clearcoatRoughness: .2 }),
      standard({ color: '#f4ebdc', roughness: .9 }),
      standard({ map: coastMap, roughness: 1, envMapIntensity: 0, emissive: new Color('#ffffff'), emissiveMap: coastMap, emissiveIntensity: .85 }),
      ...coverMaps.map(map => standard({ map, roughness: .85, envMapIntensity: .35 })),
    ];
  }, [env, ...textures]);
  const [wall, arch, floor, stone, rose, peach, sheer, wood, copper, ceramic, pages, coast, ...covers] = materials;
  return { env, wall, arch, floor, stone, rose, peach, sheer, wood, copper, ceramic, pages, coast, covers };
}
type RoomMaterials = ReturnType<typeof useRoomMaterials>;

type BookHandlers = { onHover: (slug: string | null) => void; onSelect: (slug: string) => void };

// Spine, front board and back cloth for each official volume. Fronts carry the official cover art; a volume without a cover falls back to an explicit "pending" plate, never an invented cover.
function loadCover(src: string, invalidate: () => void) {
  const texture = new TextureLoader().load(src, () => invalidate());
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}
function useVolumeMaterials(items: ShelfItem[], tones: string[], env: Texture, workbook: boolean) {
  const { invalidate } = useThree();
  const textures = useDisposable<Texture>(() => [
    ...items.flatMap((item, i) => {
      const tone = tones[i % tones.length];
      const front = item.cover ? loadCover(item.cover, invalidate) : pendingCover(item.title, item.code);
      return [spineLabel(item.title, item.code, tone), front, bookcloth(tone, 90 + i)];
    }),
    ...(workbook ? [spineLabel('O Meu Corpo em Construção', 'Workbook', '#efe6d6'), loadCover(workbookCover.src, invalidate), bookcloth('#efe6d6', 99)] : []),
  ], [items, tones, workbook, invalidate]);
  const materials = useDisposable<Material>(() => textures.map((map, i) => new MeshStandardMaterial({ map, roughness: i % 3 === 1 ? .62 : .86, envMap: env, envMapIntensity: .35 })), [env, ...textures]);
  const sets = Array.from({ length: materials.length / 3 }, (_, i) => ({ spine: materials[i * 3], front: materials[i * 3 + 1], back: materials[i * 3 + 2] }));
  return { volumes: sets.slice(0, items.length), workbook: workbook ? sets[items.length] : null };
}

function Volume({ item, x, hovered, selected, mobile, faces, handlers }: {
  item: ShelfItem; x: number; hovered: boolean; selected: boolean; mobile: boolean; faces: Material[]; handlers: BookHandlers;
}) {
  const group = useRef<Group>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const { invalidate, gl } = useThree();
  const slot = { x: NICHE_X + x, y: VOLUME_SHELF, z: NICHE_Z + .18 };
  const height = VOLUME_WIDTH * item.ratio;
  // Spine-out on the shelf. Set once here: a JSX rotation prop would be re-applied on every render and fight GSAP.
  useLayoutEffect(() => { group.current?.rotation.set(0, Math.PI / 2, 0); }, []);
  useEffect(() => {
    const target = group.current;
    if (!target) return;
    timeline.current?.kill();
    const tl = gsap.timeline({ onUpdate: invalidate });
    const atRest = Math.abs(target.position.x) < 1e-3 && Math.abs(target.position.y) < 1e-3 && target.scale.x === 1;
    if (selected) {
      const pose = mobile ? PRESENT.mobile : PRESENT.desktop;
      // Pull off the shelf, then carry it to the visitor while it turns its front board toward the camera.
      tl.to(target.position, { z: .34, duration: .32, ease: 'power2.out' })
        .to(target.position, { x: pose.x - slot.x, y: pose.y - slot.y - height / 2 * pose.scale, z: pose.z - slot.z, duration: .95, ease: 'power3.inOut' })
        .to(target.rotation, { x: -.04, y: 0, duration: .95, ease: 'power3.inOut' }, '<')
        .to(target.scale, { x: pose.scale, y: pose.scale, z: pose.scale, duration: .95, ease: 'power3.inOut' }, '<');
    } else if (atRest) {
      tl.to(target.position, { z: hovered ? .1 : 0, duration: .3, ease: 'power2.out' });
    } else {
      // Return: shrink and turn back to spine-out in front of the shelf, then slide home.
      tl.to(target.scale, { x: 1, y: 1, z: 1, duration: .8, ease: 'power3.inOut' })
        .to(target.rotation, { x: 0, y: Math.PI / 2, duration: .8, ease: 'power3.inOut' }, '<')
        .to(target.position, { x: 0, y: 0, z: .34, duration: .8, ease: 'power3.inOut' }, '<')
        .to(target.position, { z: hovered ? .1 : 0, duration: .3, ease: 'power2.out' });
    }
    // Settled state for tests and for the cached reflection/shadows: "<slug>" once presented, "shelf" once home.
    tl.eventCallback('onComplete', () => {
      if (selected) gl.domElement.dataset.bookState = item.slug;
      else if (!atRest || !gl.domElement.dataset.bookState) gl.domElement.dataset.bookState = 'shelf';
      gl.domElement.dispatchEvent(new Event('lia:scene-changed'));
      invalidate();
    });
    if (selected || !atRest) gl.domElement.dataset.bookState = 'moving';
    timeline.current = tl;
    return () => { tl.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, hovered, mobile, invalidate]);
  return <group position={[slot.x, slot.y, slot.z]}>
    <group ref={group} name={`espelho-book-${item.slug}`}>
      <mesh castShadow receiveShadow position={[0, height / 2, 0]} material={faces}
        onPointerOver={event => { event.stopPropagation(); if (!selected) { handlers.onHover(item.slug); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={() => { handlers.onHover(null); document.body.style.cursor = ''; }}
        onClick={event => { event.stopPropagation(); if (!selected) { document.body.style.cursor = ''; handlers.onSelect(item.slug); } }}>
        <boxGeometry args={[VOLUME_WIDTH, height, .06]} />
      </mesh>
    </group>
  </group>;
}

function Spines({ x, y, count, m, seed }: { x: number; y: number; count: number; m: RoomMaterials; seed: number }) {
  return <group position={[NICHE_X + x, y, NICHE_Z + .14]}>
    {Array.from({ length: count }, (_, i) => {
      const height = .27 + ((i * 7 + seed) % 5) * .018, cover = m.covers[(i + seed) % m.covers.length];
      return <mesh key={i} castShadow receiveShadow position={[i * .04, height / 2, 0]} rotation={[0, 0, i === count - 1 ? -.17 : 0]} material={[m.pages, cover, m.pages, m.pages, cover, cover]}>
        <boxGeometry args={[.034, height, .2]} />
      </mesh>;
    })}
  </group>;
}

function Ceramic({ position, profile, m }: { position: [number, number, number]; profile: [number, number][]; m: RoomMaterials }) {
  const points = useMemo(() => lathe(profile), [profile]);
  return <mesh castShadow receiveShadow position={position} material={m.ceramic}><latheGeometry args={[points, 48]} /></mesh>;
}

const tallVase: [number, number][] = [[0, 0], [.05, 0], [.07, .04], [.075, .12], [.05, .2], [.032, .26], [.04, .3], [0, .3]];
const bowl: [number, number][] = [[0, 0], [.05, 0], [.1, .03], [.12, .07], [.115, .075], [0, .03]];

// One warm accent light, always mounted, that travels to the hovered or presented volume. Mounting and unmounting
// lights changes the light count, which recompiles every material in the scene (seconds on modest GPUs).
function AccentLight({ items, focusBook, selectedBook, mobile }: { items: ShelfItem[]; focusBook: string | null; selectedBook: string | null; mobile: boolean }) {
  const light = useRef<PointLight>(null);
  const { invalidate } = useThree();
  useEffect(() => {
    const target = light.current;
    if (!target) return;
    const xs = volumeX(items.length), index = items.findIndex(item => item.slug === (selectedBook ?? focusBook));
    const pose = mobile ? PRESENT.mobile : PRESENT.desktop;
    const to = selectedBook ? { x: pose.x + .35, y: pose.y + .45, z: pose.z + .9, intensity: .45 }
      : index >= 0 ? { x: NICHE_X + xs[index] + .05, y: VOLUME_SHELF + .32, z: NICHE_Z + .65, intensity: .7 } : { intensity: 0 };
    const tween = gsap.to(target, { intensity: to.intensity, duration: .4, onUpdate: invalidate });
    if ('x' in to) gsap.set(target.position, { x: to.x, y: to.y, z: to.z });
    return () => { tween.kill(); };
  }, [items, focusBook, selectedBook, mobile, invalidate]);
  return <pointLight ref={light} color="#ffd9b8" intensity={0} distance={1.6} decay={2} position={[NICHE_X, VOLUME_SHELF + .32, NICHE_Z + .65]} />;
}

function NicheLibrary({ items, workbook, tones, focusBook, selectedBook, mobile, handlers, m }: { items: ShelfItem[]; workbook: boolean; tones: string[]; focusBook: string | null; selectedBook: string | null; mobile: boolean; handlers: BookHandlers; m: RoomMaterials }) {
  const frame = useMemo(() => archFrame(.86, .7, 2.32, 0), []);
  const back = useMemo(() => archPath(new Shape(), .7, 0, 2.32), []);
  const sets = useVolumeMaterials(items, tones, m.env, workbook);
  const xs = volumeX(items.length);
  // Box faces: +x fore-edge, -x spine, +y head, -y tail, +z front board, -z back board.
  const faces = useMemo(() => sets.volumes.map(v => [m.pages, v.spine, m.pages, m.pages, v.front, v.back]), [sets, m.pages]);
  const workbookFaces = useMemo(() => sets.workbook ? [m.pages, sets.workbook.spine, m.pages, m.pages, sets.workbook.front, sets.workbook.back] : null, [sets, m.pages]);
  return <group>
    <mesh castShadow receiveShadow position={[NICHE_X, 0, NICHE_Z]} material={m.wall}><extrudeGeometry args={[frame, { depth: .3, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 4, curveSegments: 48 }]} /></mesh>
    <mesh receiveShadow position={[NICHE_X, 0, NICHE_Z + .01]} material={m.arch}><shapeGeometry args={[back, 48]} /></mesh>
    <RoundedBox args={[1.38, .58, .36]} radius={.02} smoothness={3} position={[NICHE_X, .29, NICHE_Z + .2]} castShadow receiveShadow material={m.wood} />
    {[1.2, 1.85, 2.5].map(y => <group key={y}>
      <mesh castShadow receiveShadow position={[NICHE_X, y, NICHE_Z + .16]} material={m.wood}><boxGeometry args={[1.38, .035, .3]} /></mesh>
      {/* Concealed warm LED under each shelf. */}
      <mesh position={[NICHE_X, y - .021, NICHE_Z + .27]}><boxGeometry args={[1.2, .006, .012]} /><meshBasicMaterial color="#ffd8a6" toneMapped={false} /></mesh>
    </group>)}
    {items.map((item, i) => <Volume key={item.slug} item={item} x={xs[i]} faces={faces[i]} mobile={mobile} handlers={handlers}
      hovered={focusBook === item.slug && selectedBook !== item.slug} selected={selectedBook === item.slug} />)}
    <AccentLight items={items} focusBook={focusBook} selectedBook={selectedBook} mobile={mobile} />
    {/* The workbook included with Corpo Forte, displayed face-out on the upper shelf. */}
    {workbookFaces ? <mesh castShadow receiveShadow position={[NICHE_X - .02, 1.87 + .25 * workbookCover.ratio / 2, NICHE_Z + .2]} rotation={[-.08, .05, 0]} material={workbookFaces}><boxGeometry args={[.25, .25 * workbookCover.ratio, .03]} /></mesh> : null}
    <Spines x={-.62} y={VOLUME_SHELF + .02} count={10} m={m} seed={4} />
    <Spines x={.19} y={VOLUME_SHELF + .02} count={9} m={m} seed={6} />
    <Spines x={-.66} y={1.87} count={5} m={m} seed={1} />
    <Spines x={.44} y={1.87} count={5} m={m} seed={3} />
    <Spines x={-.5} y={2.52} count={9} m={m} seed={2} />
    {workbook ? null : <Ceramic position={[NICHE_X - .02, 1.87, NICHE_Z + .18]} profile={tallVase} m={m} />}
    {items.length ? null : <Ceramic position={[NICHE_X - .04, VOLUME_SHELF + .02, NICHE_Z + .2]} profile={bowl} m={m} />}
    <Ceramic position={[NICHE_X + .36, 2.52, NICHE_Z + .18]} profile={tallVase} m={m} />
    <Ceramic position={[NICHE_X + .45, .6, NICHE_Z + .25]} profile={bowl} m={m} />
  </group>;
}

function Mirror({ active, mobile, m }: { active: boolean; mobile: boolean; m: RoomMaterials }) {
  // `active` is false while a volume is presented, so the DOM phrase never floats over the book.
  const { invalidate } = useThree();
  const reflector = useMemo(() => {
    const oval = new Shape(); oval.absellipse(0, 0, .48, .98, 0, Math.PI * 2, false, 0);
    // Real planar reflection of the room, faintly warmed by the copper-tinted glass.
    const mirror = new Reflector(new ShapeGeometry(oval, 64), { color: 0x8c847c, textureWidth: mobile ? 384 : 640, textureHeight: mobile ? 768 : 1280, clipBias: .003 });
    return mirror;
  }, [mobile]);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    // The reflection is the most expensive pass (a second render of the scene). Re-render it only when the camera
    // moves or the room announces a change (a book settled); otherwise keep the previous reflection texture.
    const render = reflector.onBeforeRender.bind(reflector);
    const lastCamera = new Float32Array(16);
    let dirty = true;
    reflector.onBeforeRender = (renderer, scene, camera, ...rest) => {
      const moved = camera.matrixWorld.elements.some((value, i) => value !== lastCamera[i]);
      if (!dirty && !moved) return;
      lastCamera.set(camera.matrixWorld.elements); dirty = false;
      render(renderer, scene, camera, ...rest);
    };
    const markDirty = () => { dirty = true; };
    gl.domElement.addEventListener('lia:scene-changed', markDirty);
    invalidate();
    return () => { gl.domElement.removeEventListener('lia:scene-changed', markDirty); reflector.geometry.dispose(); reflector.dispose(); };
  }, [reflector, invalidate, gl]);
  const rim = useMemo(() => {
    const ellipse = new EllipseCurve(0, 0, .5, 1, 0, Math.PI * 2, false, 0);
    return new CatmullRomCurve3(ellipse.getPoints(160).map(p => new Vector3(p.x, p.y, 0)), true);
  }, []);
  const halo = useMemo(() => { const shape = new Shape(); shape.absellipse(0, 0, .64, 1.14, 0, Math.PI * 2, false, 0); return shape; }, []);
  return <group position={[-1.22, 0, -9.1]} rotation={[0, .36, 0]}>
    <group position={[0, 1.3, 0]}>
      {/* Backlit halo, as on the lobby master's mirror. */}
      <mesh position={[0, 0, -.05]}><shapeGeometry args={[halo, 64]} /><meshBasicMaterial color="#ffcfa3" transparent opacity={.28} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -.04]} scale={.93}><shapeGeometry args={[halo, 64]} /><meshBasicMaterial color="#ffe0bd" transparent opacity={.3} toneMapped={false} /></mesh>
      <primitive object={reflector} position={[0, 0, .002]} />
      <mesh castShadow material={m.copper}><tubeGeometry args={[rim, 200, .03, 14, true]} /></mesh>
    </group>
    {[-.24, .24].map(x => <mesh key={x} castShadow position={[x, .17, .04]} rotation={[.1, 0, 0]} material={m.copper}><cylinderGeometry args={[.012, .016, .34, 12]} /></mesh>)}
    {/* Always mounted and only faded: unmounting drei's Html during a route change raced React's own DOM removal. */}
    <Html position={[0, 1.45, .06]} center zIndexRange={[4, 0]} className={`lia-mirror-phrase ${active ? '' : 'is-hidden'}`} pointerEvents="none">
      <p>{mirrorReflection}</p>
    </Html>
  </group>;
}

function CoastWindow({ m }: { m: RoomMaterials }) {
  const frame = useMemo(() => archFrame(WINDOW.half + .1, WINDOW.half, WINDOW.spring, WINDOW.sill), []);
  const spandrel = useMemo(() => archedOpening(WINDOW.half, WINDOW.sill, 3.1, WINDOW.half, WINDOW.spring), []);
  return <group position={[WINDOW.x, 0, -10]}>
    {/* Painted plate set ~1.6 m beyond the glass so the view keeps believable parallax. */}
    <mesh position={[-.4, 1.45, -1.6]} material={m.coast}><planeGeometry args={[4.8, 3.6]} /></mesh>
    <mesh castShadow position={[0, 0, -.1]} material={m.wall}><extrudeGeometry args={[spandrel, { depth: .2, bevelEnabled: false, curveSegments: 40 }]} /></mesh>
    <mesh castShadow position={[0, 0, .06]} material={m.ceramic}><extrudeGeometry args={[frame, { depth: .08, bevelEnabled: true, bevelSize: .012, bevelThickness: .012, bevelSegments: 3, curveSegments: 40 }]} /></mesh>
    {/* Glazing bars. */}
    <mesh position={[0, (WINDOW.sill + WINDOW.spring + WINDOW.half) / 2, .02]} material={m.ceramic}><boxGeometry args={[.025, WINDOW.spring + WINDOW.half - WINDOW.sill, .03]} /></mesh>
    <mesh position={[0, 1.75, .02]} material={m.ceramic}><boxGeometry args={[WINDOW.half * 2, .025, .03]} /></mesh>
    <mesh receiveShadow position={[0, WINDOW.sill, .14]} material={m.stone}><boxGeometry args={[WINDOW.half * 2 + .26, .05, .24]} /></mesh>
  </group>;
}

function SunWindow({ m }: { m: RoomMaterials }) {
  const spandrel = useMemo(() => archedOpening(SUN_WINDOW.half, SUN_WINDOW.sill, 3.2, SUN_WINDOW.half, SUN_WINDOW.spring), []);
  const curtain = useMemo(() => {
    // Sheer with soft vertical folds.
    const geometry = new PlaneGeometry(1.3, 2.65, 48, 1);
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) position.setZ(i, Math.sin(position.getX(i) * 22) * .03 + Math.sin(position.getX(i) * 7) * .02);
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => curtain.dispose(), [curtain]);
  return <group position={[-HALF, 0, SUN_WINDOW.z]} rotation={[0, Math.PI / 2, 0]}>
    <mesh castShadow receiveShadow position={[0, 0, -.075]} material={m.wall}><extrudeGeometry args={[spandrel, { depth: .15, bevelEnabled: false, curveSegments: 40 }]} /></mesh>
    <mesh position={[0, SUN_WINDOW.sill + 1.33, .16]} material={m.sheer}><primitive object={curtain} attach="geometry" /></mesh>
    <mesh position={[0, 3.3, .2]} rotation={[0, 0, Math.PI / 2]} material={m.copper}><cylinderGeometry args={[.012, .012, 1.5, 10]} /></mesh>
  </group>;
}

function Banquette({ m }: { m: RoomMaterials }) {
  const seat = useMemo(() => roundedRect(1.3, .46, .1), []);
  return <group position={[1.42, 0, -9.42]}>
    <RoundedBox args={[1.3, .3, .42]} radius={.03} smoothness={3} position={[0, .17, 0]} castShadow receiveShadow material={m.wood} />
    <mesh castShadow receiveShadow position={[0, .32, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.rose}><extrudeGeometry args={[seat, { depth: .1, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 6, curveSegments: 24 }]} /></mesh>
    <mesh castShadow position={[0, .6, -.17]} rotation={[0, 0, Math.PI / 2]} material={m.peach}><capsuleGeometry args={[.1, 1.02, 8, 24]} /></mesh>
    <RoundedBox args={[.36, .32, .11]} radius={.05} smoothness={4} position={[.33, .62, -.06]} rotation={[-.18, -.12, .06]} castShadow material={m.peach} />
  </group>;
}

function TubChair({ m, position = [1.08, 0, -7.7], turn = -.62 }: { m: RoomMaterials; position?: [number, number, number]; turn?: number }) {
  // Curved shell turned on a lathe, open at the front: the sculpted armchair of the master's EspelhoMeu arch.
  const shell = useMemo(() => lathe([[.3, .3], [.4, .32], [.45, .45], [.46, .66], [.44, .76], [.4, .78], [.38, .74], [.39, .5], [.34, .42]]), []);
  return <group position={position} rotation={[0, turn, 0]}>
    <mesh castShadow receiveShadow material={m.peach}><latheGeometry args={[shell, 64, Math.PI * .3, Math.PI * 1.4]} /></mesh>
    <mesh castShadow receiveShadow position={[0, .38, .02]} material={m.peach}><cylinderGeometry args={[.37, .38, .14, 48]} /></mesh>
    <mesh castShadow receiveShadow position={[0, .17, 0]} material={m.wood}><cylinderGeometry args={[.3, .32, .32, 48]} /></mesh>
  </group>;
}

function StoneTable({ m, bare = false }: { m: RoomMaterials; bare?: boolean }) {
  const top = useMemo(() => pebble(.5, .34), []);
  const pedestal = useMemo(() => lathe([[0, 0], [.26, 0], [.27, .02], [.16, .1], [.12, .26], [.15, .37], [0, .37]]), []);
  const vase = useMemo(() => lathe([[0, 0], [.055, 0], [.085, .06], [.08, .14], [.045, .2], [.04, .24], [.05, .26], [0, .26]]), []);
  return <group position={[.58, 0, -6.95]} rotation={[0, .25, 0]}>
    <mesh castShadow receiveShadow material={m.stone}><latheGeometry args={[pedestal, 48]} /></mesh>
    <mesh castShadow receiveShadow position={[0, .37, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.stone}><extrudeGeometry args={[top, { depth: .04, bevelEnabled: true, bevelSize: .018, bevelThickness: .018, bevelSegments: 4, curveSegments: 64 }]} /></mesh>
    {bare ? null : <mesh castShadow receiveShadow position={[.14, .43, .02]} material={m.ceramic}><latheGeometry args={[vase, 40]} /></mesh>}
    {bare ? null : <Sprigs m={m} position={[.14, .66, .02]} />}
    {bare ? null : <RoundedBox args={[.2, .028, .27]} radius={.008} position={[-.2, .44, .06]} rotation={[0, .5, 0]} castShadow material={m.covers[2]} />}
  </group>;
}

// Instanced olive leaves scattered by a deterministic placer; used by the tree and the table sprigs.
function useOliveLeaves(m: RoomMaterials, count: number, place: (rand: () => number, dummy: Object3D, i: number) => void, size = 1) {
  const { invalidate } = useThree();
  const leaves = useMemo(() => {
    const leaf = new Shape(); leaf.moveTo(0, 0); leaf.quadraticCurveTo(.02 * size, .06 * size, 0, .13 * size); leaf.quadraticCurveTo(-.02 * size, .06 * size, 0, 0);
    const mesh = new InstancedMesh(new ShapeGeometry(leaf, 6), new MeshStandardMaterial({ side: DoubleSide, roughness: .72, envMap: m.env, envMapIntensity: .35 }), count);
    const dummy = new Object3D(), color = new Color();
    let seed = 7 + count; const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < count; i++) {
      place(rand, dummy, i);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(['#66734f', '#86916b', '#545f42', '#9ea887', '#76825d'][Math.floor(rand() * 5)]));
    }
    mesh.castShadow = true;
    return mesh;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.env, count, size]);
  useEffect(() => { invalidate(); return () => { leaves.geometry.dispose(); (leaves.material as Material).dispose(); leaves.dispose(); }; }, [leaves, invalidate]);
  return leaves;
}

function Sprigs({ m, position }: { m: RoomMaterials; position: [number, number, number] }) {
  // Cut olive sprigs instead of invented flowers: same botanical language as the lobby.
  const stems = useMemo(() => [-.5, -.15, .2, .55].map((lean, i) => new CatmullRomCurve3([new Vector3(0, -.2, 0), new Vector3(lean * .08, .05, (i - 1.5) * .02), new Vector3(lean * .22, .26 + i * .03, (i - 1.5) * .06)])), []);
  const leaves = useOliveLeaves(m, 140, (rand, dummy, i) => {
    const point = stems[i % stems.length].getPoint(.35 + rand() * .65);
    dummy.position.set(point.x + (rand() - .5) * .03, point.y, point.z + (rand() - .5) * .03);
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
    dummy.scale.setScalar(.6 + rand() * .4);
  });
  return <group position={position}>
    {stems.map((curve, i) => <mesh key={i} material={m.wood}><tubeGeometry args={[curve, 16, .004, 5, false]} /></mesh>)}
    <primitive object={leaves} />
  </group>;
}

function OliveTree({ m, position }: { m: RoomMaterials; position: [number, number, number] }) {
  const { invalidate } = useThree();
  const pot = useMemo(() => lathe([[0, 0], [.17, 0], [.2, .04], [.23, .38], [.25, .42], [.22, .43], [0, .4]]), []);
  const trunk = useMemo(() => new CatmullRomCurve3([new Vector3(0, .38, 0), new Vector3(.05, .8, .02), new Vector3(-.03, 1.15, -.02), new Vector3(.04, 1.45, .03)]), []);
  const leaves = useOliveLeaves(m, 620, (rand, dummy, i) => {
    const cluster = i % 7, angle = rand() * Math.PI * 2, radius = Math.sqrt(rand()) * .34;
    dummy.position.set(Math.cos(angle) * radius + (cluster - 3) * .03, 1.05 + rand() * .55 + Math.cos(angle * 2) * .06, Math.sin(angle) * radius * .85);
    dummy.rotation.set(rand() * Math.PI, rand() * Math.PI * 2, rand() * Math.PI);
    dummy.scale.setScalar(.9 + rand() * .6);
  }, 1.2);
  return <group position={position}>
    <mesh castShadow receiveShadow material={m.ceramic}><latheGeometry args={[pot, 48]} /></mesh>
    <mesh castShadow material={m.wood}><tubeGeometry args={[trunk, 32, .032, 8, false]} /></mesh>
    <primitive object={leaves} />
  </group>;
}

// Atelier pieces for the Corpo room: a mat, a stability ball and a pair of bronze dumbbells, all at human scale.
function AtelierSet({ m }: { m: RoomMaterials }) {
  return <group>
    <RoundedBox args={[1.85, .025, .68]} radius={.01} smoothness={3} position={[.15, .016, -7.35]} rotation={[0, .06, 0]} castShadow receiveShadow material={m.rose} />
    <mesh castShadow receiveShadow position={[1.32, .33, -8.2]} material={m.peach}><sphereGeometry args={[.32, 48, 32]} /></mesh>
    {[-.12, .12].map(z => <group key={z} position={[.95, .055, -6.7 + z]} rotation={[0, .5, 0]}>
      <mesh castShadow material={m.copper} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.015, .015, .26, 12]} /></mesh>
      {[-.11, .11].map(x => <mesh key={x} castShadow material={m.copper} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.05, .05, .06, 24]} /></mesh>)}
    </group>)}
    <RoundedBox args={[.32, .05, .22]} radius={.02} position={[-.62, .03, -6.55]} rotation={[0, -.3, 0]} castShadow material={m.peach} />
  </group>;
}

// Shared interior key and fill. Rendered once by PortalScene and moved into the active room, so the scene keeps a
// constant light count (no shader recompiles between rooms) and only one interior shadow map is rendered.
export function InteriorLights({ room }: { room: RoomId }) {
  const target = useMemo(() => new Object3D(), []);
  const sun = THEMES[room].sun;
  return <>
    <primitive object={target} position={[.5, 0, -7.9]} />
    {/* Late-afternoon sun falling from the left window onto the rug. */}
    <spotLight position={[-1.95, 3.25, -6.9]} target={target} color="#ffb878" intensity={230 * sun} angle={.8} penumbra={.5} distance={9} decay={2}
      castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-.0004} shadow-normalBias={.02} />
    {/* Soft bounce from the plaster ceiling; the env map supplies the rest of the fill. */}
    <pointLight position={[.2, 3.7, -7.4]} color="#ffdcb8" intensity={1} distance={7} decay={2} />
  </>;
}

export function ThemedRoom({ room, items, workbook, focusBook, selectedBook = null, active, mobile = false, handlers }: {
  room: RoomId; items: ShelfItem[]; workbook: boolean; focusBook: string | null; selectedBook?: string | null; active: boolean; mobile?: boolean; handlers: BookHandlers;
}) {
  const theme = THEMES[room];
  const m = useRoomMaterials(theme);
  // Foreground plane: the jambs of this arch occlude the room edges at arrival.
  const arch = useMemo(() => archedOpening(HALF, 0, HEIGHT, 1.25, 2.2), []);
  const rug = useMemo(() => { const shape = new Shape(); shape.absellipse(0, 0, 1.5, 1.05, 0, Math.PI * 2, false, 0); return shape; }, []);
  const sunSpan = [[0, SUN_WINDOW.z + SUN_WINDOW.half], [SUN_WINDOW.z - SUN_WINDOW.half, -10]] as const;
  const wallBox = (key: string, position: [number, number, number], size: [number, number, number]) =>
    <mesh key={key} castShadow receiveShadow position={position} material={m.wall}><boxGeometry args={size} /></mesh>;
  return <group name={`room-interior-${room}`}>
    {/* Shell. Every wall casts shadow so the lobby sun no longer floods the room; light enters only through the windows. */}
    {[[-HALF, WINDOW.x - WINDOW.half], [WINDOW.x + WINDOW.half, HALF]].map(([from, to]) => wallBox(`back${from}`, [(from + to) / 2, HEIGHT / 2, -10], [to - from + .02, HEIGHT, .2]))}
    {wallBox('back-sill', [WINDOW.x, WINDOW.sill / 2, -10], [WINDOW.half * 2, WINDOW.sill, .2])}
    {wallBox('back-head', [WINDOW.x, (3.1 + HEIGHT) / 2, -10], [WINDOW.half * 2, HEIGHT - 3.1, .2])}
    {sunSpan.map(([from, to]) => wallBox(`left${from}`, [-HALF, HEIGHT / 2, (from + to) / 2], [.15, HEIGHT, from - to]))}
    {wallBox('left-sill', [-HALF, SUN_WINDOW.sill / 2, SUN_WINDOW.z], [.15, SUN_WINDOW.sill, SUN_WINDOW.half * 2])}
    {wallBox('left-head', [-HALF, (3.2 + HEIGHT) / 2, SUN_WINDOW.z], [.15, HEIGHT - 3.2, SUN_WINDOW.half * 2])}
    {wallBox('right', [HALF, HEIGHT / 2, -5], [.15, HEIGHT, 10])}
    <mesh castShadow receiveShadow position={[0, HEIGHT + .05, -5]} material={m.wall}><boxGeometry args={[WIDTH + .3, .1, 10]} /></mesh>
    <mesh receiveShadow position={[0, .01, -5]} rotation={[-Math.PI / 2, 0, 0]} material={m.floor}><planeGeometry args={[WIDTH, 10]} /></mesh>
    {[[-HALF + .085, -5, 10, Math.PI / 2], [HALF - .085, -5, 10, Math.PI / 2], [0, -9.89, WIDTH, 0]].map(([x, z, length, turn]) => <mesh key={`${x}:${z}`} receiveShadow position={[x, .06, z]} rotation={[0, turn, 0]} material={m.stone}><boxGeometry args={[length, .12, .02]} /></mesh>)}
    {/* Cornice. */}
    {[[-HALF + .1, -5, 10, Math.PI / 2], [HALF - .1, -5, 10, Math.PI / 2], [0, -9.86, WIDTH, 0]].map(([x, z, length, turn]) => <mesh key={`c${x}:${z}`} position={[x, HEIGHT - .06, z]} rotation={[0, turn, 0]} material={m.ceramic}><boxGeometry args={[length, .1, .08]} /></mesh>)}

    <mesh castShadow receiveShadow position={[0, 0, -5.25]} material={m.arch}><extrudeGeometry args={[arch, { depth: .45, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 4, curveSegments: 64 }]} /></mesh>
    {theme.furniture === 'atelier' ? null : <mesh receiveShadow position={[.1, .022, -7.5]} rotation={[-Math.PI / 2, 0, .08]} material={theme.rug === 'a' ? m.rose : m.peach}><extrudeGeometry args={[rug, { depth: .012, bevelEnabled: true, bevelSize: .01, bevelThickness: .004, bevelSegments: 2, curveSegments: 64 }]} /></mesh>}

    <SunWindow m={m} />
    <NicheLibrary items={items} workbook={workbook} tones={theme.tones} focusBook={focusBook} selectedBook={selectedBook} mobile={mobile} handlers={handlers} m={m} />
    <CoastWindow m={m} />
    <Banquette m={m} />
    <OliveTree m={m} position={[-1.72, 0, -7.85]} />
    {theme.furniture === 'salon' ? <>
      <Mirror active={active && !selectedBook} mobile={mobile} m={m} />
      <TubChair m={m} />
      <StoneTable m={m} />
    </> : null}
    {theme.furniture === 'garden' ? <>
      <TubChair m={m} position={[-1.05, 0, -8.1]} turn={.55} />
      <StoneTable m={m} />
      <OliveTree m={m} position={[1.75, 0, -6.6]} />
    </> : null}
    {theme.furniture === 'atelier' ? <AtelierSet m={m} /> : null}
    {theme.furniture === 'pause' ? <>
      <TubChair m={m} position={[-1.3, 0, -8.55]} turn={.8} />
      <StoneTable m={m} bare />
      <OliveTree m={m} position={[1.75, 0, -6.6]} />
    </> : null}
  </group>;
}
