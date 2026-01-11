import { useEffect, useRef } from 'react';
import { useStore } from '../store/simulationStore';

/**
 * usePermalink
 * 
 * Two-way binding between simulation store and URL query parameters.
 * Allows deep linking to specific simulation states.
 */
export const usePermalink = () => {
    // Current state (Read-only for URL sync)
    const potentialType = useStore(state => state.potentialType);
    const units = useStore(state => state.units);
    const potentialParams = useStore(state => state.potentialParams);
    const integrator = useStore(state => state.integrator);
    const viewMode = useStore(state => state.viewMode);
    
    // Setter (Batch)
    const setCompleteState = useStore(state => state.setCompleteState);
    
    // Ref to track if we're hydrating (prevent writing back to URL during load)
    const isHydrating = useRef(true);

    // 1. Hydrate from URL on Mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        // Potential Type
        const pot = params.get('pot');
        // Units
        const u = params.get('units');
        // Integrator
        const algo = params.get('algo');
        // Mode
        const mode = params.get('mode');

        // Parameters
        const newParams: Record<string, number> = {};
        const paramMap: Record<string, string> = {
            'm': 'mass',
            'x': 'x',
            'y': 'y',
            'z': 'z',
            'vx': 'vx',
            'vy': 'vy',
            'vz': 'vz',
            'dt': 'time_step'
        };

        for (const [urlKey, storeKey] of Object.entries(paramMap)) {
            const val = params.get(urlKey);
            if (val !== null) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    newParams[storeKey] = num;
                }
            }
        }

        const state = useStore.getState();
        const initialPot = (pot && ['milkyway', 'kepler', 'hernquist'].includes(pot)) ? pot : state.potentialType;
        const initialUnits = (u && ['galactic', 'solarsystem'].includes(u)) ? u : state.units;
        const initialAlgo = (algo && ['leapfrog', 'dop853', 'ruth4'].includes(algo)) ? algo : state.integrator;
        const initialMode = (mode === 'view') ? 'view' : 'editor';

        if (Object.keys(newParams).length > 0 || pot || u || algo || mode) {
            // Batch update -> Single integration
            setCompleteState(
                initialPot as 'milkyway' | 'kepler' | 'hernquist', 
                initialUnits as 'galactic' | 'solarsystem', 
                newParams, 
                initialAlgo as 'leapfrog' | 'dop853' | 'ruth4'
            );
            useStore.getState().setViewMode(initialMode);
        } else {
            // No params? Trigger default integration
            useStore.getState().integrateOrbit();
        }

        // Finish hydration
        setTimeout(() => {
            isHydrating.current = false;
            console.log('[usePermalink] Hydration complete');
        }, 500);

    }, [setCompleteState]); // Added missing dependency

    // 2. Serialize to URL on State Change
    useEffect(() => {
        if (isHydrating.current) return;

        const updateUrl = () => {
            const params = new URLSearchParams();

            // Core settings
            params.set('pot', potentialType);
            params.set('units', units);

            // Params (shorthand keys)
            params.set('m', potentialParams.mass.toString());
            params.set('x', potentialParams.x.toString());
            params.set('y', potentialParams.y.toString());
            params.set('z', potentialParams.z.toString());
            params.set('vx', potentialParams.vx.toString());
            params.set('vy', potentialParams.vy.toString());
            params.set('vz', potentialParams.vz.toString());
            params.set('dt', potentialParams.time_step.toString());
            
            // Advanced
            params.set('algo', integrator);
            if (viewMode === 'view') {
                params.set('mode', 'view');
            }

            // Update URL without reloading
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, '', newUrl);
        };

        // Debounce updates (500ms)
        const timeoutId = setTimeout(updateUrl, 500);

        return () => clearTimeout(timeoutId);

    }, [potentialType, units, potentialParams, integrator, viewMode]);
};
