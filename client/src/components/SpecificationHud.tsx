import React from 'react';
import { useStore } from '../store/simulationStore';
import { SettingsAdjust } from '@carbon/icons-react';

export const SpecificationHud: React.FC = () => {
    const potentialType = useStore(state => state.potentialType);
    const integrator = useStore(state => state.integrator);
    const units = useStore(state => state.units);
    const params = useStore(state => state.potentialParams);
    const viewMode = useStore(state => state.viewMode);

    if (viewMode !== 'editor') return null;

    // Helper for scientific notation
    const fmt = (n: number) => n.toExponential(2);

    return (
        <div style={{
            height: '100%',
            fontFamily: "'IBM Plex Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '24px',
            width: '100%',
            boxSizing: 'border-box'
        }}>
            {/* Top Bar: System Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: '#1a1a1a', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#8d8d8d', marginBottom: '4px', letterSpacing: '0.5px' }}>POTENTIAL</div>
                    <div style={{ fontSize: '12px', color: '#f4f4f4', fontWeight: 600, textTransform: 'uppercase' }}>{potentialType}</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#8d8d8d', marginBottom: '4px', letterSpacing: '0.5px' }}>INTEGRATOR</div>
                    <div style={{ fontSize: '12px', color: '#f4f4f4', fontWeight: 600, textTransform: 'uppercase' }}>{integrator}</div>
                </div>
                <div style={{ background: '#1a1a1a', padding: '12px' }}>
                    <div style={{ fontSize: '9px', color: '#8d8d8d', marginBottom: '4px', letterSpacing: '0.5px' }}>UNITS</div>
                    <div style={{ fontSize: '12px', color: '#f4f4f4', fontWeight: 600, textTransform: 'uppercase' }}>{units}</div>
                </div>
            </div>

            {/* Main Data Section: Physical Parameters */}
            <div className="gala-glass" style={{ 
                flex: 1,
                padding: '16px', 
                background: 'rgba(22, 22, 22, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#A56EFF', marginBottom: '12px', letterSpacing: '1px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#A56EFF' }} />
                        PHYSICAL STATE VECTOR
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                        {/* Column 1: Config */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: '#6f6f6f' }}>MASS</span>
                                <span style={{ color: '#e0e0e0' }}>{fmt(params.mass)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                <span style={{ color: '#6f6f6f' }}>T-STEP</span>
                                <span style={{ color: '#e0e0e0' }}>{fmt(params.time_step)}</span>
                            </div>
                        </div>
                        {/* Column 2: Status */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderLeft: '1px solid rgba(165, 110, 255, 0.4)', paddingLeft: '12px' }}>
                                <span style={{ color: '#6f6f6f' }}>ENERGY</span>
                                <span style={{ color: '#24a148', fontWeight: 600 }}>NOMINAL</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderLeft: '1px solid rgba(165, 110, 255, 0.4)', paddingLeft: '12px' }}>
                                <span style={{ color: '#6f6f6f' }}>SAMP-F</span>
                                <span style={{ color: '#e0e0e0' }}>1.2k Hz</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-section: Kinematics */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <div style={{ fontSize: '9px', color: '#8d8d8d', marginBottom: '4px' }}>POSITION (X,Y,Z)</div>
                             <div style={{ fontSize: '11px', color: '#f4f4f4', display: 'flex', gap: '8px' }}>
                                 <span>{fmt(params.x)}</span>
                                 <span>{fmt(params.y)}</span>
                                 <span>{fmt(params.z)}</span>
                             </div>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <div style={{ fontSize: '9px', color: '#8d8d8d', marginBottom: '4px' }}>VELOCITY (VX,VY,VZ)</div>
                             <div style={{ fontSize: '11px', color: '#e0e0e0', display: 'flex', gap: '8px' }}>
                                 <span>{fmt(params.vx)}</span>
                                 <span>{fmt(params.vy)}</span>
                                 <span>{fmt(params.vz)}</span>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Simulation Event Feed */}
                <div style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                    paddingTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flex: 1,
                    minHeight: 0 // Allow container to shrink
                }}>
                    <div style={{ fontSize: '9px', color: '#8d8d8d', letterSpacing: '1px' }}>SIMULATION EVENT FEED</div>
                    <div 
                        style={{ 
                            flex: 1, 
                            background: 'rgba(0,0,0,0.2)', 
                            borderRadius: '2px', 
                            padding: '8px',
                            fontFamily: 'IBM Plex Mono, monospace',
                            fontSize: '10px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            border: '1px solid rgba(255,255,255,0.03)'
                        }}
                        ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
                    >
                        {useStore.getState().logs.map(log => (
                            <div key={log.id} style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#525252', minWidth: '65px' }}>[{log.timestamp}]</span>
                                <span style={{ 
                                    color: log.type === 'success' ? '#24a148' : log.type === 'warn' ? '#f1c21b' : '#e0e0e0' 
                                }}>
                                    {log.type === 'warn' ? '!' : '>'} {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div style={{ 
                padding: '12px', 
                background: 'linear-gradient(90deg, rgba(165, 110, 255, 0.1) 0%, transparent 100%)',
                borderLeft: '2px solid #A56EFF',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: 'auto'
            }}>
                <SettingsAdjust size={16} fill="#A56EFF" style={{ filter: 'drop-shadow(0 0 5px #A56EFF)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#f4f4f4', fontWeight: 600, letterSpacing: '0.5px' }}>ACTIVE DYNAMICS TUNING</span>
                    <span style={{ fontSize: '8px', color: '#8d8d8d', textTransform: 'uppercase' }}>Awaiting parameter commit...</span>
                </div>
            </div>
        </div>
    );
};
