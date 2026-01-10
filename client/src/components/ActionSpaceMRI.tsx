import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Points, PointMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/simulationStore';
import { Activity } from '@carbon/icons-react';

const ActionPoints = ({ actions }: { actions: [number, number, number][] }) => {
    const pointsRef = useRef<THREE.Points>(null);

    // Normalize or scale actions for better visibility in 3.0 units?
    // Actions can vary wildly. 
    // Typical values for MW: ~ 100-1000 kpc*km/s
    const scaledPoints = useMemo(() => {
        if (!actions || actions.length === 0) return new Float32Array(0);
        
        // Find max for normalization if needed, or just use a fixed scale
        const flat = new Float32Array(actions.length * 3);
        let validCount = 0;
        actions.forEach((a) => {
             if (isNaN(a[0]) || isNaN(a[1]) || isNaN(a[2])) return;
             
             // Mapping: [Jr, Lz, Jz] -> [X, Y, Z]
             const x = a[0] / 50.0;
             const y = a[1] / 100.0;
             const z = a[2] / 50.0;
             
             flat[validCount * 3 + 0] = x;
             flat[validCount * 3 + 1] = y;
             flat[validCount * 3 + 2] = z;
             validCount++;
        });
        return flat.slice(0, validCount * 3);
    }, [actions]);

    return (
        <group>
            <Points positions={scaledPoints} ref={pointsRef}>
                <PointMaterial
                    transparent
                    vertexColors={false}
                    size={0.15}
                    sizeAttenuation={true}
                    color="#a56eff" // Purple (DNA color)
                    opacity={0.8}
                />
            </Points>
            
            {/* Legend / Axes */}
            <gridHelper args={[20, 20, 0x333333, 0x333333]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
    );
};

const AxisLabel = ({ pos, text }: { pos: [number, number, number], text: string }) => (
    <Text
        position={pos}
        fontSize={0.5}
        color="#8d8d8d"
        anchorX="center"
        anchorY="middle"
    >
        {text}
    </Text>
);

export const ActionSpaceMRI: React.FC = () => {
    const orbitActions = useStore(state => state.orbitActions);
    const isCloudMode = useStore(state => state.isCloudMode);

    if (!orbitActions || orbitActions.length === 0) return null;

    return (
        <div className="gala-glass" style={{
            position: 'fixed',
            top: '100px', // Header clearance
            right: '20px',
            width: '320px',
            height: '320px',
            zIndex: 9000, 
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ 
                padding: '8px 12px', 
                borderBottom: '1px solid #393939',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#f4f4f4',
                fontWeight: 600
            }}>
                <Activity size={16} color="#a56eff" />
                ACTION SPACE MRI (DNA)
            </div>
            
            <div style={{ flex: 1, position: 'relative' }}>
                <Canvas gl={{ alpha: true }}>
                    <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
                    <OrbitControls makeDefault />
                    {/* Transparent background for glass effect */}
                    
                    <ambientLight intensity={0.5} />
                    
                    <ActionPoints actions={orbitActions} />
                    
                    {/* Axis Labels */}
                    <AxisLabel pos={[11, 0, 0]} text="Jr" />
                    <AxisLabel pos={[0, 11, 0]} text="Lz" />
                    <AxisLabel pos={[0, 0, 11]} text="Jz" />
                </Canvas>
                
                {/* Micro-label */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '8px', 
                    right: '8px', 
                    fontSize: '10px', 
                    color: '#8d8d8d',
                    pointerEvents: 'none'
                }}>
                    {isCloudMode ? 'Ensemble Invariants' : 'Single Orbit DNA'}
                </div>
            </div>
        </div>
    );
};
