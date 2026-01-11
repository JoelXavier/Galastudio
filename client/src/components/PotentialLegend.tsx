import React from 'react';
import { Information } from '@carbon/icons-react';

export const PotentialLegend: React.FC = () => {
    return (
        <div style={{
            padding: '12px',
            width: '280px',
            background: 'var(--gala-glass-bg)',
            backdropFilter: 'blur(10px)',
            border: 'var(--gala-glass-border)',
            borderRadius: '4px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f4f4f4',
                fontFamily: 'IBM Plex Mono, monospace'
            }}>
                <Information size={18} color="#a56eff" />
                GRAVITY MAP
            </div>

            {/* Gradient Bar */}
            <div style={{
                height: '20px', 
                borderRadius: '4px',
                background: 'linear-gradient(to right, #A56EFF, #be95ff, #FF832B)',
                marginBottom: '12px',
                border: 'var(--gala-glass-border)'
            }} />

            {/* Labels */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#8d8d8d',
                marginBottom: '12px',
                fontFamily: 'IBM Plex Mono, monospace'
            }}>
                <span>Low Φ (Stable)</span>
                <span>High Φ (Forbidden)</span>
            </div>
        </div>
    );
};
