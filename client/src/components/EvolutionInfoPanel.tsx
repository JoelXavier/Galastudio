import React from 'react';
import { useStore } from '../store/simulationStore';
import { Time } from '@carbon/icons-react';

export const EvolutionInfoPanel: React.FC = () => {
    const evolutionMetadata = useStore(state => state.evolutionMetadata);
    const units = useStore(state => state.units);

    if (!evolutionMetadata) return null;

    const timeUnit = units === 'galactic' ? 'Gyr' : 'yr';

    return (
        <div className="gala-glass" style={{
            width: '280px',
            border: 'var(--gala-glass-border)',
            cursor: 'default',
            pointerEvents: 'auto'
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
                <Time size={16} color="#a56eff" />
                EVOLUTION METADATA
            </div>
            
            <div style={{ padding: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#8d8d8d', marginBottom: '2px' }}>
                        Total Evolution Time
                    </div>
                    <div style={{ fontSize: '16px', color: '#f4f4f4', fontWeight: 600 }}>
                        {evolutionMetadata.totalTime.toFixed(2)} {timeUnit}
                    </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', color: '#8d8d8d', marginBottom: '2px' }}>
                        Keyframes
                    </div>
                    <div style={{ fontSize: '14px', color: '#f4f4f4' }}>
                        {evolutionMetadata.keyframeCount} keyframes
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: '10px', color: '#8d8d8d', marginBottom: '2px' }}>
                        Time Range
                    </div>
                    <div style={{ fontSize: '14px', color: '#f4f4f4' }}>
                        {evolutionMetadata.timeRange[0].toFixed(1)} → {evolutionMetadata.timeRange[1].toFixed(1)} {timeUnit}
                    </div>
                </div>

                <div style={{ 
                    marginTop: '12px', 
                    paddingTop: '8px', 
                    borderTop: '1px solid #393939',
                    fontSize: '10px',
                    color: '#8d8d8d',
                    lineHeight: '1.4'
                }}>
                    Orbit evolved through {evolutionMetadata.keyframeCount} time-varying potential states
                </div>
            </div>
        </div>
    );
};
