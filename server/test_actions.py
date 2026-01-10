import numpy as np
import gala.potential as gp
import gala.dynamics as gd
from astropy import units as u

def test_actions():
    # Setup Milky Way
    pot = gp.MilkyWayPotential()
    
    # Orbit
    w0 = gd.PhaseSpacePosition(pos=[8.0, 0, 0.1]*u.kpc,
                              vel=[0, 220, 10]*u.km/u.s)
    orbit = pot.integrate_orbit(w0, dt=1.0*u.Myr, n_steps=1000)
    
    print("Computing actions via O2GF...")
    try:
        # Fit a toy isochrone potential
        toy_pot = gd.fit_isochrone(orbit)
        print("Toy Potential fitted:", toy_pot)
        
        # Find actions
        result = gd.find_actions_o2gf(orbit, N_max=6, toy_potential=toy_pot)
        print("O2GF Actions (mean):", result['actions'].mean(axis=1))
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("O2GF failed:", e)

if __name__ == "__main__":
    test_actions()
