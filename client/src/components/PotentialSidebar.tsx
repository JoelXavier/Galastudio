import React from 'react';
import { 
    SideNav, 
    SideNavItems, 
    Slider,
    Button,
    Toggle,
    Select,
    SelectItem,
    Tag,
    Accordion,
    AccordionItem 
} from '@carbon/react';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/simulationStore';
import { Code, Activity, Information, Time, Locked, Unlocked, Reset, Rocket } from '@carbon/icons-react';
import { TrustMeter } from './TrustMeter';



// Custom Portal Tooltip to guarantee escape from Stacking Contexts
export const PortalTooltip: React.FC<{ 
    content: React.ReactNode; 
    children: React.ReactElement;
}> = ({ content, children }) => {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling
        if (!show && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({
                top: rect.top + (rect.height / 2),
                left: rect.right + 12 // 12px gap
            });
            setShow(true);
        } else {
            setShow(false);
        }
    };

    // Close on global click
    useEffect(() => {
        const handleClickOutside = () => setShow(false);
        if (show) window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [show]);

    const tooltipNode = show ? createPortal(
        <div 
            className="portal-tooltip"
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                transform: 'translateY(-50%)', // Center vertically
                background: 'var(--gala-glass-bg)',
                color: '#f4f4f4',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                zIndex: 10001, // Beat specific Carbon modals
                pointerEvents: 'none',
                maxWidth: '250px',
                fontSize: '12px',
                lineHeight: '1.4',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                border: 'var(--gala-glass-border)',
                backdropFilter: 'blur(10px)',
                width: 'max-content'
            }}
            onClick={(e) => e.stopPropagation()} // Allow clicking inside
        >
            {/* Cleaner look: No triangle arrows */}
            {content}
        </div>,
        document.body
    ) : null;

    return (
        <>
            <div 
                ref={triggerRef as unknown as React.RefObject<HTMLDivElement>} 
                onClick={toggle} 
                className="portal-trigger" 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
                {children}
            </div>
            {tooltipNode}
        </>
    );
};

// Reusable Label Component 
const InfoLabel: React.FC<{ label: string; tooltip: React.ReactNode }> = ({ label, tooltip }) => {
    return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '4px' 
        }}>
            <span className="cds--label" style={{ margin: 0, padding: 0, lineHeight: 1 }}>
                {label}
            </span>
            <PortalTooltip content={tooltip}>
                <button type="button" style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    padding: 0, 
                    display: 'flex', 
                    alignItems: 'center',
                    color: '#f4f4f4'
                }}>
                    <Information size={16} />
                </button>
            </PortalTooltip>
        </div>
    );
};

// Optimized "Glass" Slider with Custom Input (No default Carbon underline)
const PremiumSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    unit?: string;
    onChange: (val: number) => void;
}> = ({ label, value, min, max, step, onChange }) => {
    const [localVal, setLocalVal] = useState(value);

    // Sync when store value changes (e.g. from animation or reset)
    useEffect(() => {
        setLocalVal(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = parseFloat(e.target.value);
        setLocalVal(newVal);
        if (!isNaN(newVal)) {
            onChange(newVal);
        }
    };

    return (
        <div style={{
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '6px',
            marginBottom: '4px' // Gap managed by parent flex
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#c6c6c6', fontWeight: 500 }}>{label}</span>
                
                {/* Custom Number Input */}
                <input
                    type="number"
                    value={localVal}
                    step={step}
                    onChange={handleChange}
                    style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        color: '#f4f4f4',
                        fontSize: '12px',
                        padding: '4px 8px',
                        width: '4rem', // Fixed width to prevent jumping
                        textAlign: 'right',
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            <div className="premium-slider-wrapper">
                <Slider
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => onChange(e.value)}
                    hideTextInput={true}
                    labelText="" // Hidden, using custom label
                />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#525252', marginTop: '-4px', paddingLeft: '8px', paddingRight: '12px' }}>
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

export const PotentialSidebar: React.FC = () => {
    // Store State
    const expandedPanel = useStore(state => state.expandedPanel);
    const params = useStore(state => state.potentialParams);
    const setParams = useStore(state => state.setPotentialParams);
    const setPotentialType = useStore(state => state.setPotentialType);
    const analyzeChaos = useStore(state => state.analyzeChaos);
    const chaosData = useStore(state => state.chaosData);
    const isAnalyzing = useStore(state => state.isAnalyzing);
    const units = useStore(state => state.units);
    const setUnits = useStore(state => state.setUnits);
    const timeDirection = useStore(state => state.timeDirection);
    const setTimeDirection = useStore(state => state.setTimeDirection);
    const integrator = useStore(state => state.integrator);
    const setIntegrator = useStore(state => state.setIntegrator);
    const lockGhostTrace = useStore(state => state.lockGhostTrace);
    const clearGhostTrace = useStore(state => state.clearGhostTrace);
    const ghostPoints = useStore(state => state.ghostPoints);
    const isDirty = useStore(state => state.isDirty);
    const isIntegrating = useStore(state => state.isIntegrating);
    const integrateOrbit = useStore(state => state.integrateOrbit);
    
    // Auto-start simulation on mount (Restoring lost functionality)
    useEffect(() => {
        // slight delay to ensure everything is mounted
        setTimeout(() => {
             useStore.getState().integrateOrbit();
        }, 100);
    }, []);

    const handleParamChange = (key: keyof typeof params, value: number) => {
        setParams({ [key]: value });
    };



    // Configuration for Sliders based on Scale
    const config = units === 'galactic' ? {
        mass: { min: 0.1, max: 10.0, step: 0.1, label: 'Mass (10¹⁰ M☉)' },
        dist: { min: -20, max: 20, step: 0.1, label: 'Position (kpc)' },
        vel: { min: -500, max: 500, step: 10, label: 'Velocity (km/s)' },
        time: { min: 0.1, max: 10.0, step: 0.1, label: 'Time Step (Myr)' },
        vel_input: { min: -500, max: 500, step: 10 } // Fallback for types
    } : {
        mass: { min: 0.1, max: 5.0, step: 0.1, label: 'Mass (M☉)' },
        dist: { min: -50, max: 50, step: 0.5, label: 'Position (AU)' }, 
        vel: { min: -100, max: 100, step: 1, label: 'Velocity (km/s)' }, 
        time: { min: 0.01, max: 1.0, step: 0.01, label: 'Time Step (yr)' },
        vel_input: { min: -20, max: 20, step: 0.1 } 
    };




    return (
        <SideNav 
            isFixedNav 
            expanded={true} 
            isChildOfHeader={false} 
            aria-label="Simulation Controls"
            className="potential-sidebar gala-glass"
            style={{ 
                 width: expandedPanel ? '0' : '280px', 
                 visibility: expandedPanel ? 'hidden' : 'visible',
                 top: '3rem', 
                 height: 'calc(100vh - 3rem)',
                 borderRight: '1px solid rgba(255, 255, 255, 0.05)',
                 display: 'flex',
                 flexDirection: 'column',
                 transition: 'width 0.3s ease, visibility 0.3s ease'
            }}
        >
            <SideNavItems>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    {/* Scrollable Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    
                    {/* Header: Potential Composer */}
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                         <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                             Potential Composer
                         </h2>
                    </div>

                    {/* Unit System & Chaos Cloud Row */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                         <div style={{ flex: 1 }}>
                             <InfoLabel label="Unit System" tooltip="Switch between Galactic (kpc, Myr) and Solar System (AU, yr)." />
                             <Toggle
                                 id="unit-toggle"
                                 labelA="Galactic"
                                 labelB="Solar"
                                 toggled={units === 'solarsystem'}
                                 onToggle={(checked) => setUnits(checked ? 'solarsystem' : 'galactic')}
                                 size="sm"
                                 labelText=""
                             />
                         </div>
                         <div style={{ flex: 1 }}>
                             <InfoLabel label="Chaos Cloud" tooltip="Spray model: Spawn perturbation ensemble to detect orbital divergence." />
                             <Toggle
                                 id="cloud-mode-toggle"
                                 labelA="Off"
                                 labelB="On"
                                 toggled={useStore(state => state.isCloudMode)}
                                 onToggle={(checked) => useStore.getState().setCloudMode(checked)}
                                 size="sm"
                                 labelText=""
                             />
                         </div>
                    </div>

                    {/* Observer Perspective Toggle */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoLabel label="Observer Perspective" tooltip="Gaia-Link: Project 3D orbit onto Observer's sky plane." />
                        <Toggle
                            id="observer-mode-toggle"
                            labelA="External View"
                            labelB="Earth View"
                            toggled={useStore(state => state.isObserverMode)}
                            onToggle={(checked) => useStore.getState().setObserverMode(checked)}
                            size="sm"
                            labelText=""
                        />
                    </div>

                    {/* Time Direction Toggle */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoLabel label="Time Direction" tooltip="Integrate orbit backwards in time." />
                        <Toggle
                            id="time-dir-toggle"
                            labelA="Backward"
                            labelB="Forward"
                            toggled={timeDirection === 'forward'}
                            onToggle={(checked) => setTimeDirection(checked ? 'forward' : 'backward')}
                            size="sm"
                            labelText=""
                        />
                    </div>

                    {/* Ghost Trace (A/B Test) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoLabel label="Ghost Trace (A/B Test)" tooltip="Lock current orbit as a reference to compare with parameter changes." />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                size="sm" 
                                kind="ghost" 
                                onClick={lockGhostTrace}
                                renderIcon={ghostPoints ? Locked : Unlocked}
                                style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f4' }}
                            >
                                {ghostPoints ? 'Locked' : 'Lock'}
                            </Button>
                            <Button 
                                size="sm" 
                                kind="ghost" 
                                onClick={clearGhostTrace}
                                renderIcon={Reset}
                                disabled={!ghostPoints}
                                style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', color: '#f4f4f4' }}
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Gravitational Potential Select */}
                    <div style={{ marginBottom: '1.5rem' }}>
                         <InfoLabel 
                             label="Gravitational Potential" 
                             tooltip="Choose a predefined potential model."
                         />
                         <Select 
                             id="potential-select" 
                             value={useStore(state => state.potentialType)}
                             labelText="" 
                             size="sm"
                             onChange={(e) => setPotentialType(e.target.value as 'milkyway' | 'kepler' | 'hernquist')}
                         >
                            <SelectItem value="kepler" text="Kepler (Point Mass)" />
                            <SelectItem value="milkyway" text="Milky Way" />
                            <SelectItem value="hernquist" text="Hernquist Sphere" />
                         </Select>

                         {/* Restored Hernquist Scenario Selector */}
                         {useStore.getState().potentialType === 'hernquist' && (
                             <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '1px solid rgba(165, 110, 255, 0.3)', borderRadius: '4px', background: 'rgba(165, 110, 255, 0.05)' }}>
                                 <InfoLabel label="Scenario Type" tooltip="Rapid-load preset dynamics for the Hernquist model." />
                                 <Select
                                     id="hernquist-scenario"
                                     labelText=""
                                     size="sm"
                                     onChange={(e) => {
                                         if (e.target.value === 'solar') {
                                             setUnits('solarsystem');
                                         } else if (e.target.value === 'chaotic') {
                                             useStore.getState().setCloudMode(true);
                                         }
                                     }}
                                 >
                                     <SelectItem value="default" text="Select Scenario..." />
                                     <SelectItem value="solar" text="Solar Scale" />
                                     <SelectItem value="chaotic" text="Chaotic Dynamics" />
                                 </Select>
                             </div>
                         )}
                    </div>

                    {/* Integrator Select */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfoLabel label="Integrator Engine" tooltip="Numerical method used for trajectory calculation." />
                        <Select 
                            id="integrator-select" 
                            value={integrator}
                            labelText="" 
                            size="sm" 
                            onChange={(e) => setIntegrator(e.target.value as 'leapfrog' | 'dop853' | 'ruth4')}
                        >
                            <SelectItem value="leapfrog" text="Leapfrog (Fast)" />
                            <SelectItem value="dop853" text="DOP853 (Precise)" />
                            <SelectItem value="ruth4" text="Ruth4 (Symplectic)" />
                        </Select>
                    </div>

                    {/* Accordion Setup */}
                    <Accordion align="end" size="sm">
                        
                        {/* 1. Potential Properties */}
                        <AccordionItem title="POTENTIAL PROPERTIES">
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                 {/* Mass */}
                                <PremiumSlider
                                    label={config.mass.label}
                                    value={params.mass}
                                    min={config.mass.min}
                                    max={config.mass.max}
                                    step={config.mass.step}
                                    onChange={(v) => handleParamChange('mass', v)}
                                />

                                {/* Position Sliders */}
                                <PremiumSlider
                                    label={`${config.dist.label} X`}
                                    value={params.x}
                                    min={config.dist.min}
                                    max={config.dist.max}
                                    step={config.dist.step}
                                    onChange={(v) => handleParamChange('x', v)}
                                />
                                <PremiumSlider
                                    label={`${config.dist.label} Y`}
                                    value={params.y}
                                    min={config.dist.min}
                                    max={config.dist.max}
                                    step={config.dist.step}
                                    onChange={(v) => handleParamChange('y', v)}
                                />
                                <PremiumSlider
                                    label={`${config.dist.label} Z`}
                                    value={params.z}
                                    min={config.dist.min}
                                    max={config.dist.max}
                                    step={config.dist.step}
                                    onChange={(v) => handleParamChange('z', v)}
                                />
                             </div>
                        </AccordionItem>

                        {/* 2. Kinematics (Velocity) */}
                        <AccordionItem title="KINEMATICS">
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <PremiumSlider
                                    label={`VX (${units === 'solarsystem' ? 'km/s' : 'km/s'})`}
                                    value={params.vx}
                                    min={units === 'solarsystem' ? config.vel_input.min : config.vel.min}
                                    max={units === 'solarsystem' ? config.vel_input.max : config.vel.max}
                                    step={units === 'solarsystem' ? config.vel_input.step : config.vel.step}
                                    onChange={(v) => handleParamChange('vx', v)}
                                />
                                <PremiumSlider
                                    label={`VY (${units === 'solarsystem' ? 'km/s' : 'km/s'})`}
                                    value={params.vy}
                                    min={units === 'solarsystem' ? config.vel_input.min : config.vel.min}
                                    max={units === 'solarsystem' ? config.vel_input.max : config.vel.max}
                                    step={units === 'solarsystem' ? config.vel_input.step : config.vel.step}
                                    onChange={(v) => handleParamChange('vy', v)}
                                />
                                <PremiumSlider
                                    label={`VZ (${units === 'solarsystem' ? 'km/s' : 'km/s'})`}
                                    value={params.vz}
                                    min={units === 'solarsystem' ? config.vel_input.min : config.vel.min}
                                    max={units === 'solarsystem' ? config.vel_input.max : config.vel.max}
                                    step={units === 'solarsystem' ? config.vel_input.step : config.vel.step}
                                    onChange={(v) => handleParamChange('vz', v)}
                                />
                             </div>
                        </AccordionItem>

                        {/* 3. Simulation Settings (Time Step) */}
                        <AccordionItem title="SIMULATION SETTINGS">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <PremiumSlider
                                    label={config.time.label}
                                    value={params.time_step}
                                    min={config.time.min}
                                    max={config.time.max}
                                    step={config.time.step}
                                    onChange={(v) => handleParamChange('time_step', v)}
                                />
                            </div>
                        </AccordionItem>
                    </Accordion>
                    </div>

                    <div style={{ 
                        padding: '1rem', 
                        paddingBottom: '2.5rem', 
                        borderTop: 'var(--gala-glass-border)', 
                        background: 'rgba(22, 22, 22, 0.6)', 
                        backdropFilter: 'blur(10px)',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                          <Button 
                             kind={isDirty ? "primary" : "tertiary"} 
                             renderIcon={Rocket} 
                             onClick={() => integrateOrbit()}
                             disabled={isIntegrating}
                             size="md"
                             style={{ 
                                 width: '100%',
                                 border: isDirty ? '1px solid var(--cds-interactive-01)' : '1px solid rgba(255,255,255,0.1)',
                                 boxShadow: isDirty ? '0 0 15px rgba(15, 98, 254, 0.4)' : 'none',
                                 animation: isDirty ? 'pulse-blue 2s infinite' : 'none',
                                 marginBottom: '4px'
                             }}
                          >
                              {isIntegrating ? "Computing..." : "Apply changes"}
                          </Button>

                          <Button 
                             kind="tertiary" 
                             renderIcon={Activity} 
                             onClick={analyzeChaos}
                             disabled={isAnalyzing}
                             size="md"
                             style={{ width: '100%' }}
                          >
                              {isAnalyzing ? "Computing..." : "Analyze Chaos"}
                          </Button>

                         {chaosData && (
                            <div style={{ textAlign: 'center' }}>
                                <Tag type={chaosData.isChaotic ? "red" : "green"}>
                                    {chaosData.isChaotic ? "Chaotic" : "Regular"}
                                </Tag>
                                <div style={{ fontSize: '10px', color: '#8d8d8d', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    Lyapunov Time: {chaosData.lyapunovTime.toFixed(1)} {units === 'galactic' ? 'Myr' : 'yr'}
                                    <PortalTooltip content={
                                        <div>
                                            <p className="font-mono">LYAPUNOV METRIC</p>
                                            <p>Characteristic timescale of divergence.</p>
                                            <p>Short = Chaos. Long = Stability.</p>
                                        </div>
                                    }>
                                        <button type="button" style={{ 
                                            border: 'none', 
                                            background: 'transparent', 
                                            padding: 0, 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: '#8d8d8d'
                                        }}>
                                            <Information size={12}/>
                                        </button>
                                    </PortalTooltip>
                                </div>
                            </div>
                         )}

                          
                          <Button
                              kind="tertiary"
                              renderIcon={Time}
                              onClick={() => useStore.getState().setTimelineOpen(true)}
                              size="md"
                              style={{ width: '100%' }}
                          >
                              Time-Machine Editor
                          </Button>

                          <Button 
                             kind="tertiary" 
                             renderIcon={Code} 
                             onClick={() => useStore.getState().setDataModalOpen(true)}
                             size="md"
                             style={{ width: '100%' }}
                          >
                               Export Code
                          </Button>

                          <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                              <TrustMeter />
                          </div>
                     </div>
                     
                     {/* No local ExportModal here, it is lifted to App.tsx */}
                 </div>
            </SideNavItems>
         </SideNav>
     );
 };
