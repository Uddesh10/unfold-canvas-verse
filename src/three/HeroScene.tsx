import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useTexture, RoundedBox, Float, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { verticals, type Vertical } from "@/data/themes";

interface PanelProps {
  v: Vertical;
  position: [number, number, number];
  rotationY: number;
  onHover: (key: string | null) => void;
  hovered: string | null;
}

function Panel({ v, position, rotationY, onHover, hovered }: PanelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture(v.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  const navigate = useNavigate();
  const isHovered = hovered === v.key;
  const isDimmed = hovered !== null && !isHovered;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const target = isHovered ? 0.35 : 0;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2] + target, 0.08);
    const targetRotY = rotationY + (state.pointer.x * 0.08);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.05);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -state.pointer.y * 0.05, 0.05);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    navigate(v.path);
  };

  return (
    <group ref={meshRef} position={position} rotation={[0, rotationY, 0]}>
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <group
          onPointerOver={(e) => { e.stopPropagation(); onHover(v.key); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { onHover(null); document.body.style.cursor = ""; }}
          onClick={handleClick}
        >
          {/* Glow plane behind panel */}
          <mesh position={[0, 0, -0.15]} scale={isHovered ? 1.25 : 1.05}>
            <planeGeometry args={[2.3, 3.2]} />
            <meshBasicMaterial color={v.glow} transparent opacity={isHovered ? 0.55 : 0.18} />
          </mesh>
          {/* Photo card */}
          <RoundedBox args={[2, 2.9, 0.06]} radius={0.08} smoothness={6}>
            <meshStandardMaterial
              map={texture}
              roughness={0.35}
              metalness={0.15}
              opacity={isDimmed ? 0.55 : 1}
              transparent
            />
          </RoundedBox>
          {/* Glass border overlay */}
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[2, 2.9]} />
            <meshPhysicalMaterial
              transmission={0.6}
              thickness={0.2}
              roughness={0.1}
              transparent
              opacity={0.08}
              color="#ffffff"
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 220;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
  }
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#ffffff" transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene({ onHover, hovered }: { onHover: (k: string | null) => void; hovered: string | null }) {
  const positions: [number, number, number][] = [
    [-3.2, 0, 0],
    [0, 0.15, 0.4],
    [3.2, 0, 0],
  ];
  const rotations = [0.18, 0, -0.18];
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, 3]} intensity={0.4} color="#ffd6a8" />
      <Particles />
      {verticals.map((v, i) => (
        <Suspense key={v.key} fallback={null}>
          <Panel v={v} position={positions[i]} rotationY={rotations[i]} onHover={onHover} hovered={hovered} />
        </Suspense>
      ))}
      <Environment preset="city" />
    </>
  );
}

export const HeroScene = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  const v = verticals.find((x) => x.key === hovered);

  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene onHover={setHovered} hovered={hovered} />
      </Canvas>

      {/* Hovered label overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-28 md:bottom-32 flex justify-center">
        <div
          className={`glass-strong rounded-full px-6 py-3 transition-all duration-500 ${
            v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <span style={{ color: v?.color }}>●</span>
            <span>{v?.brand ?? ""}</span>
            <span className="text-muted-foreground">— {v?.label ?? ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
