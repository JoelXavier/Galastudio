import React, { useMemo, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Line,
  PerspectiveCamera,
} from "@react-three/drei";
import { useStore } from "../store/simulationStore";
import * as THREE from "three";
import { PotentialHeatmap } from "./PotentialHeatmap";
import { GltfExporterBridge } from "./GltfExporterBridge";
import { CsvExporterBridge } from "./CsvExporterBridge";
import { ZoomIn, ZoomOut, Rotate, CenterCircle } from "@carbon/icons-react";

// Common Button Style
const ActionButton = ({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      background: "transparent",
      border: "none",
      borderRadius: "50%",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#8d8d8d",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#f4f4f4";
      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#8d8d8d";
      e.currentTarget.style.background = "transparent";
    }}
  >
    {icon}
  </button>
);

const InteractionPlane = () => {
  const { gl } = useThree();

  // Set default cursor to grab on mount
  React.useEffect(() => {
    gl.domElement.style.cursor = "grab";
  }, [gl]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        // Inject orbit at click position (x, y) on the plane
        const { x, y } = e.point;
        useStore.getState().injectFromGrid(x, y);
      }}
      onPointerOver={() => {
        gl.domElement.style.cursor = "crosshair";
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = "grab";
      }}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />{" "}
      {/* Invisible collider for scene hits */}
    </mesh>
  );
};

const OrbitPath = () => {
  // Connect to the store
  const points = useStore((state) => state.points);
  const orbitEnsemble = useStore((state) => state.orbitEnsemble);
  const isCloudMode = useStore((state) => state.isCloudMode);
  const isIntegrating = useStore((state) => state.isIntegrating);
  const chaosData = useStore((state) => state.chaosData);
  const timeDirection = useStore((state) => state.timeDirection);

  // Convert raw points to Vector3 array
  const linePoints = useMemo(() => {
    if (!points || points.length === 0) return [];
    return points
      .filter((p) => !isNaN(p[0]) && !isNaN(p[1]) && !isNaN(p[2]))
      .map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [points]);

  // Convert Ensemble points
  const ensemblePoints = useMemo(() => {
    if (!isCloudMode || !orbitEnsemble) return [];
    return orbitEnsemble.map((orbit) =>
      orbit.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
    );
  }, [orbitEnsemble, isCloudMode]);

  const ghostPoints = useStore((state) => state.ghostPoints);
  const ghostLinePoints = useMemo(() => {
    if (!ghostPoints || ghostPoints.length === 0) return [];
    return ghostPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [ghostPoints]);

  // Visual Feedback:
  // - Backward: Cyan (#08BDBA) - Time Reversal
  // - Forward Chaotic: Neon Orange (#FF832B) - High Energy
  // - Forward Regular: Electric Purple (#A56EFF) - Brand Primary
  const isBackward = timeDirection === "backward";
  const lineColor = isBackward
    ? "#08BDBA"
    : chaosData?.isChaotic
    ? "#FF832B"
    : "#A56EFF";
  const isDashed = isBackward;

  return (
    <group>
      {/* Ghost Trace (Reference) */}
      {ghostLinePoints.length > 0 && (
        <Line
          points={ghostLinePoints}
          color="#8d8d8d" // Grey 50
          lineWidth={1.5}
          dashed={true}
          dashSize={0.3}
          gapSize={0.2}
          opacity={0.4}
          transparent
        />
      )}

      {/* Primary Orbit */}
      {linePoints.length > 0 && (
        <Line
          points={linePoints} // Array of Vector3
          color={lineColor} // Adaptive Color
          lineWidth={2} // Width of the line
          dashed={isDashed} // Dashed for backward integration
          dashSize={0.5} // Length of dashes
          gapSize={0.3} // Length of gaps
          opacity={isIntegrating ? 0.3 : 1}
          transparent
          toneMapped={false} // "Neon-like intensity"
        />
      )}

      {/* Ensemble Cloud */}
      {isCloudMode &&
        ensemblePoints.map((pts, i) => (
          <Line
            key={`ensemble-${i}`}
            points={pts}
            color={lineColor}
            lineWidth={0.5} // Ghostly thin
            dashed={isDashed} // Match primary orbit style
            dashSize={0.5}
            gapSize={0.3}
            opacity={0.15} // Transparent cloud
            transparent
            toneMapped={false}
          />
        ))}
    </group>
  );
};

// Breathing Star Field
const BreathingStars = () => {
  const starsRef = React.useRef<THREE.Points>(null);
  useThree(({ clock }) => {
    if (starsRef.current) {
      // Gentle rotation
      starsRef.current.rotation.y =
        Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
      // "Breathing" scale - subtle pulse
      const scale = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.01;
      starsRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={5000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  );
};

// Start OrbitControls ref to access from UI
const CameraControlsUI = () => {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = React.useRef<any>(null);
  const cameraAction = useStore((state) => state.cameraAction);
  const [isRotating, setIsRotating] = React.useState(false);

  // Respond to Store Actions
  useEffect(() => {
    if (!cameraAction) return;

    if (cameraAction.type === "zoomIn") {
      camera.position.multiplyScalar(0.8);
    } else if (cameraAction.type === "zoomOut") {
      camera.position.multiplyScalar(1.25);
    } else if (cameraAction.type === "reset") {
      camera.position.set(20, 20, 20);
      if (controlsRef.current) controlsRef.current.reset();
      // Decouple state update to avoid render loop warning
      setTimeout(() => setIsRotating(false), 0);
    } else if (cameraAction.type === "toggleRotate") {
      setTimeout(() => setIsRotating((prev) => !prev), 0);
    }
  }, [cameraAction, camera]);

  // Auto Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minDistance={2}
      maxDistance={200}
    />
  );
};

// Immersive Core: The "Star Formation"
const StarFormationCore = () => {
  const { camera, gl } = useThree();
  const meshRef = React.useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        // Immersive Zoom Logic
        // We'll move camera to a close diagnostic position
        const targetPos = new THREE.Vector3(8, 8, 8);

        // Simple animation
        const startPos = camera.position.clone();
        let alpha = 0;
        const anim = () => {
          alpha += 0.02;
          if (alpha <= 1) {
            camera.position.lerpVectors(startPos, targetPos, alpha);
            camera.lookAt(0, 0, 0);
            requestAnimationFrame(anim);
          }
        };
        anim();
      }}
      onPointerOver={() => {
        gl.domElement.style.cursor = "grab";
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = "grab";
      }}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        emissive="#ff832b"
        emissiveIntensity={5}
        color="#ff832b"
        toneMapped={false}
      />
      {/* Soft Glow */}
      <pointLight intensity={2} distance={10} color="#ff832b" />
    </mesh>
  );
};

export const GalacticScene: React.FC = () => {
  const isIntegrating = useStore((state) => state.isIntegrating);
  const points = useStore((state) => state.points);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* Camera Dock: Bottom Right of Quadrant */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          right: "24px",
          display: "flex",
          gap: "8px",
          padding: "6px",
          background: "rgba(22, 22, 22, 0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "24px",
          zIndex: 1000,
        }}
      >
        <ActionButton
          icon={<ZoomIn size={18} />}
          onClick={() => useStore.getState().triggerCamera("zoomIn")}
          label="Zoom In"
        />
        <ActionButton
          icon={<ZoomOut size={18} />}
          onClick={() => useStore.getState().triggerCamera("zoomOut")}
          label="Zoom Out"
        />
        <ActionButton
          icon={<Rotate size={18} />}
          onClick={() => useStore.getState().triggerCamera("toggleRotate")}
          label="Auto Rotate"
        />
        <ActionButton
          icon={<CenterCircle size={18} />}
          onClick={() => useStore.getState().triggerCamera("reset")}
          label="Reset View"
        />
      </div>
      {/* Loader moved to App.tsx */}
      {isIntegrating && (
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(22, 22, 22, 0.6)",
            backdropFilter: "blur(10px)",
            padding: "8px 16px",
            border: "1px solid rgba(165, 110, 255, 0.2)",
            borderRadius: "2px",
            fontFamily: "IBM Plex Mono, monospace",
          }}
        >
          <div
            className="pulse-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#A56EFF",
              boxShadow: "0 0 8px #A56EFF",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              color: "#f4f4f4",
              fontWeight: 600,
              letterSpacing: "2px",
            }}
          >
            RENDERING...
          </span>
        </div>
      )}

      {!isIntegrating && points.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            color: "#8d8d8d",
            fontFamily: "IBM Plex Mono, monospace",
            textAlign: "center",
            background: "rgba(22, 22, 22, 0.8)",
            padding: "24px",
            border: "1px solid rgba(165, 110, 255, 0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "#a56eff",
              marginBottom: "8px",
              letterSpacing: "2px",
            }}
          >
            SYSTEM READY
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#f4f4f4" }}>
            NO ORBIT DATA DETECTED
          </div>
          <p style={{ fontSize: "11px", marginTop: "8px", opacity: 0.6 }}>
            Adjust potential parameters or select a scenario to begin
            integration
          </p>
        </div>
      )}

      <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }}>
        <GltfExporterBridge />
        <CsvExporterBridge />

        {/* Camera Setup */}
        <PerspectiveCamera makeDefault position={[30, 30, 30]} fov={50} />

        {/* Controls (Internal) */}
        <CameraControlsUI />

        {/* The Void */}
        <color attach="background" args={["#161616"]} />
        <BreathingStars />

        {/* Lighting (though lines are unlit, geometry needs it) */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* Content */}
        <OrbitPath />
        <InteractionPlane />
        <StarFormationCore />
        <PotentialHeatmap />

        {/* Reference Grid */}
        <gridHelper
          args={[100, 50, 0x333333, 0x222222]}
          position={[0, -0.01, 0]}
        />
      </Canvas>
    </div>
  );
};
