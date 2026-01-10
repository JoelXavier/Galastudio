"""
Effective Potential Grid Computation

Computes a 2D grid of effective potential values for visualization.
The effective potential includes both gravitational and centrifugal terms.
"""

import numpy as np
import astropy.units as u
import gala.potential as gp
from gala.units import galactic, solarsystem

def compute_potential_grid(
    potential,
    L_z: float,  # Angular momentum (kpc * km/s or AU * km/s)
    grid_size: int = 100,
    x_range: tuple = (-20, 20),
    y_range: tuple = (-20, 20),
    units_sys = None
):
    """
    Compute effective potential on a 2D grid.
    
    Parameters
    ----------
    potential : gala.potential
        The gravitational potential
    L_z : float
        Angular momentum (conserved quantity)
    grid_size : int
        Number of grid points per dimension
    x_range : tuple
        (min, max) for x-axis
    y_range : tuple
        (min, max) for y-axis
    units_sys : UnitSystem
        Gala unit system
        
    Returns
    -------
    dict with:
        - grid: 2D array of potential values
        - x_coords: 1D array of x coordinates
        - y_coords: 1D array of y coordinates
        - min_potential: minimum value
        - max_potential: maximum value
    """
    # Create grid
    x = np.linspace(x_range[0], x_range[1], grid_size)
    y = np.linspace(y_range[0], y_range[1], grid_size)
    X, Y = np.meshgrid(x, y)
    
    # Determine units
    if units_sys is None or units_sys == galactic:
        u_len = u.kpc
    else:
        u_len = u.AU
    
    # Compute gravitational potential at z=0
    # Shape: (grid_size, grid_size)
    pos = np.array([X.flatten(), Y.flatten(), np.zeros_like(X.flatten())]) * u_len
    
    # Evaluate potential
    phi_grav = potential.energy(pos).value.reshape(grid_size, grid_size)
    
    # Compute effective potential: Φ_eff = Φ + L_z^2 / (2 * R^2)
    # R = sqrt(x^2 + y^2)
    R = np.sqrt(X**2 + Y**2)
    
    # Avoid division by zero at origin
    R_safe = np.where(R < 0.01, 0.01, R)
    
    # Centrifugal term
    phi_centrifugal = (L_z**2) / (2 * R_safe**2)
    
    # Total effective potential
    phi_eff = phi_grav + phi_centrifugal
    
    # Handle infinities/NaNs
    phi_eff = np.nan_to_num(phi_eff, nan=0.0, posinf=0.0, neginf=-1e10)
    
    return {
        "grid": phi_eff.tolist(),
        "x_coords": x.tolist(),
        "y_coords": y.tolist(),
        "min_potential": float(np.min(phi_eff)),
        "max_potential": float(np.max(phi_eff))
    }
