import { create } from 'zustand';
import { integrate } from '../physics/kepler';
import { apiRequest } from '../api/client';

// Phase 13: Deployment Config

interface OrbitState {
    points: [number, number, number][]; // The melody of the orbit
    velocities: [number, number, number][]; // The rhythm (phase space)
    isIntegrating: boolean;             // The tempo (loading state)
    error: string | null;               // Dissonance
    successMsg: string | null;          // Harmony (Toast message)
    units: 'galactic' | 'solarsystem';  // The Scale (kpc vs AU)
    
    // v2.0 Deep Science - Chaos Cloud
    isCloudMode: boolean;
    orbitEnsemble: [number, number, number][][] | null;
    orbitActions: [number, number, number][] | null; // Phase 6: Action Space MRI

    // Phase 6: Synthetic Observer (Sky Projection)
    isObserverMode: boolean;
    skyPoints: [number, number, number][] | null; // [l, b, dist]
    skyEnsemble: [number, number, number][][] | null;

    // Phase 6: Time-Machine Editor
    evolutionMetadata: {
        totalTime: number;
        keyframeCount: number;
        timeRange: [number, number];
    } | null;

    // Phase 7: Galactic Archaeologist
    timeDirection: 'forward' | 'backward';
    
    // Phase 9: Timeline Editor Modal
    isTimelineOpen: boolean;
    setTimelineOpen: (isOpen: boolean) => void;

    // Phase 10: Data Portability & Data View Modals
    isDataModalOpen: boolean;
    setDataModalOpen: (isOpen: boolean) => void;

    // Phase 16: Documentation
    isDocsOpen: boolean;
    setDocsOpen: (isOpen: boolean) => void;

    dataView: { title: string; columns: string[]; data: (string | number)[][] } | null;
    setDataView: (view: { title: string; columns: string[]; data: (string | number)[][] } | null) => void;

    expandedPanel: 'spectral' | 'phase' | null;
    setExpandedPanel: (panel: 'spectral' | 'phase' | null) => void;

    viewMode: 'editor' | 'view';
    setViewMode: (mode: 'editor' | 'view') => void;
    
    downloadGltfTrigger: number;
    triggerGltfDownload: () => void;
    downloadCsvTrigger: number;
    triggerCsvDownload: () => void;

    // Phase 5: v2.0 Deep Science
    energyError: number | null; // The Trust Meter (Delta E / E)
    
    // Phase 11: Camera Controls
    cameraAction: { type: 'zoomIn' | 'zoomOut' | 'reset' | 'toggleRotate', id: number } | null;
    triggerCamera: (action: 'zoomIn' | 'zoomOut' | 'reset' | 'toggleRotate') => void;
    
    
    // Phase 3: Advanced Dynamics
    potentialType: 'kepler' | 'milkyway' | 'hernquist';
    chaosData: {
        isChaotic: boolean;
        lyapunovTime: number;
        lyapExp: number;
    } | null;
    isAnalyzing: boolean;

    // The Instruments (Potential Parameters)
    potentialParams: {
        mass: number;       // The fundamental frequency (1e10 Msun)
        time_step: number;  // The rhythm (Myr)
        vx: number;         // Initial velocity X
        vy: number;         // Initial velocity Y
        vz: number;         // Initial velocity Z
        x: number;          // Position X (kpc)
        y: number;          // Position Y (kpc)
        z: number;          // Position Z (kpc)
    };

    // Conducting the Orchestra
    isDirty: boolean;                   // Changes pending
    setPotentialParams: (params: Partial<OrbitState['potentialParams']>) => void;
    setUnits: (units: 'galactic' | 'solarsystem') => void;
    setPotentialType: (type: 'kepler' | 'milkyway' | 'hernquist') => void;
    setCloudMode: (enabled: boolean) => void;
    setObserverMode: (enabled: boolean) => void;
    setTimeDirection: (direction: 'forward' | 'backward') => void;
    
    // Phase 8: Workflow Features - Ghost Trace
    ghostPoints: [number, number, number][] | null;
    lockGhostTrace: () => void;
    clearGhostTrace: () => void;
    
    // Phase 8: Integrator Selection
    integrator: 'leapfrog' | 'dop853' | 'ruth4';
    setIntegrator: (algo: 'leapfrog' | 'dop853' | 'ruth4') => void;

    setCompleteState: (
        potentialType: OrbitState['potentialType'],
        units: OrbitState['units'],
        params: Partial<OrbitState['potentialParams']>,
        integrator: OrbitState['integrator']
    ) => void;

    logs: { id: string; msg: string; type: 'info' | 'success' | 'warn'; timestamp: string }[];
    addLog: (msg: string, type?: 'info' | 'success' | 'warn') => void;

    integrateOrbit: (silent?: boolean) => Promise<void>;
    injectFromGrid: (x: number, y: number) => void;
    exportPythonCode: () => Promise<string>;
    serializeState: () => string;
    importSimulation: (json: string) => Promise<boolean>;
    analyzeChaos: () => Promise<void>;
}

export const useStore = create<OrbitState>((set, get) => ({
    points: [],
    velocities: [],
    isIntegrating: false,
    error: null,
    successMsg: null,
    units: 'galactic',
    isDirty: false,
    
    isCloudMode: false,
    orbitEnsemble: null,
    orbitActions: null,

    isObserverMode: false,
    skyPoints: null,
    skyEnsemble: null,

    evolutionMetadata: null,

    timeDirection: 'forward',
    
    energyError: null,
    
    potentialType: 'kepler',
    chaosData: null,
    isAnalyzing: false,
    
    // Phase 9: Timeline Editor Modal
    isTimelineOpen: false,
    setTimelineOpen: (isOpen) => set({ isTimelineOpen: isOpen }),

    // Default tuning (Kepler Potential)
    potentialParams: {
        mass: 1.0,      // x 10^10 Msun (Normalized for sliders)
        time_step: 1.0,
        vx: 0.0,
        vy: 220.0,
        vz: 0.0,
        x: 8.0,
        y: 0.0,
        z: 0.0
    },
    
    // UI Initial State
    isDataModalOpen: false,
    setDataModalOpen: (isOpen) => set({ isDataModalOpen: isOpen }),
    
    dataView: null,
    setDataView: (view) => set({ dataView: view }),

    expandedPanel: null,
    setExpandedPanel: (panel) => set({ expandedPanel: panel }),

    viewMode: 'editor',
    setViewMode: (mode) => set({ viewMode: mode }),
    downloadGltfTrigger: 0,
    triggerGltfDownload: () => set(state => ({ downloadGltfTrigger: state.downloadGltfTrigger + 1 })),
    downloadCsvTrigger: 0,
    triggerCsvDownload: () => set(state => ({ downloadCsvTrigger: state.downloadCsvTrigger + 1 })),
    
    logs: [{ id: 'init', msg: 'Gala Studio System Initialized', type: 'info', timestamp: new Date().toLocaleTimeString() }],
    addLog: (msg, type = 'info') => set(state => ({
        logs: [...state.logs.slice(-49), { id: Math.random().toString(36).substr(2, 9), msg, type, timestamp: new Date().toLocaleTimeString() }]
    })),

    cameraAction: null,
    triggerCamera: (action) => set(() => ({ cameraAction: { type: action, id: Date.now() } })),

    setPotentialParams: (newParams) => {
        // Update params and mark as dirty. No integration triggered here.
        set((s) => ({
            potentialParams: { ...s.potentialParams, ...newParams },
            isDirty: true
        }));
    },

    setUnits: (units) => {
        const defaults = units === 'galactic' 
            ? { mass: 1.0, x: 8.0, y: 0.0, z: 0.0, vx: 0.0, vy: 220.0, time_step: 1.0 }
            : { mass: 1.0, x: 1.0, y: 0.0, z: 0.0, vx: 0.0, vy: 6.28, time_step: 0.1 };
            
        set({ units, isDirty: true, potentialParams: { ...get().potentialParams, ...defaults } });
    },

    setPotentialType: (type) => {
        set({ potentialType: type, isDirty: true });
        get().addLog(`Potential Field switched to ${type.toUpperCase()}`, 'info');
    },
    
    isDocsOpen: false,
    setDocsOpen: (isOpen) => set({ isDocsOpen: isOpen }),

    setCloudMode: (enabled) => {
        set({ isCloudMode: enabled, isDirty: true });
    },

    setObserverMode: (enabled: boolean) => {
        set({ isObserverMode: enabled, isDirty: true });
    },

    setTimeDirection: (direction: 'forward' | 'backward') => {
        set({ timeDirection: direction, isDirty: true });
    },

    ghostPoints: null,
    lockGhostTrace: () => {
        const currentPoints = get().points;
        if (currentPoints && currentPoints.length > 0) {
            set({ ghostPoints: [...currentPoints] });
        }
    },
    clearGhostTrace: () => set({ ghostPoints: null }),
    
    integrator: 'leapfrog',
    setIntegrator: (algo) => {
        set({ integrator: algo, isDirty: true });
        get().addLog(`Integrator Engine set to ${algo.toUpperCase()}`, 'info');
    },
    
    setCompleteState: (potentialType, units, params, integrator) => {
        set((state) => ({
            potentialType,
            units,
            integrator,
            isDirty: true,
            potentialParams: { ...state.potentialParams, ...params }
        }));
    },
    
    injectFromGrid: (x, y) => {
        set((s) => ({
            potentialParams: { ...s.potentialParams, x, y, z: 0 },
            isDirty: true
        }));
        get().integrateOrbit(true);
    },
    
    integrateOrbit: async (silent = false) => {
        const { potentialParams, units, potentialType, isCloudMode, isObserverMode, timeDirection, integrator } = get();
        
        console.log('[SimulationStore] 🚀 Starting Integration', { potentialType, units, integrator });
        
        set({ 
            isIntegrating: true, 
            isDirty: false, 
            error: null, 
            chaosData: null, 
            energyError: null, 
            orbitEnsemble: null, 
            orbitActions: null,
            skyPoints: null,
            skyEnsemble: null,
            evolutionMetadata: null
        });

        if (!silent) {
            get().addLog(`Initiating orbit trace integration...`, 'info');
        }

        // 1. Client-Side Prediction (Kepler Only)
        if (potentialType === 'kepler') {
            try {
                const result = integrate(
                    potentialParams.mass,
                    [potentialParams.x, potentialParams.y, potentialParams.z],
                    [potentialParams.vx, potentialParams.vy, potentialParams.vz],
                    potentialParams.time_step,
                    2000, 
                    units,
                    isCloudMode 
                );
                
                set({ 
                    points: result.points as [number, number, number][], 
                    velocities: result.velocities as [number, number, number][],
                    orbitEnsemble: result.ensemble as [number, number, number][][] | null,
                    isIntegrating: false,
                    successMsg: silent ? null : "Prediction Calculated (Client-side)"
                });
                if (!silent) {
                    get().addLog(`Kepler prediction completed (Local Browser)`, 'success');
                }
                return;
            } catch (e) {
                console.warn("Client-side integration failed, falling back to server", e);
            }
        }

        try {
            const body = {
                mass: units === 'galactic' ? potentialParams.mass * 1.0e10 : potentialParams.mass,
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
                is_cloud: isCloudMode,
                is_observer: isObserverMode,
                time_direction: timeDirection,
                ensemble_size: 100,
                integrator: integrator
            };

            const data = await apiRequest<{
                status: string;
                message: string;
                points: [number, number, number][];
                velocities?: [number, number, number][];
                energy_error: number;
                ensemble?: [number, number, number][][];
                actions?: [number, number, number][];
                sky_coords?: [number, number, number][];
                sky_ensemble?: [number, number, number][][];
                total_time?: number;
            }>('/integrate', body);
            
            if (data.status === 'success') {
                set({ 
                    points: data.points, 
                    velocities: data.velocities || [],
                    energyError: data.energy_error,
                    orbitEnsemble: data.ensemble || null,
                    orbitActions: data.actions || null,
                    skyPoints: data.sky_coords || null,
                    skyEnsemble: data.sky_ensemble || null,
                    isIntegrating: false,
                    successMsg: silent ? null : (isCloudMode 
                        ? `Cloud Integrated! (100 Orbits)` 
                        : `Orbit Calculation Complete (${data.points.length} points)`)
                });
                
                if (!silent) {
                    get().addLog(isCloudMode ? `Orbital ensemble computed (100 variants)` : `Numerical integration finished (${data.points.length} points)`, 'success');
                }
                
                if (!silent) {
                    setTimeout(() => set({ successMsg: null }), 3000);
                }
            } else {
                set({ error: data.message, isIntegrating: false });
                get().addLog(`Integration error: ${data.message}`, 'warn');
            }

        } catch (err: unknown) {
            const error = err as Error;
            console.error('[SimulationStore] Integration Error:', error);
            set({ error: error.message || "Network Error", isIntegrating: false });
        }
    },

    exportPythonCode: async () => {
         const { potentialParams, units, potentialType } = get();
         try {
            const body = {
                mass: potentialParams.mass * 1.0e10, 
                x: potentialParams.x, 
                y: potentialParams.y, 
                z: potentialParams.z,
                vx: potentialParams.vx, 
                vy: potentialParams.vy, 
                vz: potentialParams.vz,
                time_step: potentialParams.time_step,
                steps: 2000,
                units: units,
                potential_type: potentialType
            };
            
            const data = await apiRequest<{ code: string }>('/export', body);
            return data.code;
         } catch (err) {
             console.error("Export failed", err);
             return "# Error generating code";
         }
    },

    serializeState: () => {
        const { potentialType, units, potentialParams, integrator, isCloudMode, isObserverMode, timeDirection } = get();
        const exportObj = {
            version: '2.0',
            potentialType,
            units,
            potentialParams,
            integrator,
            isCloudMode,
            isObserverMode,
            timeDirection,
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(exportObj, null, 2);
    },

    importSimulation: async (json: string) => {
        try {
            const data = JSON.parse(json);
            
            // Basic validation
            if (!data.potentialType || !data.potentialParams) {
                throw new Error("Missing required simulation parameters");
            }

            set({
                potentialType: data.potentialType,
                units: data.units || 'galactic',
                potentialParams: { ...get().potentialParams, ...data.potentialParams },
                integrator: data.integrator || 'leapfrog',
                isCloudMode: data.isCloudMode ?? false,
                isObserverMode: data.isObserverMode ?? false,
                timeDirection: data.timeDirection ?? 'forward',
                isDirty: true
            });

            get().addLog(`Simulation state imported successfully`, 'success');
            await get().integrateOrbit();
            return true;
        } catch (err) {
            console.error("Import failed", err);
            get().addLog(`Import failed: ${(err as Error).message}`, 'warn');
            return false;
        }
    },
    
    analyzeChaos: async () => {
        const { potentialParams, units, potentialType } = get();
        set({ isAnalyzing: true, chaosData: null });
        
        try {
             const body = {
                mass: units === 'galactic' ? potentialParams.mass * 1.0e10 : potentialParams.mass,
                x: potentialParams.x, 
                y: potentialParams.y, 
                z: potentialParams.z,
                vx: potentialParams.vx, 
                vy: potentialParams.vy, 
                vz: potentialParams.vz,
                time_step: potentialParams.time_step,
                steps: 2000,
                units: units,
                potential_type: potentialType
            };

            const data = await apiRequest<{
                status: string;
                isChaotic: boolean;
                lyapunovTime: number;
                lyapExp: number;
            }>('/analyze_chaos', body);
            
            if (data.status === 'success') {
                set({ 
                    chaosData: {
                        isChaotic: data.isChaotic,
                        lyapunovTime: data.lyapunovTime,
                        lyapExp: data.lyapExp
                    },
                    successMsg: data.isChaotic ? "Chaos Detected!" : "Orbit appears stable."
                });
                get().addLog(`Dynamical analysis complete. ${data.isChaotic ? 'Chaos detected' : 'System appears stable'}.`, data.isChaotic ? 'warn' : 'success');
                 setTimeout(() => set({ successMsg: null }), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            set({ isAnalyzing: false });
        }
    }
}));
