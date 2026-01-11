import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/simulationStore';
import * as THREE from 'three';
import { apiRequest } from '../api/client';


interface PotentialGridData {
    status: string;
    grid: number[][];
    min_potential: number;
    max_potential: number;
}

export const PotentialHeatmap: React.FC = () => {
    const potentialParams = useStore(state => state.potentialParams);
    const potentialType = useStore(state => state.potentialType);
    const units = useStore(state => state.units);
    const points = useStore(state => state.points);
    
    const [gridData, setGridData] = useState<PotentialGridData | null>(null);

    // Compute L_z from current orbit (angular momentum)
    const L_z = useMemo(() => {
        if (!points || points.length === 0) return 1700.0; // Default
        
        // L_z = r × v (z-component)
        // For circular orbit: L_z ≈ R * V_circular
        const [x, y] = points[0];
        const R = Math.sqrt(x * x + y * y);
        const V_circ = potentialParams.vy; // Approximation
        
        return R * V_circ;
    }, [points, potentialParams]);

    // Fetch potential grid from backend
    useEffect(() => {
        const fetchGrid = async () => {
            console.log('[PotentialHeatmap] Fetching grid with L_z:', L_z);
            try {
                const data = await apiRequest<PotentialGridData>('/compute_potential_grid', {
                    potential_type: potentialType,
                    units: units,
                    mass: units === 'galactic' ? potentialParams.mass * 1.0e10 : potentialParams.mass,
                    L_z: L_z,
                    grid_size: 80,
                    x_range: units === 'galactic' ? [-20, 20] : [-50, 50],
                    y_range: units === 'galactic' ? [-20, 20] : [-50, 50]
                });

                console.log('[PotentialHeatmap] Grid response:', data.status);
                if (data.status === 'success') {
                    setGridData(data);
                    console.log('[PotentialHeatmap] Grid data set, size:', data.grid.length);
                }
            } catch (err) {
                console.error('[PotentialHeatmap] Failed to fetch potential grid:', err);
            }
        };

        fetchGrid();
    }, [potentialType, potentialParams.mass, units, L_z]);

    // Create texture from grid data
    const texture = useMemo(() => {
        if (!gridData) return null;

        const size = gridData.grid.length;
        const data = new Uint8Array(size * size * 4); // RGBA

        const min = gridData.min_potential;
        const max = gridData.max_potential;

        // Use logarithmic scaling for better color distribution
        // Add small offset to avoid log(0)
        const logMin = Math.log(Math.abs(min) + 1);
        const logMax = Math.log(Math.abs(max) + 1);
        const logRange = logMax - logMin;

        // Map grid to colors
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const phi = gridData.grid[i][j];
                
                // Logarithmic normalization
                const logPhi = Math.log(Math.abs(phi) + 1);
                const normalized = (logPhi - logMin) / logRange;

                // Color mapping: Blue (low/stable) -> Red (high/forbidden)
                const idx = (i * size + j) * 4;
                
                // Enhanced gradient with more color variation
                if (normalized < 0.33) {
                    // Deep Blue -> Cyan
                    const t = normalized / 0.33;
                    data[idx] = 0;                              // R
                    data[idx + 1] = t * 180;                    // G
                    data[idx + 2] = 139 + t * 116;              // B (139->255)
                } else if (normalized < 0.67) {
                    // Cyan -> Yellow
                    const t = (normalized - 0.33) / 0.34;
                    data[idx] = t * 241;                        // R (0->241)
                    data[idx + 1] = 180 + t * 61;               // G (180->241)
                    data[idx + 2] = 255 - t * 228;              // B (255->27)
                } else {
                    // Yellow -> Red
                    const t = (normalized - 0.67) / 0.33;
                    data[idx] = 241 + t * 9;                    // R (241->250)
                    data[idx + 1] = 241 - t * 185;              // G (241->56)
                    data[idx + 2] = 27 - t * 27;                // B (27->0)
                }
                
                // Alpha: More transparent for low potential (blue), more opaque for high potential (red)
                // Low potential (0.0) -> alpha 80 (very transparent)
                // High potential (1.0) -> alpha 220 (mostly opaque)
                data[idx + 3] = 80 + normalized * 140;
            }
        }

        const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        tex.needsUpdate = true;
        console.log('[PotentialHeatmap] Texture created, size:', size);
        return tex;
    }, [gridData]);

    console.log('[PotentialHeatmap] Rendering, texture:', texture ? 'exists' : 'null');
    
    if (!texture) return null;

    const gridSize = units === 'galactic' ? 40 : 100;

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <planeGeometry args={[gridSize, gridSize]} />
            <meshBasicMaterial 
                map={texture} 
                transparent 
                opacity={0.85}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};
