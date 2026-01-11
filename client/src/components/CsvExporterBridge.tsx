import React, { useEffect } from 'react';
import { useStore } from '../store/simulationStore';

export const CsvExporterBridge: React.FC = () => {
    const downloadCsvTrigger = useStore(state => state.downloadCsvTrigger);
    const points = useStore(state => state.points);
    const velocities = useStore(state => state.velocities);

    useEffect(() => {
        if (downloadCsvTrigger === 0) return;
        if (points.length === 0) {
            console.warn('[CsvExporterBridge] No data to export');
            return;
        }

        console.log('[CsvExporterBridge] 📊 Generating Phase Data CSV...');

        // Format CSV
        // Header: x, y, z, vx, vy, vz
        const csvRows = ['x,y,z,vx,vy,vz'];
        
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const v = velocities[i] || [0, 0, 0];
            csvRows.push(`${p[0]},${p[1]},${p[2]},${v[0]},${v[1]},${v[2]}`);
        }

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `orbit_phase_data_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    }, [downloadCsvTrigger, points, velocities]);

    return null; // Headless component
};
