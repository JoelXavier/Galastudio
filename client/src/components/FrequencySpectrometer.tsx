import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/simulationStore';
import { LineChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Tile } from '@carbon/react';
import { ChartLine, Maximize, TableSplit, Minimize } from '@carbon/icons-react';

interface FrequencyData {
    frequencies: number[];
    power_x: number[];
    power_y: number[];
    power_z: number[];
    dominant_freq_x: number;
    dominant_freq_y: number;
    dominant_freq_z: number;
    resonance_ratio: string | null;
    resonance_label: string | null;
    is_resonant: boolean;
}

export const FrequencySpectrometer: React.FC = () => {
    // Re-connect to Store (Smart Component)
    const points = useStore(state => state.points);
    const potentialParams = useStore(state => state.potentialParams);
    const units = useStore(state => state.units);
    const viewMode = useStore(state => state.viewMode);
    
    const [freqData, setFreqData] = useState<FrequencyData | null>(null);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

    // Restore Data Fetching Logic
    useEffect(() => {
        if (!points || points.length < 10) return;

        const analyzeFreq = async () => {
            try {
                const response = await fetch(`${API_BASE}/analyze_frequencies`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        points: points,
                        time_step: potentialParams.time_step,
                        units: units
                    })
                });

                const data = await response.json();
                if (data.status === 'success') {
                    setFreqData(data);
                }
            } catch (err) {
                console.error('[FrequencySpectrometer] Analysis failed:', err);
            }
        };

        analyzeFreq();
    }, [points, potentialParams.time_step, units, API_BASE]);

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!freqData) return [];
        // Log scale requires positive values
        return freqData.frequencies.map((freq, i) => ({
            group: 'X',
            frequency: freq,
            power: Math.max(freqData.power_x[i], 1e-10)
        })).concat(
            freqData.frequencies.map((freq, i) => ({
                group: 'Y',
                frequency: freq,
                power: Math.max(freqData.power_y[i], 1e-10)
            }))
        ).concat(
            freqData.frequencies.map((freq, i) => ({
                group: 'Z',
                frequency: freq,
                power: Math.max(freqData.power_z[i], 1e-10)
            }))
        );
    }, [freqData]);

    const freqUnit = units === 'galactic' ? '1/Gyr' : '1/yr';

    const options = {
        title: "",
        axes: {
            bottom: {
                title: `Frequency (${freqUnit})`,
                mapsTo: "frequency",
                scaleType: "linear"
            },
            left: {
                title: "Power",
                mapsTo: "power",
                scaleType: "log"
            }
        },
        curve: "curveNatural",
        height: "100%",
        resizable: true,
        legend: {
            enabled: false // Move to custom legend for space
        },
        toolbar: {
            enabled: false
        },
        color: {
            scale: {
                'X': '#ff832b',
                'Y': '#A56EFF',
                'Z': '#1192e8'
            }
        },
        theme: "g100"
    };

    const expandedPanel = useStore(state => state.expandedPanel);
    const setExpandedPanel = useStore(state => state.setExpandedPanel);
    const isExpanded = expandedPanel === 'spectral';

    // Dynamic style for expansion (Matching PhaseSpacePanel)
    const panelStyle: React.CSSProperties = isExpanded ? {
        position: 'fixed',
        top: '48px', // Stay below header
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: 12000, 
        padding: '2rem',
        background: 'rgba(22, 22, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        pointerEvents: 'auto'
    } : { height: '100%', width: '100%', padding: '1.5rem', pointerEvents: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' };

    const chartHeight = isExpanded ? "85vh" : "100%";

    if (!freqData) {
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
                padding: '1rem'
            }}>
                WAITING FOR SIGNAL...
            </div>
        );
    }

    return (
        <div className="gala-glass" style={panelStyle}>
            {/* High-Density Header */}
            <div style={{
                padding: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f4f4', fontWeight: 600, fontFamily: 'IBM Plex Mono, monospace' }}>
                       <ChartLine size={16} color="#8d8d8d" />
                       SPECTROMETERS
                    </div>
                    {freqData.is_resonant && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A56EFF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(165, 110, 255, 0.1)', padding: '2px 8px', borderRadius: '2px' }}>
                             <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#A56EFF', boxShadow: '0 0 5px #A56EFF' }} />
                             {freqData.resonance_ratio} LOCK
                        </div>
                    )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Live Telemetry */}
                    <div style={{ display: 'flex', gap: '12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px' }}>
                        <span style={{ color: '#ff832b' }}>Ωx: {freqData.dominant_freq_x.toFixed(3)}</span>
                        <span style={{ color: '#A56EFF' }}>Ωy: {freqData.dominant_freq_y.toFixed(3)}</span>
                        <span style={{ color: '#1192e8' }}>Ωz: {freqData.dominant_freq_z.toFixed(3)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                        {viewMode === 'editor' && (
                            <>
                                <button 
                                    onClick={() => {
                                        if (!freqData) return;
                                        const rows = freqData.frequencies.map((f, i) => [
                                            f.toFixed(6), 
                                            freqData.power_x[i].toExponential(3),
                                            freqData.power_y[i].toExponential(3),
                                            freqData.power_z[i].toExponential(3)
                                        ]);
                                        useStore.getState().setDataView({
                                            title: "Frequency Spectrum Data",
                                            columns: [`Frequency (${freqUnit})`, "Power X", "Power Y", "Power Z"],
                                            data: rows
                                        });
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: '#8d8d8d', cursor: 'pointer', hover: { color: '#f4f4f4' } } as any}
                                >
                                    <TableSplit size={14} />
                                </button>
                                <button 
                                    onClick={() => setExpandedPanel(isExpanded ? null : 'spectral')}
                                    style={{ background: 'transparent', border: 'none', color: '#8d8d8d', cursor: 'pointer', hover: { color: '#f4f4f4' } } as any}
                                >
                                    {isExpanded ? <Minimize size={14} /> : <Maximize size={14} /> }
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Area */}
            <div style={{ flex: 1, position: 'relative' }}>
                <Tile style={{ background: 'transparent', padding: 0, height: '100%', width: '100%' }}>
                    {/* @ts-expect-error: LineChart types */}
                    <LineChart data={chartData} options={{...options, height: chartHeight}} />
                </Tile>
            </div>
        </div>
    );
};
