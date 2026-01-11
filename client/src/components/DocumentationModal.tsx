import React, { useState } from 'react';
import { useStore } from '../store/simulationStore';
import { Close, Bee, DataVis_2, Rocket, Code, Laptop } from '@carbon/icons-react';

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: React.ComponentType<{ size?: number; fill?: string }> }) => (
    <h3 style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        color: '#f4f4f4', 
        marginTop: '2rem', 
        marginBottom: '1rem',
        fontSize: '1.2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0.5rem'
    }}>
        {Icon && <Icon size={20} fill="#A56EFF" />}
        {children}
    </h3>
);

const FeatureCard = ({ title, desc }: { title: string, desc: string }) => (
    <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '0.5rem'
    }}>
        <strong style={{ color: '#A56EFF', display: 'block', marginBottom: '0.25rem' }}>{title}</strong>
        <span style={{ fontSize: '0.9rem', color: '#c6c6c6', lineHeight: '1.4' }}>{desc}</span>
    </div>
);

export const DocumentationModal = () => {
    const isDocsOpen = useStore(state => state.isDocsOpen);
    const setDocsOpen = useStore(state => state.setDocsOpen);
    const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'install'>('overview');

    if (!isDocsOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }} onClick={() => setDocsOpen(false)}>
            <div style={{
                width: '900px',
                height: '85vh',
                background: 'rgba(22, 22, 22, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(90deg, rgba(30,30,30,0) 0%, rgba(165, 110, 255, 0.05) 100%)'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 300, letterSpacing: '1px' }}>
                            GALA <span style={{ fontWeight: 600, color: '#A56EFF' }}>STUDIO</span>
                        </h2>
                        <span style={{ fontSize: '0.8rem', color: '#8d8d8d', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Manual & Technical Specification
                        </span>
                    </div>
                    <Close size={24} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setDocsOpen(false)} />
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <button 
                        onClick={() => setActiveTab('overview')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'overview' ? 'rgba(165, 110, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'overview' ? '#A56EFF' : '#8d8d8d',
                            borderBottom: activeTab === 'overview' ? '2px solid #A56EFF' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>Overview & Vision</button>
                    <button 
                        onClick={() => setActiveTab('tech')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'tech' ? 'rgba(165, 110, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'tech' ? '#A56EFF' : '#8d8d8d',
                            borderBottom: activeTab === 'tech' ? '2px solid #A56EFF' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>Technology Stack</button>
                    <button 
                        onClick={() => setActiveTab('install')}
                        style={{
                            padding: '1rem 2rem',
                            background: activeTab === 'install' ? 'rgba(165, 110, 255, 0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === 'install' ? '#A56EFF' : '#8d8d8d',
                            borderBottom: activeTab === 'install' ? '2px solid #A56EFF' : '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>Installation</button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem 3rem', overflowY: 'auto', flex: 1 }}>
                    
                    {activeTab === 'overview' && (
                        <div className="animate-fade-in">
                            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#e0e0e0', marginBottom: '2rem' }}>
                                <strong>Gala Studio</strong> is a web-based interface for Galactic Dynamics simulation. It provides a visual, interactive layer over the 
                                <strong>Gala</strong> Python package, enabling real-time exploration of orbital mechanics, resonances, and chaotic behavior.
                            </p>

                            <SectionTitle icon={Rocket}>Attribution & History</SectionTitle>
                            <p style={{ color: '#c6c6c6', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                This tool is built upon <strong>Gala</strong>, an Astropy-affiliated Python package designed for Galactic Dynamics research. 
                                Developed by researchers at the <strong>Flatiron Institute</strong> (led by Adrian Price-Whelan), Gala provides efficient, low-level integration 
                                tools for studying the formation and evolution of galaxies. Gala Studio leverages this robust backend to visualize numerically-integrated 
                                trajectories of stars and dark matter particles.
                            </p>

                            <SectionTitle icon={DataVis_2}>Purpose & Utility</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <FeatureCard 
                                    title="Interactive Dynamics" 
                                    desc="Adjust potential parameters and initial conditions in real-time. The client-side Leapfrog integrator (kepler.ts) provides immediate feeedback, synced with the accurate Python backend." 
                                />
                                <FeatureCard 
                                    title="Chaos Quantification" 
                                    desc="Compute Lyapunov Exponents and characteristic times to identify non-linear behavior and quantify orbital stability." 
                                />
                                <FeatureCard 
                                    title="Phase Space Tomography" 
                                    desc="Visualize the velocity structure of orbits to identify resonances and stability regions often obscured in coordinate space." 
                                />
                                <FeatureCard 
                                    title="Spectral Decomposition" 
                                    desc="Analyze the fundamental frequencies (Omega_phi) of orbits to characterize their dynamical properties." 
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tech' && (
                        <div className="animate-fade-in">
                            <p style={{ fontSize: '1.1rem', color: '#c6c6c6', marginBottom: '2rem' }}>
                                Gala Studio utilizes a hybrid architecture to balance interactive performance with scientific accuracy.
                            </p>

                            <SectionTitle icon={Laptop}>Frontend (Client)</SectionTitle>
                            <ul style={{ listStyle: 'none', padding: 0, color: '#e0e0e0', lineHeight: '1.8' }}>
                                <li>✨ <strong>React & Zustand</strong>: State management for simulation parameters and UI control.</li>
                                <li>🌌 <strong>Three.js (R3F)</strong>: WebGL rendering for 3D orbital visualization.</li>
                                <li>⚡ <strong>Optimistic Integation</strong>: Lightweight client-side physics for immediate interaction response.</li>
                            </ul>

                            <SectionTitle icon={Code}>Backend (Server)</SectionTitle>
                            <ul style={{ listStyle: 'none', padding: 0, color: '#e0e0e0', lineHeight: '1.8' }}>
                                <li>🐍 <strong>Python & FastAPI</strong>: High-performance API handling simulation requests.</li>
                                <li>🔭 <strong>Gala & Astropy</strong>: Core libraries for unit conversion, potentials, and integration.</li>
                                <li>📦 <strong>MessagePack</strong>: Binary data transport for efficient transfer of large coordinate arrays.</li>
                            </ul>
                        </div>
                    )}

                    {activeTab === 'install' && (
                        <div className="animate-fade-in">
                            <SectionTitle icon={Bee}>Local Installation</SectionTitle>
                            <p style={{ color: '#c6c6c6', marginBottom: '1rem' }}>
                                Clone the repository and run the studio on your own machine.
                            </p>
                            
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '4px', border: '1px solid #333', fontFamily: 'monospace', color: '#A56EFF', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                git clone [repo-url]<br/>
                                cd galastudio
                            </div>

                            <strong style={{ color: '#f4f4f4', marginTop: '1rem', display: 'block' }}>1. Start the Backend</strong>
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '4px', border: '1px solid #333', fontFamily: 'monospace', color: '#e0e0e0', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                cd server<br/>
                                python -m venv venv<br/>
                                source venv/bin/activate<br/>
                                pip install -r requirements.txt<br/>
                                python main.py
                            </div>

                            <strong style={{ color: '#f4f4f4', marginTop: '1rem', display: 'block' }}>2. Start the Frontend</strong>
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '4px', border: '1px solid #333', fontFamily: 'monospace', color: '#e0e0e0', fontSize: '0.9rem' }}>
                                cd client<br/>
                                npm install<br/>
                                npm run dev
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(165, 110, 255, 0.1)', borderLeft: '4px solid #A56EFF', borderRadius: '4px' }}>
                                <strong style={{ color: '#A56EFF' }}>Note:</strong> Ensure you have Python 3.10+ and Node.js 18+ installed. 
                                The studio will be available at <span style={{ fontFamily: 'monospace', color: '#f4f4f4' }}>localhost:5173</span>.
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
