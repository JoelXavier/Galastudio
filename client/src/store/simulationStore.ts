import { create } from 'zustand';

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

    // Phase 10: Export & Data View Modals
    isExportOpen: boolean;
    setExportOpen: (isOpen: boolean) => void;

    dataView: { title: string; columns: string[]; data: any[][] } | null;
    setDataView: (view: { title: string; columns: string[]; data: any[][] } | null) => void;

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

    // Phase 8: Atomic Hydration
    setCompleteState: (
        potentialType: OrbitState['potentialType'],
        units: OrbitState['units'],
        params: Partial<OrbitState['potentialParams']>,
        integrator: OrbitState['integrator']
    ) => void;

    integrateOrbit: () => Promise<void>;
    exportPythonCode: () => Promise<string>;
    analyzeChaos: () => Promise<void>;
}

export const useStore = create<OrbitState>((set, get) => ({
    points: [],
    velocities: [],
    isIntegrating: false,
    error: null,
    successMsg: null,
    units: 'galactic',
    
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
    isExportOpen: false,
    setExportOpen: (isOpen) => set({ isExportOpen: isOpen }),
    
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

    setPotentialParams: (newParams) => {
        set((state) => ({
            potentialParams: { ...state.potentialParams, ...newParams }
        }));
        // Auto-play: Trigger integration on parameter change (Optimistic UI)
        // Debouncing could be added here for performance if needed
        get().integrateOrbit();
    },

    setUnits: (units) => {
        // Reset params to reasonable defaults for the new scale
        const defaults = units === 'galactic' 
            ? { mass: 1.0, x: 8.0, y: 0.0, z: 0.0, vx: 0.0, vy: 220.0, time_step: 1.0 }
            : { mass: 1.0, x: 1.0, y: 0.0, z: 0.0, vx: 0.0, vy: 6.28, time_step: 0.1 }; // AU, AU/yr (2pi ~ circ)
            
        set({ units, potentialParams: { ...get().potentialParams, ...defaults } });
        get().integrateOrbit();
    },

    setPotentialType: (type) => {
        set({ potentialType: type });
        get().integrateOrbit();
    },

    setCloudMode: (enabled) => {
        set({ isCloudMode: enabled });
        get().integrateOrbit();
    },

    setObserverMode: (enabled: boolean) => {
        set({ isObserverMode: enabled });
        get().integrateOrbit(); // Trigger re-integration to get sky coords
    },

    setTimeDirection: (direction: 'forward' | 'backward') => {
        set({ timeDirection: direction });
        get().integrateOrbit(); // Re-integrate with new time direction
    },

    // Ghost Trace Logic
    ghostPoints: null,
    lockGhostTrace: () => {
        const currentPoints = get().points;
        if (currentPoints && currentPoints.length > 0) {
            set({ ghostPoints: [...currentPoints] }); // Deep copy
        }
    },
    clearGhostTrace: () => set({ ghostPoints: null }),
    
    // Phase 8: Integrator Selection
    integrator: 'leapfrog',
    setIntegrator: (algo) => {
        set({ integrator: algo });
        get().integrateOrbit();
    },
    
    setCompleteState: (potentialType, units, params, integrator) => {
        set((state) => ({
            potentialType,
            units,
            integrator,
            potentialParams: { ...state.potentialParams, ...params }
        }));
        get().integrateOrbit();
    },
    
    integrateOrbit: async () => {
        const { potentialParams, units, potentialType, isCloudMode, isObserverMode, timeDirection, integrator } = get();
        
        console.log('[SimulationStore] 🚀 Starting Integration', { potentialType, units, integrator });
        
        set({ 
            isIntegrating: true, 
            error: null, 
            chaosData: null, 
            energyError: null, 
            orbitEnsemble: null, 
            orbitActions: null,
            skyPoints: null,
            skyEnsemble: null,
            evolutionMetadata: null  // Clear evolution metadata on new integration
        }); // Reset all
        try {
            // Compose the request body
            const body = {
                // Denormalize Mass: 
                // Galactic: input 1.0 -> 1e10 Msun
                // Solar: input 1.0 -> 1.0 Msun
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
                is_observer: isObserverMode, // Pass observer mode to backend
                time_direction: timeDirection, // Pass time direction to backend
                ensemble_size: 100, // Visual density
                integrator: integrator // Phase 8
            };

            const response = await fetch('/integrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`Integration failed: ${response.statusText}`);
            }

            const data = await response.json();
            
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
                    successMsg: isCloudMode 
                        ? `Cloud Integratred! (100 Orbits)` 
                        : `Orbit Calculation Complete (${data.points.length} points)`
                });
                
                // Clear toast after 3 seconds
                setTimeout(() => set({ successMsg: null }), 3000);
            } else {
                set({ error: data.message, isIntegrating: false });
            }
        } catch (err: any) {
            console.error(err);
            set({ error: err.message || "Network Error", isIntegrating: false });
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
            
            const response = await fetch('/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            
            const data = await response.json();
            return data.code;
         } catch (err) {
             console.error("Export failed", err);
             return "# Error generating code";
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

            const response = await fetch('/analyze_chaos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                set({ 
                    chaosData: {
                        isChaotic: data.isChaotic,
                        lyapunovTime: data.lyapunovTime,
                        lyapExp: data.lyapExp
                    },
                    successMsg: data.isChaotic ? "Chaos Detected!" : "Orbit appears stable."
                });
                 setTimeout(() => set({ successMsg: null }), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            set({ isAnalyzing: false });
        }
    }
}));
