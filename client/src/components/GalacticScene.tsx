import React, { useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, PerspectiveCamera } from '@react-three/drei';
import { useStore } from '../store/simulationStore';
import * as THREE from 'three';
import { PotentialHeatmap } from './PotentialHeatmap';
import { GltfExporterBridge } from './GltfExporterBridge';
import { CsvExporterBridge } from './CsvExporterBridge';
// Interaction Plane (The "Canvas" for the user)
const InteractionPlane = () => {
    const setPotentialParams = useStore(state => state.setPotentialParams);
    const [hovered, setHovered] = React.useState(false);
    
    // Update canvas cursor when hover state changes
    React.useEffect(() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.style.cursor = hovered ? 'crosshair' : 'grab';
        }
    }, [hovered]);
    
    return (
        <mesh 
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
                
                // Get point in world space
                const { x, z } = e.point; // Y is 0 on this plane
                
                // Update Store -> Triggers integration
                setPotentialParams({ x, z, y: 0 }); 
            }}
        >
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} /> {/* Fully transparent but interactive */}
        </mesh>
    );
};

const OrbitPath = () => {
    // Connect to the store
    const points = useStore(state => state.points);
    const orbitEnsemble = useStore(state => state.orbitEnsemble);
    const isCloudMode = useStore(state => state.isCloudMode);
    const isIntegrating = useStore(state => state.isIntegrating);
    const chaosData = useStore(state => state.chaosData);
    const timeDirection = useStore(state => state.timeDirection);

    // Convert raw points to Vector3 array
    const linePoints = useMemo(() => {
        if (!points || points.length === 0) return [];
        return points
            .filter(p => !isNaN(p[0]) && !isNaN(p[1]) && !isNaN(p[2]))
            .map(p => new THREE.Vector3(p[0], p[1], p[2]));
    }, [points]);

    // Convert Ensemble points
    const ensemblePoints = useMemo(() => {
        if (!isCloudMode || !orbitEnsemble) return [];
        return orbitEnsemble.map(orbit => 
            orbit.map(p => new THREE.Vector3(p[0], p[1], p[2]))
        );
    }, [orbitEnsemble, isCloudMode]);

    const ghostPoints = useStore(state => state.ghostPoints);
    const ghostLinePoints = useMemo(() => {
        if (!ghostPoints || ghostPoints.length === 0) return [];
        return ghostPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    }, [ghostPoints]);

    // Visual Feedback: 
    // - Backward: Cyan (#08BDBA) - Time Reversal
    // - Forward Chaotic: Neon Orange (#FF832B) - High Energy
    // - Forward Regular: Electric Purple (#A56EFF) - Brand Primary
    const isBackward = timeDirection === 'backward';
    const lineColor = isBackward ? "#08BDBA" : (chaosData?.isChaotic ? "#FF832B" : "#A56EFF");
    const isDashed = isBackward;

    return (
        <group>
            {/* Ghost Trace (Reference) */}
            {ghostLinePoints.length > 0 && (
                <Line
                    points={ghostLinePoints}
                    color="#8d8d8d"           // Grey 50
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
                    points={linePoints}       // Array of Vector3
                    color={lineColor}           // Adaptive Color
                    lineWidth={2}             // Width of the line
                    dashed={isDashed}            // Dashed for backward integration
                    dashSize={0.5}            // Length of dashes
                    gapSize={0.3}             // Length of gaps
                    opacity={isIntegrating ? 0.3 : 1} 
                    transparent
                    toneMapped={false}        // "Neon-like intensity"
                />
            )}

            {/* Ensemble Cloud */}
            {isCloudMode && ensemblePoints.map((pts, i) => (
                <Line 
                    key={`ensemble-${i}`}
                    points={pts}
                    color={lineColor}
                    lineWidth={0.5}          // Ghostly thin
                    dashed={isDashed}        // Match primary orbit style
                    dashSize={0.5}
                    gapSize={0.3}
                    opacity={0.15}            // Transparent cloud
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
            starsRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
            // "Breathing" scale - subtle pulse
            const scale = 1 + Math.sin(clock.getElapsedTime() * 0.5) * 0.01;
            starsRef.current.scale.set(scale, scale, scale);
        }
    });

    return <Stars ref={starsRef} radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />;
};

export const GalacticScene: React.FC = () => {
    const isIntegrating = useStore(state => state.isIntegrating);
    const points = useStore(state => state.points);

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 48px)', position: 'relative' }}> {/* 48px for Header */}
            {/* Loader moved to App.tsx */}

            {!isIntegrating && points.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    color: '#8d8d8d',
                    fontFamily: 'IBM Plex Mono, monospace',
                    textAlign: 'center'
                }}>
                    <h3>NO ORBIT DATA</h3>
                    <p style={{ fontSize: '12px' }}>Check connection or parameters</p>
                </div>
            )}
            
            {/* TrustMeter moved to Sidebar */}

            <Canvas shadows camera={{ position: [20, 20, 20], fov: 45 }}>
                <GltfExporterBridge />
                <CsvExporterBridge />
                {/* Camera Setup */}
                <PerspectiveCamera makeDefault position={[30, 30, 30]} fov={50} />
                <OrbitControls makeDefault />

                {/* The Void */}
                <color attach="background" args={['#161616']} /> 
                <BreathingStars />
                
                {/* Lighting (though lines are unlit, geometry needs it) */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />

                {/* Content */}
                <OrbitPath />
                <InteractionPlane />
                <PotentialHeatmap />
                
                {/* Reference Grid */}
                <gridHelper args={[50, 50, 0x393939, 0x393939]} position={[0, -0.01, 0]} />
            </Canvas>
        </div>
    );
};
