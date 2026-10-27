'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { RoundedBox, ContactShadows } from '@react-three/drei';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import { Color, DataTexture, DoubleSide, Path, RepeatWrapping, RGBAFormat, Shape, SRGBColorSpace, TextureLoader, Vector3, type Group } from 'three';
import { sceneTexture, rooms, type RoomId } from '@/lib/immersive';

type Props = { room: RoomId | null; travelling: boolean; mobile: boolean; onReady: () => void; onFailure: () => void; onPhase: (phase: string) => void; onArrive: () => void };
const centers = [-6.6, -2.2, 2.2, 6.6];
const HOME = [0.4, 2.45, 11.7] as const;

function archPath<T extends Shape | Path>(path: T, radius: number, base = 0, spring = 2.8): T {
  path.moveTo(-radius, base); path.lineTo(radius, base); path.lineTo(radius, spring);
  path.absarc(0, spring, radius, 0, Math.PI, false); path.lineTo(-radius, base);
  return path;
}
function archFrame() {
  const shape = archPath(new Shape(), 1.22, -0.03, 2.8) as Shape;
  const hole = new Path();
  hole.moveTo(-1.04, 0); hole.lineTo(-1.04, 2.8); hole.absarc(0, 2.8, 1.04, Math.PI, 0, true); hole.lineTo(1.04, 0); hole.lineTo(-1.04, 0);
  shape.holes.push(hole);
  return shape;
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <group position={position} scale={scale}>
    <mesh castShadow position={[0, .29, 0]}><cylinderGeometry args={[.24, .18, .56, 16]} /><meshStandardMaterial color="#bc9f79" roughness={.94} /></mesh>
    <mesh position={[0, .98, 0]}><cylinderGeometry args={[.018, .035, 1.1, 7]} /><meshStandardMaterial color="#63583c" /></mesh>
    {[0, 1, 2, 3, 4, 5].map(i => <mesh castShadow key={i} position={[Math.sin(i * 2.4) * .16, .74 + i * .13, Math.cos(i * 2.4) * .16]} rotation={[.4, i * 2.4, -.6]} scale={[.18, .42, .075]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? '#51684a' : '#344e35'} roughness={.8} /></mesh>)}
  </group>;
}

function Chair({ position, color = '#e6d4b7' }: { position: [number, number, number]; color?: string }) {
  return <group position={position}>
    <RoundedBox args={[1.4, .3, 1.05]} radius={.13} position={[0, .48, 0]} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.98} /></RoundedBox>
    <RoundedBox args={[1.4, .7, .24]} radius={.12} position={[0, .9, -.43]} castShadow><meshStandardMaterial color={color} roughness={.98} /></RoundedBox>
    {[-.6, .6].map(x => <RoundedBox key={x} args={[.22, .5, 1.05]} radius={.1} position={[x, .73, 0]} castShadow><meshStandardMaterial color={color} roughness={.96} /></RoundedBox>)}
    {[-.5, .5].flatMap(x => [-.35, .35].map(z => <mesh key={`${x}:${z}`} position={[x, .15, z]}><cylinderGeometry args={[.035, .045, .3, 8]} /><meshStandardMaterial color="#6e5035" /></mesh>))}
  </group>;
}

function Room({ index }: { index: number }) {
  const room = rooms[index];
  const frame = useMemo(archFrame, []);
  const doorShape = useMemo(() => archPath(new Shape(), 1.025), []);
  const door = useRef<Group>(null);
  const { invalidate } = useThree();
  // Photo fragments are set dressing at the back, never the navigable room itself.
  const texture = useMemo(() => {
    const source = new TextureLoader().load(sceneTexture, () => invalidate());
    source.colorSpace = SRGBColorSpace;
    source.repeat.set(290 / 1672, 160 / 941);
    source.offset.set(15 / 1672, 1 - 460 / 941);
    return source;
  }, [room, invalidate]);
  const plaster = useMemo(() => {
    const pixels = new Uint8Array(64 * 64 * 4);
    for (let i = 0; i < 64 * 64; i++) { const tone = 110 + ((i * 73 + (i % 17) * 29) % 55); pixels.set([tone, tone, tone, 255], i * 4); }
    const map = new DataTexture(pixels, 64, 64, RGBAFormat); map.wrapS = map.wrapT = RepeatWrapping; map.repeat.set(6, 6); map.needsUpdate = true; return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => () => plaster.dispose(), [plaster]);

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
    <mesh receiveShadow position={[0, 2.1, -10]}><boxGeometry args={[4.35, 4.2, .2]} /><meshStandardMaterial color={room.material} roughness={.95} bumpMap={plaster} bumpScale={.018} /></mesh>
    {[-2.15, 2.15].map(x => <mesh key={x} receiveShadow position={[x, 2.1, -5]}><boxGeometry args={[.15, 4.2, 10]} /><meshStandardMaterial color={index === 1 ? '#bdc5ac' : '#f1e3cd'} roughness={1} bumpMap={plaster} bumpScale={.015} /></mesh>)}
    <mesh receiveShadow position={[0, .015, -5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4.3, 10]} /><meshPhysicalMaterial color="#ead9bd" roughness={.7} metalness={.03} bumpMap={plaster} bumpScale={.012} /></mesh>
    {index !== 0 ? <group position={[0, 2.3, -9.85]}>
      <mesh><planeGeometry args={[2.4, 1.7]} /><meshBasicMaterial map={texture} side={DoubleSide} /></mesh>
      {[-1.24, 1.24].map(x => <mesh key={x} position={[x, 0, .025]}><boxGeometry args={[.09, 1.85, .12]} /><meshStandardMaterial color="#bb9c72" roughness={.65} /></mesh>)}
      {[-.9, .9].map(y => <mesh key={y} position={[0, y, .025]}><boxGeometry args={[2.55, .09, .12]} /><meshStandardMaterial color="#bb9c72" roughness={.65} /></mesh>)}
      <mesh position={[0, 0, .04]}><boxGeometry args={[.04, 1.75, .1]} /><meshStandardMaterial color="#d0bd9a" /></mesh>
    </group> : null}
    <mesh position={[.35, .04, -7.5]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 1, 1]}><circleGeometry args={[1.2, 48]} /><meshStandardMaterial color={index === 0 ? '#d6b2a0' : '#c5bb9c'} roughness={1} bumpMap={plaster} bumpScale={.018} /></mesh>
    {index === 2 ? <group>
      <mesh castShadow position={[1, .5, -8.5]}><sphereGeometry args={[.48, 32, 24]} /><meshPhysicalMaterial color="#7a7867" roughness={.38} metalness={.48} /></mesh>
      <RoundedBox args={[1.55, .06, .7]} radius={.025} position={[0, .07, -7.3]} rotation={[0, .18, 0]}><meshStandardMaterial color="#70816a" roughness={.9} /></RoundedBox>
      {[-.7, .7].map(x => <mesh key={x} castShadow position={[x, 1.6, -9.65]}><boxGeometry args={[.11, 3, .12]} /><meshStandardMaterial color="#806548" /></mesh>)}
      {[.5, 1.1, 1.7, 2.3, 2.9].map(y => <mesh key={y} position={[0, y, -9.65]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[.025, .025, 1.4, 12]} /><meshStandardMaterial color="#af9269" /></mesh>)}
    </group> : <Chair position={[.6, 0, -8.4]} color={index === 0 ? '#edd0c0' : '#e4d8c0'} />}
    {index === 0 ? <group position={[.25, 2.4, -9.8]}>
      <mesh><circleGeometry args={[.56, 64]} /><meshPhysicalMaterial color="#c6c9ba" metalness={.94} roughness={.16} /></mesh>
      <mesh position={[0, 0, .025]}><torusGeometry args={[.58, .024, 12, 64]} /><meshPhysicalMaterial color="#b3955d" metalness={.75} roughness={.27} /></mesh>
    </group> : null}
    <group position={[-1.5, 0, -9.55]}>
      {[-.4, .4].map(x => <mesh key={x} position={[x, 1.25, 0]}><boxGeometry args={[.06, 2.5, .38]} /><meshStandardMaterial color="#9e805b" roughness={.85} /></mesh>)}
      {[.2, .8, 1.4, 2, 2.6].map((y, shelf) => <group key={y}><mesh position={[0, y, 0]}><boxGeometry args={[.88, .05, .4]} /><meshStandardMaterial color="#b1936b" /></mesh>{shelf < 4 ? [0, 1, 2, 3].map(book => <mesh key={book} position={[-.26 + book * .15, y + .19, .015]} rotation={[0, 0, book === 3 ? -.12 : 0]}><boxGeometry args={[.1, .32 + (book % 2) * .06, .23]} /><meshStandardMaterial color={['#485d46', '#d9bc94', '#efe1c5', '#a2745c'][book]} roughness={.9} /></mesh>) : null}</group>)}
    </group>
    <Plant position={[1.65, 0, -9]} scale={.8} />
    <mesh castShadow position={[1.3, .3, -7.2]}><cylinderGeometry args={[.32, .28, .58, 32]} /><meshStandardMaterial color="#ba9b72" roughness={.85} /></mesh>
    <mesh castShadow position={[1.3, .62, -7.2]}><cylinderGeometry args={[.36, .36, .06, 32]} /><meshPhysicalMaterial color="#d4c4a6" roughness={.6} /></mesh>
    <pointLight position={[0, 3.3, -7]} color={index === 0 ? '#ffd4b6' : '#fff0d3'} intensity={14} distance={9} decay={2} />
    <mesh position={[0, 3.7, -7]}><sphereGeometry args={[.07, 16, 8]} /><meshStandardMaterial color="#fff0cc" emissive="#ffe2a6" emissiveIntensity={1.6} /></mesh>
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

export default function PortalScene(props: Props) {
  return <Canvas frameloop="demand" dpr={[1, props.mobile ? 1.25 : 1.5]} shadows camera={{ position: [...HOME], fov: 43, near: .08, far: 45 }} gl={{ antialias: true, alpha: false, powerPreference: 'default' }} fallback={<span />} onCreated={({ gl }) => { gl.setClearColor(new Color('#e6d7bd')); }}>
    <ambientLight intensity={.8} color="#fff3dd" /><hemisphereLight args={['#fff4df', '#938d6e', 1.6]} />
    <directionalLight castShadow position={[-5, 9, 7]} intensity={3.2} color="#ffe7bd" shadow-mapSize={[1024, 1024]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={9} shadow-camera-bottom={-9} shadow-bias={-.0005} />
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -.02, -2]}><planeGeometry args={[30, 32]} /><meshPhysicalMaterial color="#e3cfac" roughness={.52} metalness={.03} /></mesh>
    {Array.from({ length: 14 }, (_, i) => <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -.012, -12 + i * 1.3]}><planeGeometry args={[25, .012]} /><meshStandardMaterial color="#c7b592" /></mesh>)}
    {rooms.map((room, i) => <Room key={room.id} index={i} />)}
    {[-4.4, 0, 4.4].map(x => <mesh key={x} receiveShadow castShadow position={[x, 2.1, -.01]}><boxGeometry args={[1.9, 4.2, .35]} /><meshStandardMaterial color="#deceb3" roughness={.95} /></mesh>)}
    <Plant position={[-5.7, 0, 1]} scale={1.5} /><Plant position={[6, 0, .3]} scale={1.7} />
    <Chair position={[-5, 0, 3.5]} />
    <ContactShadows position={[0, .005, 0]} opacity={.2} scale={22} blur={2.8} far={7} frames={1} resolution={256} />
    <CameraJourney {...props} />
  </Canvas>;
}
