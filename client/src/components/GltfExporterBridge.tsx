import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { useStore } from '../store/simulationStore';

/**
 * GltfExporterBridge
 * 
 * A headless component that listens for a download trigger and 
 * exports the current Three.js scene as a .GLB file.
 */
export const GltfExporterBridge: React.FC = () => {
    const { scene } = useThree();
    const downloadGltfTrigger = useStore(state => state.downloadGltfTrigger);

    useEffect(() => {
        if (downloadGltfTrigger === 0) return;

        console.log('[GltfExporterBridge] Triggering GLB Export...');

        const exporter = new GLTFExporter();
        
        // Options for GLTF Export
        const options = {
            binary: true, // Export as .GLB
            trs: false,
            onlyVisible: true,
            truncateDrawRange: true
        };

        exporter.parse(
            scene,
            (result) => {
                if (result instanceof ArrayBuffer) {
                    saveArrayBuffer(result, 'galastudio_simulation.glb');
                } else {
                    const output = JSON.stringify(result, null, 2);
                    saveString(output, 'galastudio_simulation.gltf');
                }
            },
            (error) => {
                console.error('[GltfExporterBridge] Error parsing scene:', error);
            },
            options
        );
    }, [downloadGltfTrigger, scene]);

    return null;
};

/**
 * Helper to trigger browser download for binary data
 */
function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    document.body.removeChild(link);
}

/**
 * Helper to trigger browser download for text data
 */
function saveString(text: string, filename: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    document.body.removeChild(link);
}
