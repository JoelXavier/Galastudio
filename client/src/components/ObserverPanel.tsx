import React, { useMemo } from 'react';
import { ScatterChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { useStore } from '../store/simulationStore';
import { Tile } from '@carbon/react';
import { ViewNext } from '@carbon/icons-react';

export const ObserverPanel: React.FC = () => {
    const skyPoints = useStore(state => state.skyPoints);
    const skyEnsemble = useStore(state => state.skyEnsemble);
    const isCloudMode = useStore(state => state.isCloudMode);
    const isObserverMode = useStore(state => state.isObserverMode);

    const chartData = useMemo(() => {
        if (!isObserverMode || !skyPoints) return [];

        const data: any[] = [];

        // Primary Orbit
        skyPoints.forEach((p, i) => {
            // Only plot every N points to keep performance high on the 2D chart
            if (i % 5 === 0) {
                data.push({
                    group: 'Primary Orbit',
                    l: p[0],
                    b: p[1]
                });
            }
        });

        // Ensemble
        if (isCloudMode && skyEnsemble) {
            skyEnsemble.forEach((ensemble) => {
                 // Sample the ensemble even more aggressively
                 ensemble.forEach((p, stepIdx) => {
                     if (stepIdx % 20 === 0) {
                         data.push({
                             group: 'Ensemble Cloud',
                             l: p[0],
                             b: p[1]
                         });
                     }
                 });
            });
        }

        return data;
    }, [skyPoints, skyEnsemble, isCloudMode, isObserverMode]);

    const options = {
        title: "Synthetic Observer: Galactic Sky Map",
        axes: {
            bottom: {
                title: "Galactic Longitude (l)",
                mapsTo: "l",
                scaleType: "linear",
                domain: [-180, 180]
            },
            left: {
                title: "Galactic Latitude (b)",
                mapsTo: "b",
                scaleType: "linear",
                domain: [-90, 90]
            }
        },
        height: "300px",
        theme: "g100",
        points: {
            radius: 2
        },
        color: {
            scale: {
                "Primary Orbit": "#33b1ff", // Cyan
                "Ensemble Cloud": "#a56eff" // Purple
            }
        },
        legend: {
            enabled: true,
            alignment: "center"
        },
        tooltip: {
            enabled: false
        }
    };

    if (!isObserverMode || chartData.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '18rem',
            width: '450px',
            zIndex: 9000, // High Z to float above all
            background: 'rgba(22, 22, 22, 0.95)',
            border: '1px solid #33b1ff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            cursor: 'default'
        }}>
           <div style={{ padding: '8px 12px', background: '#161616', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#f4f4f4', fontWeight: 600 }}>
                <ViewNext size={16} color="#33b1ff" />
                SYNTHETIC OBSERVER (EARTH VIEW)
           </div>
           <Tile>
               {/* @ts-ignore */}
               <ScatterChart data={chartData} options={options} />
           </Tile>
        </div>
    );
};
