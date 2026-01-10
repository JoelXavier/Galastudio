/**
 * Kepler.ts - Client-Side Physics Engine for Optimistic UI
 * 
 * Implements a pure JavaScript Leapfrog integrator to provide instant 
 * visual feedback for Keplerian orbits (2-body problem).
 * 
 * Update: Supports Chaos Cloud (Ensemble Integration)
 */

type Vector3 = [number, number, number];

// Constants
const KM_S_TO_KPC_MYR = 1.022712165e-3; // 1 km/s * 1 Myr in kpc
const KPC_TO_KM_S_MYR = 977.79222;      // 1 kpc / (1 km/s * 1 Myr)
const G_GALACTIC = 4.30091e-6;          // kpc (km/s)^2 / M_sun
const G_SOLAR = 39.4784176;             // 4 * pi^2 (AU^3 / yr^2 M_sun)

interface IntegratorResult {
    points: Vector3[];
    velocities: Vector3[];
    ensemble?: Vector3[][]; // Array of orbits (100 orbits, each has N points)
}

// Generate a cloud of points around a center (Gaussian)
export function generateEnsemble(
    centerPos: Vector3,
    centerVel: Vector3,
    size: number
): { positions: Vector3[], velocities: Vector3[] } {
    const positions: Vector3[] = [];
    const velocities: Vector3[] = [];
    
    // Scale dispersion based on units
    // Galactic: 0.1 pc (1e-4 kpc)
    // Solar: 1e-4 AU
    const d_pos = 1e-4; 
    const d_vel = 1e-4;

    for (let i = 0; i < size; i++) {
        // Box-Muller transform for simple Gaussian
        const randn = () => {
            let u = 0, v = 0;
            while(u === 0) u = Math.random(); 
            while(v === 0) v = Math.random();
            return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
        };

        positions.push([
            centerPos[0] + randn() * d_pos,
            centerPos[1] + randn() * d_pos,
            centerPos[2] + randn() * d_pos
        ]);
        
        velocities.push([
            centerVel[0] + randn() * d_vel,
            centerVel[1] + randn() * d_vel,
            centerVel[2] + randn() * d_vel
        ]);
    }

    return { positions, velocities };
}

export function integrate(
    massOriginal: number, 
    pos: Vector3,
    vel: Vector3,
    dt: number,
    steps: number,
    units: 'galactic' | 'solarsystem',
    computeEnsemble: boolean = false
): IntegratorResult {
    
    // 1. Setup Units & Constants
    let G: number;
    let mass: number;
    let C_x: number; 
    let C_v: number; 
    let Acc_Factor: number;

    if (units === 'solarsystem') {
        G = G_SOLAR;
        mass = massOriginal;
        C_x = 1.0;
        C_v = 1.0;
        Acc_Factor = 1.0;
    } else {
        G = G_GALACTIC;
        mass = massOriginal * 1e10;
        C_x = KM_S_TO_KPC_MYR; 
        Acc_Factor = KPC_TO_KM_S_MYR;
        C_v = 1.0; 
    }

    // Helper: Step function for a single particle
    // Returns [x, y, z, vx, vy, vz, ax, ay, az] (Updated in place conceptually)
    // But for perf in loop, we'll inline logic or keep it simple.

    const points: Vector3[] = [];
    const velocities: Vector3[] = [];
    
    // Setup Primary
    let x = pos[0], y = pos[1], z = pos[2];
    let vx = vel[0], vy = vel[1], vz = vel[2];
    
    // Setup Ensemble
    // If enabled, we track 100 particles.
    // ensembleOrbits[particleIndex][stepIndex] = [x,y,z]
    const ensembleSize = computeEnsemble ? 100 : 0;
    const ensembleState: { x: number, y: number, z: number, vx: number, vy: number, vz: number, ax?: number, ay?: number, az?: number }[] = [];
    const ensembleOrbits: Vector3[][] = [];

    if (computeEnsemble) {
        const cloud = generateEnsemble(pos, vel, ensembleSize);
        for(let i=0; i<ensembleSize; i++) {
             ensembleState.push({
                 x: cloud.positions[i][0], y: cloud.positions[i][1], z: cloud.positions[i][2],
                 vx: cloud.velocities[i][0], vy: cloud.velocities[i][1], vz: cloud.velocities[i][2]
             });
             ensembleOrbits.push([]); // Init trail
             ensembleOrbits[i].push(cloud.positions[i]); // Push T0
        }
    }

    // Initial Acceleration (Primary)
    let r2 = x*x + y*y + z*z;
    let r = Math.sqrt(r2);
    let a_mag = -(G * mass) / (r2 * r) * Acc_Factor;
    let ax = a_mag * x, ay = a_mag * y, az = a_mag * z;

    points.push([x, y, z]);
    velocities.push([vx, vy, vz]);

    // Pre-calculate Ensemble Initial Accel
    if (computeEnsemble) {
        for(let i=0; i<ensembleSize; i++) {
            const s = ensembleState[i];
            const r2_s = s.x*s.x + s.y*s.y + s.z*s.z;
            const r_s = Math.sqrt(r2_s);
            const a_mag_s = -(G * mass) / (r2_s * r_s) * Acc_Factor;
            // Store Half-kick velocity immediately? No, standard leapfrog structure.
            // We just need ax, ay, az to start loop.
            // Let's modify state to include ax, ay, az.
            s.ax = a_mag_s * s.x;
            s.ay = a_mag_s * s.y;
            s.az = a_mag_s * s.z;
        }
    }

    // Loop
    for (let k = 0; k < steps; k++) {
        // --- PRIMARY ORBIT ---
        vx += ax * 0.5 * dt * C_v;
        vy += ay * 0.5 * dt * C_v;
        vz += az * 0.5 * dt * C_v;

        x += vx * dt * C_x;
        y += vy * dt * C_x;
        z += vz * dt * C_x;

        r2 = x*x + y*y + z*z;
        r = Math.sqrt(r2);
        a_mag = -(G * mass) / (r2 * r) * Acc_Factor;
        ax = a_mag * x; ay = a_mag * y; az = a_mag * z;

        vx += ax * 0.5 * dt * C_v;
        vy += ay * 0.5 * dt * C_v;
        vz += az * 0.5 * dt * C_v;

        points.push([x, y, z]);
        velocities.push([vx, vy, vz]);

        // --- ENSEMBLE ORBITS ---
        if (computeEnsemble) {
            for(let i=0; i<ensembleSize; i++) {
                const s = ensembleState[i];
                
                // 1. Kick
                // @ts-expect-error
                s.vx += s.ax * 0.5 * dt * C_v;
                // @ts-expect-error
                s.vy += s.ay * 0.5 * dt * C_v;
                // @ts-expect-error
                s.vz += s.az * 0.5 * dt * C_v;

                // 2. Drift
                s.x += s.vx * dt * C_x;
                s.y += s.vy * dt * C_x;
                s.z += s.vz * dt * C_x;

                // 3. Force
                const r2_s = s.x*s.x + s.y*s.y + s.z*s.z;
                const r_s = Math.sqrt(r2_s);
                const a_mag_s = -(G * mass) / (r2_s * r_s) * Acc_Factor;
                s.ax = a_mag_s * s.x;
                s.ay = a_mag_s * s.y;
                s.az = a_mag_s * s.z;

                // 4. Kick
                // @ts-expect-error
                s.vx += s.ax * 0.5 * dt * C_v;
                // @ts-expect-error
                s.vy += s.ay * 0.5 * dt * C_v;
                // @ts-expect-error
                s.vz += s.az * 0.5 * dt * C_v;

                // Store
                // Optimization: Maybe only store every N steps if too heavy?
                // For 100 particles * 2000 steps = 200k points. JS handle this easily (Array(200k)).
                ensembleOrbits[i].push([s.x, s.y, s.z]);
            }
        }
    }

    return { points, velocities, ensemble: computeEnsemble ? ensembleOrbits : undefined };
}
