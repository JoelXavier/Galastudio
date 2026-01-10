import React from 'react';
import { useStore } from '../store/simulationStore';
import { CheckmarkFilled, WarningFilled, ErrorFilled, Information } from '@carbon/icons-react';
import { PortalTooltip } from './PotentialSidebar'; // Re-use our robust tooltip

export const TrustMeter: React.FC = () => {
    const energyError = useStore(state => state.energyError);
    const isIntegrating = useStore(state => state.isIntegrating);

    if (energyError === null || isIntegrating) return null;

    // Thresholds (Fractional Error)
    // < 1e-9: Excellent (Green)
    // < 1e-5: Warning (Yellow)
    // > 1e-5: Bad (Red)

    let color = '#24a148'; // Green 50
    let icon = <CheckmarkFilled size={16} fill={color} />;
    let status = "Conservation Excellent";

    if (energyError > 1e-5) {
        color = '#da1e28'; // Red 60
        icon = <ErrorFilled size={16} fill={color} />;
        status = "Physics Broken (Timestep too large)";
    } else if (energyError > 1e-9) {
        color = '#f1c21b'; // Yellow 20
        icon = <WarningFilled size={16} fill={color} />;
        status = "Drifting (Acceptable)";
    }

    // Format scientific notation delicately
    const errorStr = energyError.toExponential(1); 

    return (
        <div className="gala-glass" style={{
            position: 'relative',
            width: '100%',
            marginTop: '1rem',
            marginBottom: '1rem',
            zIndex: 900,
            border: `1px solid ${color}`, // Dynamic border overrides glass
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            color: '#f4f4f4',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon}
                <span style={{ fontWeight: 600 }}>ΔE/E:</span>
                <span style={{ color: color }}>{errorStr}</span>
            </div>

            <PortalTooltip content={
                <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{status}</p>
                    <p>Energy conservation error.</p>
                    <p>Lower is better.</p>
                    <div style={{ marginTop: '8px', fontSize: '10px', color: '#8d8d8d' }}>
                        <div>&lt; 1e-9: Excellent</div>
                        <div>&lt; 1e-5: Acceptable</div>
                        <div>&gt; 1e-5: Reduce Timestep</div>
                    </div>
                </div>
            }>
                <button style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#8d8d8d',
                    display: 'flex',
                    padding: 0
                }}>
                    <Information size={16} />
                </button>
            </PortalTooltip>
        </div>
    );
};
