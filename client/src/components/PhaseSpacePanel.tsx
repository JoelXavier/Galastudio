import React, { useMemo } from 'react';
import { LineChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { useStore } from '../store/simulationStore';
import { Tile } from '@carbon/react';
import { TableSplit, Maximize, Minimize } from '@carbon/icons-react';

export const PhaseSpacePanel: React.FC = () => {
    const points = useStore(state => state.points);
    const velocities = useStore(state => state.velocities);
    const units = useStore(state => state.units);
    const AU_YR_TO_KMS = 4.74047;

    const chartData = useMemo(() => {
        if (!points.length || !velocities.length) return [];
        
        return points.map((p, i) => {
            if (!velocities[i]) return null;
            // Calculate Radius (kpc/AU)
            const r = Math.sqrt(p[0]**2 + p[1]**2 + p[2]**2);
            // Calculate Velocity (km/s or AU/yr)
            let v = Math.sqrt(velocities[i][0]**2 + velocities[i][1]**2 + velocities[i][2]**2);
            
            // Heuristic Fix: Always display km/s
            if (units === 'solarsystem') {
                v = v * AU_YR_TO_KMS;
            }
            
            return {
                group: 'Orbit Trace',
                x: r,
                y: v
            };
        }).filter((item): item is { group: string; x: number; y: number } => item !== null);
    }, [points, velocities, units]);

    const options = {
        title: "",
        axes: {
            bottom: {
                title: units === 'galactic' ? "Radius (kpc)" : "Radius (AU)",
                mapsTo: "x",
                scaleType: "linear"
            },
            left: {
                title: "Total Velocity (km/s)",
                mapsTo: "y",
                scaleType: "linear"
            }
        },
        height: "100%",
        resizable: true,
        theme: "g100",
        toolbar: {
            enabled: false // Disable Carbon Toolbar to avoid "Show as Table" confusion
        },
        points: {
            radius: 0
        },
        color: {
            scale: {
                "Orbit Trace": "#A56EFF"
            }
        }
    };

    const expandedPanel = useStore(state => state.expandedPanel);
    const setExpandedPanel = useStore(state => state.setExpandedPanel);
    const isExpanded = expandedPanel === 'phase';

    // Dynamic style for expansion
    const panelStyle: React.CSSProperties = isExpanded ? {
        position: 'fixed',
        top: '48px', // Stay below header
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: 12000, 
        padding: '2rem',
        background: 'rgba(22, 22, 22, 0.95)',
        backdropFilter: 'blur(20px)'
    } : { height: '100%', width: '100%', padding: '1.5rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' };

    const chartHeight = isExpanded ? "85vh" : "100%";

    if (chartData.length === 0) {
        return (
            <div className="gala-glass" style={{ 
                height: '100%', 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#8d8d8d',
                fontSize: '12px',
                fontFamily: 'IBM Plex Mono, monospace',
                padding: '1.5rem'
            }}>
                WAITING FOR ORBIT TRACE...
            </div>
        );
    }

    return (
        <div className="gala-glass" style={panelStyle}>
             {/* Header */}
             <div style={{
                padding: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', 
                fontSize: '11px',
                color: '#f4f4f4',
                fontWeight: 600,
                fontFamily: 'IBM Plex Mono, monospace'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#A56EFF' }}>◆</span> PHASE SPACE
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    {useStore.getState().viewMode === 'editor' && (
                        <>
                            <button 
                                onClick={() => {
                                    const state = useStore.getState();
                                    // Flatten data for table
                                    const rows = state.velocities.map((v, i) => [
                                        state.points[i] ? Math.sqrt(state.points[i][0]**2 + state.points[i][1]**2 + state.points[i][2]**2).toFixed(3) : 0, 
                                        Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2).toFixed(3)
                                    ]);
            
                                    useStore.getState().setDataView({
                                        title: "Phase Space Data (Radius vs Velocity)",
                                        columns: ["Radius", "Velocity"],
                                        data: rows
                                    });
                                }}
                                    style={{ background: 'transparent', border: 'none', color: '#8d8d8d', cursor: 'pointer' }}
                                    title="View Data Table"
                                >
                                    <TableSplit size={14} />
                                </button>
                            
                            <button 
                                onClick={() => setExpandedPanel(isExpanded ? null : 'phase')}
                                style={{ background: 'transparent', border: 'none', color: '#f4f4f4', cursor: 'pointer', opacity: 0.7 }}
                                title={isExpanded ? "Restore" : "Maximize"}
                            >
                                {isExpanded ? <Minimize size={16} /> : <Maximize size={16} /> } 
                            </button>
                        </>
                    )}
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>
                <Tile style={{ background: 'transparent', padding: 0, height: '100%', width: '100%' }}>
                    {/* @ts-expect-error: LineChart types */}
                    <LineChart data={chartData} options={{...options, height: chartHeight}} />
                </Tile>
            </div>
        </div>
    );
};
