from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import logging
from functools import lru_cache

# --- Configuration & Setup ---
app = FastAPI(
    title="GalaStudio Engine",
    description="High-performance gravitational dynamics backend wrapping the Gala library.",
    version="0.1.0"
)

# --- CORS Middleware ---
# Allow the frontend (Vite/React) to communicate with this backend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# --- Routes ---

@app.get("/")
async def health_check():
    """
    Heartbeat to verify system status.
    """
    return {"status": "operational", "system": "GalaStudio Engine"}

from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import astropy.units as u
import astropy.coordinates as coord
import gala.potential as gp
import gala.dynamics as gd
import gala.integrate as gi
from gala.units import galactic, solarsystem
import time_machine  # Time-Machine Editor module
import potential_grid  # Potential Topography module
import frequency_analysis  # Frequency Spectrometer module

class OrbitRequest(BaseModel):
    mass: float = 1.0e10  # Solar masses
    x: float = 8.0        # kpc or AU
    y: float = 0.0        # kpc or AU
    z: float = 0.0        # kpc or AU
    vx: float = 0.0       # km/s or AU/yr
    vy: float = 220.0     # km/s or AU/yr
    vz: float = 0.0       # km/s or AU/yr
    time_step: float = 1.0 # Myr or yr
    steps: int = 1000
    units: str = "galactic" # "galactic" or "solarsystem"
    potential_type: str = "kepler" # "kepler", "milkyway", "hernquist"
    is_cloud: bool = False
    is_observer: bool = False  # Phase 6: Synthetic Observer
    time_direction: str = "forward"  # Phase 7: "forward" or "backward"
    ensemble_size: int = 20
    integrator: str = "leapfrog"  # Phase 8: "leapfrog", "dop853", "ruth4"

class Keyframe(BaseModel):
    time: float  # Gyr or yr
    mass: float  # Solar masses (or 10^10 Msun for galactic)
    disk_scale: Optional[float] = None  # kpc or AU

class EvolutionRequest(BaseModel):
    x: float = 8.0
    y: float = 0.0
    z: float = 0.0
    vx: float = 0.0
    vy: float = 220.0
    vz: float = 0.0
    time_step: float = 1.0
    steps: int = 2000
    units: str = "galactic"
    potential_type: str = "kepler"
    keyframes: List[Keyframe]  # List of keyframes defining evolution

class PotentialGridRequest(BaseModel):
    potential_type: str = "milkyway"
    units: str = "galactic"
    mass: float = 1.0e10  # Msun
    L_z: float = 1700.0  # Angular momentum (kpc * km/s or AU * km/s)
    grid_size: int = 80  # 80x80 grid for performance
    x_range: List[float] = [-20.0, 20.0]
    y_range: List[float] = [-20.0, 20.0]

class FrequencyRequest(BaseModel):
    points: List[List[float]]  # [[x, y, z], ...]
    time_step: float = 1.0  # Myr or yr
    units: str = "galactic"

@lru_cache(maxsize=32)
def get_potential(potential_type: str, mass: float, units_name: str, c_val: float = 1.0):
    """
    Cached potential generator to avoid re-instantiating heavy objects.
    """
    # Helper to resolve unit system from string
    usys = solarsystem if units_name == 'solarsystem' else galactic
    u_len = u.AU if units_name == 'solarsystem' else u.kpc
    
    if potential_type == "milkyway":
         return gp.MilkyWayPotential(units=usys)
    elif potential_type == "hernquist":
         return gp.HernquistPotential(m=mass * u.Msun, c=c_val*u_len, units=usys)
    else:
         return gp.KeplerPotential(m=mass * u.Msun, units=usys)

@app.post("/integrate")
async def integrate_orbit(req: OrbitRequest):
    """
    Integrates an orbit using a specified potential.
    """
    try:
        # Determine Unit System
        usys = solarsystem if req.units == 'solarsystem' else galactic
        u_len = u.AU if req.units == 'solarsystem' else u.kpc
        u_vel = u.AU/u.yr if req.units == 'solarsystem' else u.km/u.s
        u_time = u.yr if req.units == 'solarsystem' else u.Myr
        
        # Define Potential (Cached)
        # We pass primitives to the cached function
        # For Hernquist 'c', we default to 1.0 as per original logic, 
        # but technically we should allow it to be variable. 
        # For now, keeping the 1.0 hardcode consistent with original.
        pot = get_potential(req.potential_type, req.mass, req.units, 1.0)

        # Define Initial Conditions
        pos0 = [req.x, req.y, req.z] * u_len
        vel0 = [req.vx, req.vy, req.vz] * u_vel

        if req.is_cloud:
            # Generate Ensemble (Gaussian cloud around w0)
            n_stars = max(1, req.ensemble_size)
            # Dispersion scale: 0.1 pc (1e-4 kpc) for Galactic, 1e-4 AU for Solar
            d_pos = 1e-4 * u_len
            d_vel = 1e-4 * u_vel 
            
            # Broadcast perturbations
            # w0.shape = (3,) -> ensemble.shape = (3, n_stars)
            p_offsets = np.random.normal(0, d_pos.value, size=(3, n_stars)) * u_len
            v_offsets = np.random.normal(0, d_vel.value, size=(3, n_stars)) * u_vel
            
            w0 = gd.PhaseSpacePosition(
                pos=pos0[:, np.newaxis] + p_offsets,
                vel=vel0[:, np.newaxis] + v_offsets
            )
        else:
            w0 = gd.PhaseSpacePosition(pos=pos0, vel=vel0)

        # Phase 7: Galactic Archaeologist - Backwards Integration
        # Negate time step if integrating backwards in time
        dt = req.time_step if req.time_direction == "forward" else -req.time_step

        # Phase 8: Integrator Selection
        if req.integrator == 'dop853':
            Integrator = gi.DOPRI853Integrator
        elif req.integrator == 'ruth4':
            Integrator = gi.Ruth4Integrator
        else:
            Integrator = gi.LeapfrogIntegrator

        # Integrate
        orbit = pot.integrate_orbit(w0, dt=dt * u_time, n_steps=req.steps, Integrator=Integrator)

        # Extract data
        # Handle both single orbit and ensemble
        # xyz shape: (3, n_steps) or (3, n_steps, n_stars)
        if req.is_cloud:
            # ensemble[n_star][n_step] = [x,y,z]
            # orbit.xyz shape: (3, n_steps, n_stars)
            ensemble_data = []
            for i in range(req.ensemble_size):
                # .T -> (n_steps, 3)
                ensemble_data.append(orbit.xyz[:, :, i].to(u_len).value.T.tolist())
            
            points = ensemble_data[0] # Primary
        else:
            points = orbit.xyz.to(u_len).value.T.tolist()
            ensemble_data = None

        v_xyz = orbit.v_xyz[:, :, 0].to(u_vel).value.T.tolist() if req.is_cloud else orbit.v_xyz.to(u_vel).value.T.tolist()

        # --- Phase 6: Action Space MRI ---
        actions_data = None
        try:
            # Fit toy potential (Isochrone is a good all-rounder for MW/Kepler)
            # Use the primary orbit to find the best fit
            toy_pot = gd.fit_isochrone(orbit if not req.is_cloud else orbit[:, 0])
            
            if req.is_cloud:
                # Compute actions for the ensemble
                # For speed, we use a low N_max for the cloud dots
                # find_actions_o2gf handles ensemble orbits if passed correctly
                aaf = gd.find_actions_o2gf(orbit, N_max=4, toy_potential=toy_pot)
                # aaf['actions'] is (3, n_stars)
                # Convert to List[List[float]] -> [ [Jr, Lz, Jz], ... ]
                actions_data = aaf['actions'].value.T.tolist()
            else:
                # Single orbit
                aaf = gd.find_actions_o2gf(orbit, N_max=6, toy_potential=toy_pot)
                # Convert mean actions to [Jr, Lz, Jz]
                actions_data = [aaf['actions'].value.mean(axis=1).tolist()]
        except Exception as e:
            logging.warning(f"Action estimation failed: {e}")
            actions_data = None

        # --- Phase 6: Synthetic Observer (Sky Projection) ---
        sky_data = None
        sky_ensemble = None
        try:
            # Transform primary orbit to Galactic sky coordinates
            # orbit.pos is Galactocentric
            gal = orbit.pos.transform_to(coord.Galactic())
            # l, b are in degrees, distance in kpc/AU
            # Wrap l to [-180, 180] for standard sky maps
            l_deg = gal.l.wrap_at(180*u.deg).degree
            b_deg = gal.b.degree
            dist = gal.distance.to(u_len).value
            
            if req.is_cloud:
                # Shape: (n_steps, 3, n_stars) -> (n_stars, n_steps, 3)
                sky_ensemble = []
                for i in range(req.ensemble_size):
                    l_ens = gal.l[:, i].wrap_at(180*u.deg).degree
                    b_ens = gal.b[:, i].degree
                    d_ens = gal.distance[:, i].to(u_len).value
                    sky_ensemble.append(np.stack([l_ens, b_ens, d_ens], axis=1).tolist())
                
                sky_data = sky_ensemble[0]
            else:
                # Shape: (n_steps,)
                sky_data = np.stack([l_deg, b_deg, dist], axis=1).tolist()
                
        except Exception as e:
            logging.warning(f"Sky projection failed: {e}")

        # --- Trust Meter: Energy Conservation ---
        # E = phi + K
        E = orbit.energy() 
        E0 = E[0]
        # Fractional Error: |(E - E0) / E0|
        energy_drift = np.abs((E - E0) / E0)
        # For ensemble, take max across all stars
        max_error = np.max(energy_drift.value)
        
        return {
            "status": "success",
            "points": points,
            "velocities": v_xyz,
            "ensemble": ensemble_data,
            "actions": actions_data,
            "sky_coords": sky_data,
            "sky_ensemble": sky_ensemble,
            "energy_error": float(max_error)
        }
    except Exception as e:
        logging.error(f"Integration error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/analyze_chaos")
async def analyze_chaos(req: OrbitRequest):
    """
    Computes the Maximum Lyapunov Exponent to determine if the orbit is chaotic.
    """
    try:
        usys = solarsystem if req.units == 'solarsystem' else galactic
        u_len = u.AU if req.units == 'solarsystem' else u.kpc
        u_vel = u.AU/u.yr if req.units == 'solarsystem' else u.km/u.s
        
        # Define Potential (Recreate logic)
        if req.potential_type == "milkyway":
             pot = gp.MilkyWayPotential(units=usys)
        elif req.potential_type == "hernquist":
             pot = gp.HernquistPotential(m=req.mass * u.Msun, c=1.0*u_len, units=usys)
        else:
             pot = gp.KeplerPotential(m=req.mass * u.Msun, units=usys)

        w0 = gd.PhaseSpacePosition(
            pos=[req.x, req.y, req.z] * u_len,
            vel=[req.vx, req.vy, req.vz] * u_vel
        )

        # Compute Lyapunov Exponent
        # We integrate for a longer time to get a stable estimate
        # dt=1 Myr, steps=20000 (20 Gyr) for Galactic
        # dt=0.01 yr, steps=20000 (200 yr) for Solar (Scale accordingly)
        
        if req.units == 'galactic':
            dt_val = req.time_step # Myr
        else:
            # Solar system: unit is yr. 
            # If potential is MilkyWay (galactic units), we must convert yr -> Myr
            dt_q = req.time_step * u.yr
            dt_val = dt_q.to(u.Myr).value
            
        steps = 20000 
        lyap = gd.fast_lyapunov_max(w0, pot, dt=dt_val, n_steps=steps)
        
        if isinstance(lyap, tuple):
             lyap_est = lyap[0]
        else:
             lyap_est = lyap

        # lyap_est is likely a Quantity array of shape (steps, batch) or (steps,)
        # We want the final estimate (last time step)
        if hasattr(lyap_est, "shape") and len(lyap_est.shape) > 0:
             lyap_val = lyap_est[-1] # Last time step
        else:
             lyap_val = lyap_est
             
        # If it's still an array (batch dimension), take the max (most chaotic)
        if hasattr(lyap_val, "value"):
             lyap_val = lyap_val.value
        
        # Ensure python scalar
        if isinstance(lyap_val, (list, np.ndarray)):
             lyap_val = np.max(lyap_val)
             if hasattr(lyap_val, "item"):
                 lyap_val = lyap_val.item()
                 
        if hasattr(lyap_val, "item"): # numpy scalar
             lyap_val = lyap_val.item()

        # Avoid zero division
        
        # Avoid zero division
        if lyap_val > 1e-9:
             lyap_time = 1.0 / lyap_val
        else:
             lyap_time = 1.0e9 # Stable
        
        # Check chaos
        # Galactic: 14 Gyr age, so < 10 Gyr might be chaotic in context, 
        # but pure chaos usually < 1-2 Gyr (1000 Myr)
        limit = 5000.0 if req.units == 'galactic' else 5000.0 
        is_chaotic = lyap_time < limit
        
        return {
            "status": "success",
            "isChaotic": bool(is_chaotic),
            "lyapunovTime": float(lyap_time),
            "lyapExp": float(lyap_val)
        }

    except Exception as e:
        logging.error(f"Chaos analysis error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/export")
async def export_code(req: OrbitRequest):
    """
    Generates a reproducible Python script for the current configuration.
    """
    
    # Unit imports
    unit_import = "from gala.units import galactic, solarsystem"
    usys_str = "solarsystem" if req.units == 'solarsystem' else "galactic"
    u_len_str = "u.AU" if req.units == 'solarsystem' else "u.kpc"
    u_vel_str = "u.AU/u.yr" if req.units == 'solarsystem' else "u.km/u.s"
    u_time_str = "u.yr" if req.units == 'solarsystem' else "u.Myr"

    # Potential Logic
    if req.potential_type == "milkyway":
        pot_code = f"pot = gp.MilkyWayPotential(units={usys_str})"
    elif req.potential_type == "hernquist":
        pot_code = f"pot = gp.HernquistPotential(m={req.mass} * u.Msun, c=1.0*{u_len_str}, units={usys_str})"
    else:
        pot_code = f"pot = gp.KeplerPotential(m={req.mass} * u.Msun, units={usys_str})"

    script = f"""
import astropy.units as u
import gala.potential as gp
import gala.dynamics as gd
{unit_import}

# 1. Define the Potential
# Type: {req.potential_type}
{pot_code}

# 2. Define Initial Conditions
w0 = gd.PhaseSpacePosition(
    pos=[{req.x}, {req.y}, {req.z}] * {u_len_str},
    vel=[{req.vx}, {req.vy}, {req.vz}] * {u_vel_str}
)

# 3. Integrate Orbit
# Time Step: {req.time_step} {req.units}
orbit = pot.integrate_orbit(w0, dt={req.time_step} * {u_time_str}, n_steps={req.steps})

# 4. Plot (Requires matplotlib)
# orbit.plot()
    """
    return {"status": "success", "code": script.strip()}

@app.post("/integrate_evolution")
async def integrate_evolution(req: EvolutionRequest):
    """
    Integrate an orbit with time-varying potential (adiabatic evolution).
    Uses keyframes to define how the potential changes over cosmic time.
    """
    try:
        # Convert keyframes to dict format
        keyframes_dict = [
            {
                'time': kf.time,
                'mass': kf.mass,
                'disk_scale': kf.disk_scale if kf.disk_scale is not None else 1.0
            }
            for kf in req.keyframes
        ]
        
        # Validate keyframes
        if len(keyframes_dict) < 2:
            return {"status": "error", "message": "At least 2 keyframes required for evolution"}
        
        # Determine Unit System
        usys = solarsystem if req.units == 'solarsystem' else galactic
        u_len = u.AU if req.units == 'solarsystem' else u.kpc
        u_vel = u.AU/u.yr if req.units == 'solarsystem' else u.km/u.s
        
        # Define Initial Conditions
        pos0 = [req.x, req.y, req.z] * u_len
        vel0 = [req.vx, req.vy, req.vz] * u_vel
        w0 = gd.PhaseSpacePosition(pos=pos0, vel=vel0)
        
        # Integrate with evolution
        orbit = time_machine.integrate_with_evolution(
            w0=w0,
            keyframes=keyframes_dict,
            potential_type=req.potential_type,
            units=req.units,
            dt=req.time_step,
            n_steps=req.steps
        )
        
        # Extract data
        points = orbit.xyz.to(u_len).value.T.tolist()
        v_xyz = orbit.v_xyz.to(u_vel).value.T.tolist()
        
        # Compute energy drift (may be approximate for time-varying potentials)
        try:
            E = orbit.energy()
            E0 = E[0]
            energy_drift = np.abs((E - E0) / E0)
            max_error = np.max(energy_drift.value)
        except Exception as e:
            logging.warning(f"Energy computation failed (expected for time-varying potentials): {e}")
            # For time-varying potentials, energy is not conserved anyway
            max_error = None
        
        # Return evolution data
        # Also return keyframe times for visualization
        kf_times = [kf['time'] for kf in keyframes_dict]
        
        return {
            "status": "success",
            "points": points,
            "velocities": v_xyz,
            "energy_error": float(max_error) if max_error is not None else None,
            "keyframe_times": kf_times,
            "total_time": float(orbit.t[-1].value)
        }
        
    except Exception as e:
        logging.error(f"Evolution integration error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.post("/compute_potential_grid")
async def compute_grid(req: PotentialGridRequest):
    """
    Compute effective potential on a 2D grid for visualization.
    """
    try:
        # Determine Unit System
        usys = solarsystem if req.units == 'solarsystem' else galactic
        
        # Create potential
        if req.potential_type == 'milkyway':
            pot = gp.MilkyWayPotential(units=usys)
        elif req.potential_type == 'hernquist':
            u_len = u.AU if req.units == 'solarsystem' else u.kpc
            pot = gp.HernquistPotential(
                m=req.mass * u.Msun, 
                c=3.0 * u_len,  # Default scale length
                units=usys
            )
        else:  # kepler
            pot = gp.KeplerPotential(m=req.mass * u.Msun, units=usys)
        
        # Compute grid
        grid_data = potential_grid.compute_potential_grid(
            potential=pot,
            L_z=req.L_z,
            grid_size=req.grid_size,
            x_range=tuple(req.x_range),
            y_range=tuple(req.y_range),
            units_sys=usys
        )
        
        return {
            "status": "success",
            **grid_data
        }
        
    except Exception as e:
        logging.error(f"Potential grid computation error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

@app.post("/analyze_frequencies")
async def analyze_freq(req: FrequencyRequest):
    """
    Perform FFT analysis on orbit coordinates to extract frequencies.
    """
    try:
        # Convert points to numpy array
        points = np.array(req.points)
        
        # Perform frequency analysis
        result = frequency_analysis.analyze_frequencies(
            points=points,
            time_step=req.time_step,
            units=req.units
        )
        
        return {
            "status": "success",
            **result
        }
        
    except Exception as e:
        logging.error(f"Frequency analysis error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# --- Entry Point ---
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
