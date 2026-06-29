import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useSolarStore } from '../../store/solarStore';

function SunSurface() {
  const meshRef = useRef<THREE.Mesh>(null);
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const flareAlert = activeFlare && (activeFlare.predictedClass === 'M' || activeFlare.predictedClass === 'X');

  // Custom shader for animated noise displacement + corona
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAlert: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAlert;
        varying vec3 vNormal;
        varying float vDisplacement;

        // Classic Perlin noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          float displacement = snoise(position * 1.2 + uTime * 0.15) * 0.08;
          displacement += uAlert * snoise(position * 3.0 + uTime * 0.5) * 0.12;
          vDisplacement = displacement;
          vec3 newPosition = position + normal * displacement;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uAlert;
        varying vec3 vNormal;
        varying float vDisplacement;
        void main() {
          vec3 baseColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.27, 0.0), vDisplacement * 5.0);
          baseColor = mix(baseColor, vec3(1.0, 0.95, 0.7), uAlert * 0.4);
          float light = max(dot(vNormal, normalize(vec3(1.0, 1.0, 1.0))), 0.0);
          vec3 finalColor = baseColor * (0.5 + light * 0.8);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uAlert.value = flareAlert ? 1.0 : 0.0;
    meshRef.current.rotation.y += 0.001;
    meshRef.current.rotation.x += 0.0003;
  });

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[2, 64, 64]} />
    </mesh>
  );
}

function CoronaGlow() {
  const activeFlare = useSolarStore((s) => s.activeFlare);
  const flareAlert = !!(activeFlare && (activeFlare.predictedClass === 'M' || activeFlare.predictedClass === 'X'));
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial
        color={flareAlert ? '#FFB300' : '#FF6B00'}
        transparent
        opacity={0.18}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitRing() {
  return (
    <mesh rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[3.2, 0.005, 8, 100]} />
      <meshBasicMaterial color="#00D4FF" transparent opacity={0.35} />
    </mesh>
  );
}

export function AnimatedSun() {
  return (
    <div className="w-full h-[420px] relative" role="img" aria-label="Animated 3D Sun with corona glow">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} color="#1A2845" />
        <pointLight position={[0, 0, 0]} intensity={1.4} color="#FFA500" />
        <SunSurface />
        <CoronaGlow />
        <OrbitRing />
      </Canvas>
      <div className="absolute bottom-3 inset-x-0 text-center text-xs font-mono text-text-secondary">
        ☉ Sun-Earth L1 Point · Aditya-L1
      </div>
    </div>
  );
}