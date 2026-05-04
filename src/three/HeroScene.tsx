import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, MeshDistortMaterial, Sparkles, Trail } from "@react-three/drei";
import * as THREE from "three";

/* -------- Center: glowing distorted icosahedron core -------- */
function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.15;
    ref.current.rotation.y = t * 0.2;
    const s = 1 + Math.sin(t * 0.8) * 0.04;
    ref.current.scale.setScalar(s);
  });
  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.35, 6]} />
        {/* @ts-expect-error drei prop */}
        <MeshDistortMaterial
          color="#ff2ea0"
          emissive="#a85bff"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.6}
          distort={0.45}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

/* -------- Wireframe shell -------- */
function Shell() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y -= dt * 0.18;
    ref.current.rotation.x += dt * 0.05;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.2, 1]} />
      <meshBasicMaterial color="#22e3ff" wireframe transparent opacity={0.22} />
    </mesh>
  );
}

/* -------- Orbiting glowing rings (different tilts) -------- */
function Ring({ radius, color, tilt, speed }: { radius: number; color: string; tilt: [number, number, number]; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.012, 16, 200]} />
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
}

/* -------- Orbiting comet that draws a trail -------- */
function Comet({ radius, color, speed, offset = 0, tilt = [0, 0, 0] as [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) group.current.rotation.z = state.clock.elapsedTime * speed + offset;
  });
  return (
    <group rotation={tilt}>
      <group ref={group}>
        <Trail width={1.6} length={6} color={color} attenuation={(t) => t * t}>
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </Trail>
      </group>
    </group>
  );
}

/* -------- Background nebula particles -------- */
function Nebula() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const n = 600;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) - 2;
    }
    return arr;
  }, []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 3, 4]} intensity={1.2} color="#ff4fcf" />
      <pointLight position={[-4, -2, 3]} intensity={0.9} color="#22e3ff" />
      <pointLight position={[0, 4, -2]} intensity={0.6} color="#a85bff" />

      <Nebula />
      <Sparkles count={80} scale={[10, 6, 6]} size={2} speed={0.4} color="#ffffff" opacity={0.7} />

      <group>
        <Shell />
        <Core />
        <Ring radius={2.6} color="#ff2ea0" tilt={[1.1, 0.4, 0]} speed={0.4} />
        <Ring radius={3.1} color="#22e3ff" tilt={[0.4, 1.2, 0.3]} speed={-0.3} />
        <Ring radius={3.6} color="#a85bff" tilt={[1.5, 0.9, 0.6]} speed={0.25} />

        <Comet radius={2.6} color="#ff80d4" speed={0.9} tilt={[1.1, 0.4, 0]} />
        <Comet radius={3.1} color="#7af2ff" speed={-0.8} offset={1.5} tilt={[0.4, 1.2, 0.3]} />
        <Comet radius={3.6} color="#c7a4ff" speed={0.65} offset={3.0} tilt={[1.5, 0.9, 0.6]} />
      </group>

      <Environment preset="night" />
    </>
  );
}

export const HeroScene = () => {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
};
