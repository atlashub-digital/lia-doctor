'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Color, Shape, Vector3, type AmbientLight, type DirectionalLight, type Group, type HemisphereLight } from 'three';
import { rooms, type RoomId } from '@/lib/immersive';
import { InteriorLights, ThemedRoom } from './rooms/ThemedRoom';
import { shelves } from '@/lib/shelves';
import { archFrame, archPath, Chair, Plant } from './scene-kit';

type BookHandlers = { onHover: (slug: string | null) => void; onSelect: (slug: string) => void };
type Props = { room: RoomId | null; travelling: boolean; mobile: boolean; focusBook?: string | null; selectedBook?: string | null; onHoverBook?: (slug: string | null) => void; onSelectBook?: (slug: string) => void; onReady: () => void; onFailure: () => void; onPhase: (phase: string) => void; onArrive: () => void };
const centers = [-6.6, -2.2, 2.2, 6.6];
// Keep scene animations time-accurate on slow GPUs: a book or door finishes on schedule (with fewer frames)
// instead of GSAP stretching it after long frames.
gsap.ticker.lagSmoothing(0);
const HOME = [0.4, 2.45, 11.7] as const;

function Room({ index, focusBook, selectedBook, active, mobile, handlers, furnished }: { index: number; focusBook: string | null; selectedBook: string | null; active: boolean; mobile: boolean; handlers: BookHandlers; furnished: boolean }) {
  const room = rooms[index];
  const frame = useMemo(() => archFrame(), []);
  const doorShape = useMemo(() => archPath(new Shape(), 1.025), []);
  const door = useRef<Group>(null);

  return <group position={[centers[index], 0, 0]}>
    <mesh castShadow receiveShadow position={[0, 0, -.08]}>
      <extrudeGeometry args={[frame, { depth: .36, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: .035, bevelThickness: .025, curveSegments: 36 }]} />
      <meshPhysicalMaterial color="#d8c4a2" roughness={.68} metalness={.04} clearcoat={.12} />
    </mesh>
    <mesh position={[0, 0, .29]}><extrudeGeometry args={[frame, { depth: .025, bevelEnabled: false, curveSegments: 36 }]} /><meshStandardMaterial color="#d1b878" emissive="#a67e35" emissiveIntensity={.22} roughness={.45} metalness={.3} /></mesh>
    <group ref={door} position={[-1.025, 0, -.02]} name={`door-${room.id}`}>
      <mesh position={[1.025, 0, 0]} castShadow><extrudeGeometry args={[doorShape, { depth: .08, bevelEnabled: true, bevelSize: .015, bevelThickness: .015, bevelSegments: 2, curveSegments: 24 }]} /><meshStandardMaterial color={room.material} roughness={.8} /></mesh>
      <mesh position={[1.82, 1.6, .12]}><sphereGeometry args={[.045, 12, 8]} /><meshPhysicalMaterial color="#c2a46d" metalness={.7} roughness={.25} /></mesh>
    </group>
    {furnished ? <ThemedRoom room={room.id} items={shelves[room.id].items} workbook={shelves[room.id].workbook} focusBook={focusBook} selectedBook={selectedBook} active={active} mobile={mobile} handlers={handlers} /> : null}
  </group>;
}

function CameraJourney(props: Props) {
  const { camera, scene, invalidate, gl } = useThree();
  const latest = useRef(props); latest.current = props;
  const arrived = useRef<string | null>(null);
  useEffect(() => {
    const contextLost = (event: Event) => { event.preventDefault(); latest.current.onFailure(); };
    gl.domElement.addEventListener('webglcontextlost', contextLost);
    latest.current.onReady();
    // Interiors furnished later are compiled by CompileWarmRooms as they arrive (all rooms share one light set).
    return () => gl.domElement.removeEventListener('webglcontextlost', contextLost);
  }, [gl]);
  useEffect(() => {
    const index = rooms.findIndex(room => room.id === props.room);
    const timeline = gsap.timeline();
    const look = new Vector3();
    const renderFrame = () => { gl.domElement.dataset.cameraZ = String(camera.position.z); gl.domElement.dataset.cameraX = String(camera.position.x); invalidate(); };
    if (index < 0) {
      camera.position.set(...HOME); camera.lookAt(.4, 1.9, -2);
      rooms.forEach(room => { const door = scene.getObjectByName(`door-${room.id}`); if (door) door.rotation.y = 0; });
      arrived.current = null; renderFrame();
      return () => { timeline.kill(); };
    }
    const x = centers[index];
    const door = scene.getObjectByName(`door-${props.room}`);
    const showRoom = () => { camera.position.set(x, 1.65, -2.8); camera.lookAt(x, 1.65, -9); if (door) door.rotation.y = -1.65; renderFrame(); };
    if (!props.travelling) { showRoom(); arrived.current = props.room; return () => { timeline.kill(); }; }
    camera.position.set(...HOME); look.set(.4, 1.9, -2);
    renderFrame();
    const duration = props.mobile ? .35 : 1.1;
    latest.current.onPhase('door-opening');
    if (door) timeline.to(door.rotation, { y: -1.65, duration: duration * .45, ease: 'power2.out', onUpdate: invalidate }, 0);
    timeline.to(camera.position, { x, y: 1.75, z: 2.6, duration: duration * .46, ease: 'power2.inOut', onUpdate: () => { camera.lookAt(x, 1.75, -7); renderFrame(); } }, 0);
    timeline.call(() => latest.current.onPhase('camera-travel'), [], duration * .4);
    timeline.to(camera.position, { x, y: 1.65, z: -2.8, duration: duration * .54, ease: 'power2.out', onUpdate: () => { camera.lookAt(x, 1.65, -9); renderFrame(); } }, duration * .46);
    timeline.call(() => { arrived.current = props.room; latest.current.onArrive(); });
    return () => { timeline.kill(); };
  }, [props.room, props.travelling, props.mobile, camera, scene, invalidate, gl]);
  return null;
}

// Lobby lighting, dimmed while the camera is inside a room (interiors are lit by their own window light).
// The blend follows camera depth, so crossing the threshold reads as walking from the terrace into shade.
const LOBBY = { ambient: .8, hemisphere: 1.6, sun: 3.2 };
const INTERIOR = { ambient: .06, hemisphere: .22, sun: 1 };
function LightRig({ room }: { room: RoomId | null }) {
  const ambient = useRef<AmbientLight>(null), hemisphere = useRef<HemisphereLight>(null), sun = useRef<DirectionalLight>(null);
  const settled = useRef(false);
  const { gl } = useThree();
  useEffect(() => {
    // Inside the EspelhoMeu room the camera is still, so shadow maps are refreshed only when the scene changes.
    const refresh = () => { gl.shadowMap.needsUpdate = true; };
    gl.domElement.addEventListener('lia:scene-changed', refresh);
    return () => { gl.domElement.removeEventListener('lia:scene-changed', refresh); gl.shadowMap.autoUpdate = true; };
  }, [gl]);
  useEffect(() => {
    // The interior lights move with the room: refresh shadows (and the cached mirror reflection) for the new room even
    // when the camera was already inside the previous one.
    gl.shadowMap.needsUpdate = true;
    gl.domElement.dispatchEvent(new Event('lia:scene-changed'));
  }, [gl, room]);
  useFrame(({ camera }) => {
    const inside = room ? Math.min(1, Math.max(0, -camera.position.z / 2.8)) : 0;
    const still = inside === 1;
    if (still !== settled.current) { settled.current = still; gl.shadowMap.autoUpdate = !still; gl.shadowMap.needsUpdate = true; }
    const blend = (key: keyof typeof LOBBY) => LOBBY[key] + (INTERIOR[key] - LOBBY[key]) * inside;
    if (ambient.current) ambient.current.intensity = blend('ambient');
    if (hemisphere.current) hemisphere.current.intensity = blend('hemisphere');
    if (sun.current) sun.current.intensity = blend('sun');
  });
  return <>
    <ambientLight ref={ambient} intensity={LOBBY.ambient} color="#fff3dd" /><hemisphereLight ref={hemisphere} args={['#fff4df', '#938d6e', LOBBY.hemisphere]} />
    <directionalLight ref={sun} castShadow position={[-5, 9, 7]} intensity={LOBBY.sun} color="#ffe7bd" shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.0005} />
  </>;
}

// Interiors are built on demand: the room being visited at once; from the átrio, the others one at a time while the main
// thread is idle, so they are ready (and compiled) before the visitor reaches a door. Inside a room nothing else is
// warmed, so background work never competes with opening a book; another room is furnished when the visitor heads to it.
function useWarmRooms(current: RoomId | null) {
  const [warm, setWarm] = useState<RoomId[]>(() => current ? [current] : []);
  const add = (id: RoomId) => setWarm(list => list.includes(id) ? list : [...list, id]);
  useEffect(() => { if (current) add(current); }, [current]);
  useEffect(() => {
    const next = rooms.find(room => !warm.includes(room.id));
    if (!next || current) return;
    let idle = 0;
    const delay = window.setTimeout(() => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(() => add(next.id), { timeout: 2500 }) : window.setTimeout(() => add(next.id), 300);
    }, warm.length ? 400 : 1200);
    return () => { window.clearTimeout(delay); if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else window.clearTimeout(idle); };
  }, [warm, current]);
  return warm;
}

function CompileWarmRooms({ count }: { count: number }) {
  const { gl, scene, camera, invalidate } = useThree();
  useEffect(() => { if (count) void gl.compileAsync(scene, camera).then(() => invalidate()).catch(() => {}); }, [count, gl, scene, camera, invalidate]);
  return null;
}

export default function PortalScene(props: Props) {
  const [dpr, setDpr] = useState<number | [number, number]>([1, props.mobile ? 1.25 : 1.5]);
  // Stable handlers for the 3D books; they read the latest callbacks so the scene never re-renders for them.
  const latest = useRef(props); latest.current = props;
  const handlers = useMemo<BookHandlers>(() => ({ onHover: slug => latest.current.onHoverBook?.(slug), onSelect: slug => latest.current.onSelectBook?.(slug) }), []);
  const warm = useWarmRooms(props.room);
  return <Canvas frameloop="demand" dpr={dpr} shadows camera={{ position: [...HOME], fov: 43, near: .08, far: 45 }} gl={{ antialias: true, alpha: false, powerPreference: 'default' }} fallback={<span />} onCreated={({ gl }) => { gl.setClearColor(new Color('#e6d7bd')); }}>
    {/* Drop to DPR 1 when the device cannot hold the frame rate (reflection + shadows are the heavy passes). */}
    <PerformanceMonitor onDecline={() => setDpr(1)} />
    <LightRig room={props.room} />
    {/* Interior key + fill follow the active room (EspelhoMeu by default, so the light count never changes). */}
    <group position={[centers[Math.max(0, rooms.findIndex(room => room.id === props.room))], 0, 0]}><InteriorLights room={props.room ?? 'espelho-meu'} /></group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, -2]}><planeGeometry args={[30, 32]} /><meshPhysicalMaterial color="#e3cfac" roughness={.52} metalness={.03} /></mesh>
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.012, -12 + i * 1.3]}><planeGeometry args={[25, .012]} /><meshStandardMaterial color="#c7b592" /></mesh>)}
    {rooms.map((room, i) => <Room key={room.id} index={i} focusBook={props.focusBook ?? null} selectedBook={props.room === room.id && !props.travelling ? props.selectedBook ?? null : null} active={props.room === room.id && !props.travelling} mobile={props.mobile} handlers={handlers} furnished={warm.includes(room.id)} />)}
    <CompileWarmRooms count={warm.length} />
    {[-4.4, 0, 4.4].map(x => <mesh key={x} receiveShadow castShadow position={[x, 2.1, -.01]}><boxGeometry args={[1.9, 4.2, .35]} /><meshStandardMaterial color="#deceb3" roughness={.95} /></mesh>)}
    <Plant position={[-5.7, 0, 1]} scale={1.5} /><Plant position={[6, 0, .3]} scale={1.7} />
    <Chair position={[-5, 0, 3.5]} />
    <ContactShadows position={[0, .005, 0]} opacity={.2} scale={22} blur={2.8} far={7} frames={1} resolution={256} />
    <CameraJourney {...props} />
  </Canvas>;
}
