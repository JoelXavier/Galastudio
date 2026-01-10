import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@carbon/react';
import { ArrowRight, CheckmarkFilled, Map, Chemistry, ChartScatter, Code } from '@carbon/icons-react';

export const TutorialOverlay: React.FC = () => {
    const [step, setStep] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(() => {
        // Lazy initialization to avoid useEffect state update
        return !localStorage.getItem('galastudio_tutorial_seen');
    });

    useEffect(() => {
        // Effect only handles side effects now if needed, or can be removed if strictly for init
    }, []);

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('galastudio_tutorial_seen', 'true');
    };

    const steps = [
        {
            title: "Welcome to GalaStudio",
            content: "You have entered a high-performance gravitational dynamics lab. Here, you can simulate and analyze the motion of stars in complex galactic potentials.",
            icon: <Chemistry size={64} style={{ marginBottom: '1rem', fill: '#0f62fe' }} />
        },
        {
            title: "The Laboratory (Canvas)",
            content: "The central view is your 3D workspace. Click anywhere on the grid to instantly launch a star from that position. Visualize its orbit in real-time.",
            icon: <Map size={64} style={{ marginBottom: '1rem', fill: '#a0a0a0' }} />
        },
        {
            title: "The Controls (Sidebar)",
            content: "Use the left panel to define the physics. Tune mass, velocity, and time steps. Switch between 'Kepler' (Simple) and 'Milky Way' (Complex) potentials.",
            icon: <Chemistry size={64} style={{ marginBottom: '1rem', fill: '#a0a0a0' }} />
        },
        {
            title: "Advanced Analysis",
            content: "GalaStudio is more than a toy. Use 'Analyze Chaos' to compute Lyapunov exponents and the Phase Space panel (bottom-right) to study orbital energy.",
            icon: <ChartScatter size={64} style={{ marginBottom: '1rem', fill: '#a0a0a0' }} />
        },
        {
            title: "Reproducibility",
            content: "Done with your experiment? Click 'Export Code' to generate a standalone Python script using the 'gala' library that reproduces your exact simulation.",
            icon: <Code size={64} style={{ marginBottom: '1rem', fill: '#42be65' }} />
        }
    ];

    if (!isOpen) return null;

    return (
        <Modal
            open={isOpen}
            modalHeading=""
            passiveModal={false}
            onRequestClose={handleClose}
            size="sm"
            preventCloseOnClickOutside
        >
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {steps[step].icon}
                <h3 style={{ marginBottom: '1rem', color: '#f4f4f4' }}>{steps[step].title}</h3>
                <p style={{ marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.5', color: '#c6c6c6' }}>
                    {steps[step].content}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {step < 4 ? (
                        <Button renderIcon={ArrowRight} onClick={handleNext}>Next ({step + 1}/5)</Button>
                    ) : (
                        <Button renderIcon={CheckmarkFilled} kind="primary" onClick={handleClose}>Get Started</Button>
                    )}
                </div>
                
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: i === step ? '#0f62fe' : '#393939' 
                            }} 
                        />
                    ))}
                </div>
            </div>
        </Modal>
    );
};
