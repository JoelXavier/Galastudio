import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/simulationStore';
import { Button, NumberInput, Modal } from '@carbon/react';
import { Add, TrashCan } from '@carbon/icons-react';

interface Keyframe {
    id: string;
    time: number;  // Gyr
    mass: number;  // 10^10 Msun (galactic) or Msun (solar)
    disk_scale: number;  // kpc or AU
}

export const TimelineEditor: React.FC = () => {
    const units = useStore(state => state.units);
    const potentialParams = useStore(state => state.potentialParams);
    const potentialType = useStore(state => state.potentialType);
    
    // Controlled by Global Store
    const isTimelineOpen = useStore(state => state.isTimelineOpen);
    const setTimelineOpen = useStore(state => state.setTimelineOpen);
    
    const [keyframes, setKeyframes] = useState<Keyframe[]>([
        { id: '1', time: 0.0, mass: 1.0, disk_scale: 3.0 },
        { id: '2', time: 10.0, mass: 1.5, disk_scale: 4.0 }
    ]);
    const [selectedKeyframe, setSelectedKeyframe] = useState<string | null>(null);
    const [isIntegrating, setIsIntegrating] = useState(false);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const timeUnit = units === 'galactic' ? 'Gyr' : 'yr';
    const massUnit = units === 'galactic' ? '×10¹⁰ M☉' : 'M☉';
    const scaleUnit = units === 'galactic' ? 'kpc' : 'AU';

    const closeModal = () => setTimelineOpen(false);

    const addKeyframe = () => {
        const maxTime = Math.max(...keyframes.map(kf => kf.time));
        const newKf: Keyframe = {
            id: Date.now().toString(),
            time: maxTime + 5.0,
            mass: keyframes[keyframes.length - 1].mass,
            disk_scale: keyframes[keyframes.length - 1].disk_scale
        };
        setKeyframes([...keyframes, newKf].sort((a, b) => a.time - b.time));
    };

    const deleteKeyframe = (id: string) => {
        if (keyframes.length <= 2) {
            alert('Must have at least 2 keyframes');
            return;
        }
        setKeyframes(keyframes.filter(kf => kf.id !== id));
        if (selectedKeyframe === id) setSelectedKeyframe(null);
    };

    const updateKeyframe = (id: string, field: keyof Keyframe, value: number) => {
        setKeyframes(keyframes.map(kf => 
            kf.id === id ? { ...kf, [field]: value } : kf
        ).sort((a, b) => a.time - b.time));
    };

    const handleMarkerDragStart = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDraggingId(id);
        setSelectedKeyframe(id);
    };

    const handleMarkerDrag = (e: React.MouseEvent) => {
        if (!draggingId || !timelineRef.current) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - 16; // Account for padding
        const percentage = Math.max(0, Math.min(1, x / (rect.width - 32)));
        const maxTime = Math.max(...keyframes.map(kf => kf.time), 10);
        const newTime = percentage * maxTime;
        
        updateKeyframe(draggingId, 'time', Math.max(0, newTime));
    };

    const handleMarkerDragEnd = () => {
        setDraggingId(null);
    };

    useEffect(() => {
        if (draggingId) {
            const handleMouseMove = (e: MouseEvent) => handleMarkerDrag(e as any);
            const handleMouseUp = () => handleMarkerDragEnd();
            
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingId]);

    const runEvolution = async () => {
        setIsIntegrating(true);
        try {
            const body = {
                x: potentialParams.x,
                y: potentialParams.y,
                z: potentialParams.z,
                vx: potentialParams.vx,
                vy: potentialParams.vy,
                vz: potentialParams.vz,
                time_step: potentialParams.time_step,
                steps: 2000,
                units: units,
                potential_type: potentialType,
                keyframes: keyframes.map(kf => ({
                    time: kf.time,
                    mass: units === 'galactic' ? kf.mass * 1.0e10 : kf.mass,
                    disk_scale: kf.disk_scale
                }))
            };

            const response = await fetch('/integrate_evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                const times = keyframes.map(kf => kf.time).sort((a, b) => a - b);
                
                useStore.setState({
                    points: data.points,
                    velocities: data.velocities,
                    energyError: data.energy_error,
                    evolutionMetadata: {
                        totalTime: data.total_time,
                        keyframeCount: keyframes.length,
                        timeRange: [times[0], times[times.length - 1]]
                    },
                    successMsg: `Evolution Complete! Total time: ${data.total_time.toFixed(1)} ${timeUnit}`
                });
                
                setTimeout(() => {
                    closeModal();
                }, 800);
            } else {
                useStore.setState({
                    error: `Evolution failed: ${data.message}`
                });
            }
        } catch (err: any) {
            console.error(err);
            useStore.setState({
                error: `Network error: ${err.message}`
            });
        } finally {
            setIsIntegrating(false);
        }
    };

    const maxTime = Math.max(...keyframes.map(kf => kf.time), 10);

    return (
        <Modal
            open={isTimelineOpen}
            onRequestClose={closeModal}
            modalHeading="Time-Machine Editor: Adiabatic Evolution"
            modalLabel="Run an evolution."
            primaryButtonText={isIntegrating ? "Computing..." : "Run Evolution"}
            secondaryButtonText="Cancel"
            onRequestSubmit={runEvolution}
            onSecondarySubmit={closeModal}
            primaryButtonDisabled={isIntegrating || keyframes.length < 2}
            size="lg"
        >
            <div style={{ padding: '1rem 0' }}>
                <p style={{ marginBottom: '1rem', color: '#c6c6c6', fontSize: '14px' }}>
                    Define keyframes to simulate how the orbit evolves as the galaxy changes over cosmic time.
                    The potential will smoothly interpolate between keyframes.
                </p>

                {/* Timeline Visualization */}
                <div 
                    ref={timelineRef}
                    style={{ 
                        background: '#262626', 
                        padding: '2rem 1rem', 
                        borderRadius: '4px',
                        marginBottom: '1.5rem',
                        position: 'relative',
                        height: '100px'
                    }}
                >
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '10px', 
                        left: '1rem', 
                        right: '1rem', 
                        height: '2px', 
                        background: '#525252' 
                    }} />
                    
                    {keyframes.map(kf => {
                        const position = (kf.time / maxTime) * 100;
                        const isSelected = selectedKeyframe === kf.id;
                        const isDragging = draggingId === kf.id;
                        
                        return (
                            <div
                                key={kf.id}
                                onClick={() => setSelectedKeyframe(kf.id)}
                                onMouseDown={(e) => handleMarkerDragStart(e, kf.id)}
                                style={{
                                    position: 'absolute',
                                    left: `calc(${position}% + 1rem)`,
                                    bottom: '0px',
                                    transform: 'translateX(-50%)',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    transition: isDragging ? 'none' : 'all 0.2s',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '40px',
                                    background: isSelected ? '#33b1ff' : '#8d8d8d',
                                    borderRadius: '2px 2px 0 0',
                                    border: isSelected ? '2px solid #33b1ff' : 'none'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '10px',
                                    color: isSelected ? '#33b1ff' : '#8d8d8d',
                                    whiteSpace: 'nowrap',
                                    fontWeight: isSelected ? 600 : 400
                                }}>
                                    {kf.time.toFixed(1)} {timeUnit}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Keyframe List */}
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Keyframes</h5>
                        <Button 
                            kind="ghost" 
                            size="sm" 
                            renderIcon={Add}
                            onClick={addKeyframe}
                        >
                            Add Keyframe
                        </Button>
                    </div>

                    {keyframes.map(kf => (
                        <div 
                            key={kf.id}
                            style={{
                                background: selectedKeyframe === kf.id ? '#393939' : '#262626',
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '4px',
                                border: selectedKeyframe === kf.id ? '1px solid #33b1ff' : '1px solid #393939',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedKeyframe(kf.id)}
                        >
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <NumberInput
                                        id={`time-${kf.id}`}
                                        label={`Time (${timeUnit})`}
                                        value={kf.time}
                                        onChange={(e: any) => updateKeyframe(kf.id, 'time', Number(e.target.value))}
                                        min={0}
                                        step={0.1}
                                        size="sm"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <NumberInput
                                        id={`mass-${kf.id}`}
                                        label={`Mass (${massUnit})`}
                                        value={kf.mass}
                                        onChange={(e: any) => updateKeyframe(kf.id, 'mass', Number(e.target.value))}
                                        min={0.1}
                                        step={0.1}
                                        size="sm"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <NumberInput
                                        id={`scale-${kf.id}`}
                                        label={`Disk Scale (${scaleUnit})`}
                                        value={kf.disk_scale}
                                        onChange={(e: any) => updateKeyframe(kf.id, 'disk_scale', Number(e.target.value))}
                                        min={0.1}
                                        step={0.1}
                                        size="sm"
                                    />
                                </div>
                                <Button
                                    kind="danger--ghost"
                                    size="sm"
                                    renderIcon={TrashCan}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteKeyframe(kf.id);
                                    }}
                                    hasIconOnly
                                    iconDescription="Delete keyframe"
                                    disabled={keyframes.length <= 2}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ 
                    background: '#161616', 
                    padding: '0.75rem', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#8d8d8d'
                }}>
                    <strong style={{ color: '#f4f4f4' }}>Tip:</strong> Start with 2 keyframes (initial + final state). 
                    The orbit will evolve as the potential smoothly transitions between them. 
                </div>
            </div>
        </Modal>
    );
};
