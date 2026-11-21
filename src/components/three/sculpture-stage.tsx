"use client";

import { Center, ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Rotate3d } from "lucide-react";
import { Suspense, useState } from "react";

function SculptureModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

export function SculptureStage({
  modelUrl,
  exploreLabel,
}: {
  modelUrl: string;
  exploreLabel: string;
}) {
  const [interactive, setInteractive] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-ink-950/15 bg-board-200/80 sm:aspect-[16/10]">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.8, 3.6], fov: 40 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 6, 4]} intensity={1.4} castShadow />
        <directionalLight position={[-4, 2, -4]} intensity={0.5} color="#f6e9d7" />

        <Suspense fallback={null}>
          <SculptureModel url={modelUrl} />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.35}
            scale={8}
            blur={2.4}
            far={4}
            color="#2c2925"
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          enableZoom={interactive}
          enablePan={false}
          autoRotate={!interactive}
          autoRotateSpeed={0.65}
        />
      </Canvas>

      {!interactive ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="pointer-events-auto inline-flex items-center gap-2 border border-ink-950 bg-board-50/95 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-950 backdrop-blur-sm transition-colors hover:border-oxide hover:bg-oxide hover:text-board-50"
          >
            <Rotate3d className="size-3.5" />
            {exploreLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
