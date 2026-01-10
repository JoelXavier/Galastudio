import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/simulationStore';
import { LineChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Tile, Tag } from '@carbon/react';
import { ChartLine, Maximize, CheckmarkFilled, TableSplit, Minimize } from '@carbon/icons-react';

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

    // Restore Data Fetching Logic
    useEffect(() => {
        if (!points || points.length < 10) return;

        const analyzeFreq = async () => {
            try {
                const response = await fetch('/analyze_frequencies', {
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
    }, [points, potentialParams.time_step, units]);

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
        height: "280px",
        legend: {
            enabled: true
        },
        toolbar: {
            enabled: false
        },
        color: {
            scale: {
                'X': '#ff832b',
                'Y': '#a56eff',
                'Z': '#08bdba'
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
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 12000, 
        padding: '2rem',
        background: 'rgba(22, 22, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        pointerEvents: 'auto'
    } : { width: '400px', padding: '1rem', pointerEvents: 'auto' };

    const chartHeight = isExpanded ? "85vh" : "280px";

    if (!freqData) {
        return (
            <div className="gala-glass" style={{ 
                height: '300px', 
                width: '400px',
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
            {/* Header */}
            <div style={{
                padding: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#f4f4f4',
                fontWeight: 600,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f4f4', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace' }}>
                   <ChartLine size={16} />
                   SPECTRAL ANALYSIS
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                style={{ background: 'transparent', border: 'none', color: '#f4f4f4', cursor: 'pointer', opacity: 0.7 }}
                                title="View Data Table"
                            >
                                <TableSplit size={16} />
                            </button>
                            <button 
                                onClick={() => setExpandedPanel(isExpanded ? null : 'spectral')}
                                style={{ background: 'transparent', border: 'none', color: '#f4f4f4', cursor: 'pointer', opacity: 0.7 }}
                                title={isExpanded ? "Restore" : "Maximize"}
                            >
                                {isExpanded ? <Minimize size={16} /> : <Maximize size={16} /> }
                            </button>
                        </>
                    )}
                    
                    {freqData.is_resonant ? (
                        <Tag type="purple" size="sm" style={{ margin: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                                 {freqData.resonance_ratio} RESONANCE
                            </span>
                        </Tag>
                    ) : (
                        <Tag type="gray" size="sm" style={{ margin: 0 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                                <CheckmarkFilled /> NO RESONANCE
                            </span>
                        </Tag>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <div style={{ 
                display: 'flex', 
                fontSize: '10px', 
                fontFamily: 'IBM Plex Mono, monospace', 
                color: '#8d8d8d',
                marginBottom: '8px',
                gap: '12px',
                justifyContent: 'space-between'
            }}>
                <span style={{ color: '#ff832b' }}>Ωx: {freqData.dominant_freq_x.toFixed(3)}</span>
                <span style={{ color: '#a56eff' }}>Ωy: {freqData.dominant_freq_y.toFixed(3)}</span>
                <span style={{ color: '#08bdba' }}>Ωz: {freqData.dominant_freq_z.toFixed(3)}</span>
            </div>

            {/* Chart */}
            <Tile style={{ background: 'transparent', padding: 0 }}>
                {/* @ts-ignore: LineChart types */}
                <LineChart data={chartData} options={{...options, height: chartHeight}} />
            </Tile>
        </div>
    );
};
