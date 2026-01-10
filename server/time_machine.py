"""
Time-Machine Editor: Adiabatic Evolution Engine

This module implements segmented orbit integration with time-varying potentials.
Users can define keyframes at different cosmic times, and the system interpolates
between them to simulate secular evolution (disk growth, bar formation, etc.).

Scientific Basis:
- Adiabatic Invariance: If potential changes slowly (τ_change >> τ_orbit), 
  action variables are approximately conserved.
- This allows us to study how orbits respond to galaxy evolution over Gyr timescales.
"""

import numpy as np
from scipy.interpolate import interp1d
import astropy.units as u
import gala.potential as gp
import gala.dynamics as gd
from typing import List, Dict, Any

def interpolate_keyframes(keyframes: List[Dict], t_eval: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Interpolate potential parameters between keyframes.
    
    Parameters
    ----------
    keyframes : List[Dict]
        List of keyframe dictionaries, each with 'time' and parameter values.
        Example: [{'time': 0.0, 'mass': 1.0, 'disk_scale': 3.0}, 
                  {'time': 5.0, 'mass': 1.5, 'disk_scale': 4.0}]
    t_eval : np.ndarray
        Times at which to evaluate interpolated parameters (in Gyr or yr).
    
    Returns
    -------
    params : Dict[str, np.ndarray]
        Interpolated parameters at each t_eval time.
    """
    # Sort keyframes by time
    keyframes = sorted(keyframes, key=lambda k: k['time'])
    
    # Extract times
    times = np.array([kf['time'] for kf in keyframes])
    
    # Get all parameter names (excluding 'time')
    param_names = [k for k in keyframes[0].keys() if k != 'time']
    
    # Interpolate each parameter
    params = {}
    for pname in param_names:
        values = np.array([kf[pname] for kf in keyframes])
        
        # Use linear interpolation (could upgrade to cubic for smoother evolution)
        interp_func = interp1d(times, values, kind='linear', 
                               bounds_error=False, fill_value='extrapolate')
        params[pname] = interp_func(t_eval)
    
    return params

def create_potential_at_time(params: Dict[str, float], potential_type: str, units):
    """
    Create a Gala potential with the given parameters.
    
    Parameters
    ----------
    params : Dict[str, float]
        Potential parameters at a specific time.
    potential_type : str
        Type of potential ('kepler', 'milkyway', 'hernquist').
    units : UnitSystem or str
        Gala unit system or 'galactic'/'solarsystem'.
    
    Returns
    -------
    potential : gala.potential.PotentialBase
        The constructed potential.
    """
    from gala.units import galactic, solarsystem
    
    # Handle both string and UnitSystem types
    if isinstance(units, str):
        usys = solarsystem if units == 'solarsystem' else galactic
    else:
        usys = units
    
    u_len = u.AU if (isinstance(units, str) and units == 'solarsystem') or (hasattr(usys, 'name') and 'solar' in str(usys).lower()) else u.kpc
    
    if potential_type == 'milkyway':
        # For MilkyWay, we can't easily modify parameters, so we use a composite
        # Simplified: just scale the mass
        # In a real implementation, we'd build a custom composite potential
        pot = gp.MilkyWayPotential(units=usys)
        # Note: MilkyWayPotential doesn't support easy parameter modification
        # For demo, we'll just return it as-is
        # TODO: Build custom composite for full control
        return pot
    elif potential_type == 'hernquist':
        mass = params.get('mass', 1.0) * u.Msun
        scale = params.get('disk_scale', 1.0) * u_len
        return gp.HernquistPotential(m=mass, c=scale, units=usys)
    else:  # kepler
        mass = params.get('mass', 1.0) * u.Msun
        return gp.KeplerPotential(m=mass, units=usys)

def integrate_with_evolution(
    w0,
    keyframes: List[Dict],
    potential_type: str,
    units,
    dt: float,
    n_steps: int
) -> gd.Orbit:
    """
    Integrate an orbit with time-varying potential.
    
    Strategy:
    1. Divide total time into segments
    2. For each segment, interpolate potential parameters
    3. Integrate with that potential
    4. Use final state as initial condition for next segment
    
    Parameters
    ----------
    w0 : PhaseSpacePosition
        Initial conditions.
    keyframes : List[Dict]
        Keyframe definitions.
    potential_type : str
        Potential type.
    units : str
        'galactic' or 'solarsystem'.
    dt : float
        Time step.
    n_steps : int
        Total number of steps.
    
    Returns
    -------
    orbit : Orbit
        The evolved orbit.
    """
    from gala.units import galactic, solarsystem
    usys = solarsystem if units == 'solarsystem' else galactic
    u_time = u.yr if units == 'solarsystem' else u.Myr
    
    # Total time span
    t_total = dt * n_steps
    
    # Number of segments (one per keyframe interval)
    n_keyframes = len(keyframes)
    if n_keyframes < 2:
        # No evolution, just integrate normally
        params = keyframes[0] if keyframes else {'mass': 1.0}
        pot = create_potential_at_time(params, potential_type, usys)
        return pot.integrate_orbit(w0, dt=dt * u_time, n_steps=n_steps)
    
    # Segment the integration
    # We'll integrate in chunks, updating the potential at each keyframe boundary
    kf_times = np.array([kf['time'] for kf in sorted(keyframes, key=lambda k: k['time'])])
    
    # Create time segments
    segments = []
    for i in range(len(kf_times) - 1):
        t_start = kf_times[i]
        t_end = kf_times[i + 1]
        segments.append((t_start, t_end))
    
    # Integrate each segment
    orbits = []
    current_w = w0
    
    for i, (t_start, t_end) in enumerate(segments):
        # Interpolate parameters for this segment (use midpoint)
        t_mid = (t_start + t_end) / 2.0
        t_eval = np.array([t_mid])
        params_interp = interpolate_keyframes(keyframes, t_eval)
        
        # Extract parameters at midpoint
        params_dict = {k: v[0] for k, v in params_interp.items()}
        
        # Create potential
        pot = create_potential_at_time(params_dict, potential_type, usys)
        
        # Determine number of steps for this segment
        segment_duration = t_end - t_start
        segment_steps = int(segment_duration / dt)
        
        if segment_steps > 0:
            # Integrate
            orbit_segment = pot.integrate_orbit(current_w, dt=dt * u_time, n_steps=segment_steps)
            orbits.append(orbit_segment)
            
            # Update initial conditions for next segment
            current_w = orbit_segment[-1]
    
    # Concatenate all orbit segments
    if len(orbits) == 0:
        # Fallback
        params = keyframes[0]
        pot = create_potential_at_time(params, potential_type, usys)
        return pot.integrate_orbit(w0, dt=dt * u_time, n_steps=n_steps)
    
    # Combine orbits
    # This is tricky - we need to concatenate the phase space positions
    combined_pos = np.concatenate([orb.pos.xyz.value for orb in orbits], axis=1)
    combined_vel = np.concatenate([orb.vel.d_xyz.value for orb in orbits], axis=1)
    
    # Reconstruct orbit
    from gala.dynamics import PhaseSpacePosition, Orbit
    combined_w = PhaseSpacePosition(
        pos=combined_pos * orbits[0].pos.xyz.unit,
        vel=combined_vel * orbits[0].vel.d_xyz.unit
    )
    
    # Create time array
    combined_t = np.concatenate([orb.t.value for orb in orbits])
    
    # Use the last potential for the combined orbit
    # This allows energy computation (though it's approximate since potential varied)
    final_pot = create_potential_at_time(
        {k: v[0] for k, v in interpolate_keyframes(keyframes, np.array([keyframes[-1]['time']])).items()},
        potential_type,
        usys
    )
    
    return Orbit(
        pos=combined_w.pos, 
        vel=combined_w.vel, 
        t=combined_t * orbits[0].t.unit,
        potential=final_pot,
        frame=orbits[0].frame
    )

