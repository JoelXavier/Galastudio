import astropy.units as u
import gala.potential as gp
import gala.dynamics as gd
from gala.units import galactic
import numpy as np
import traceback

def test_chaos():
    print("Setting up potential...")
    pot = gp.MilkyWayPotential(units=galactic)
    
    print("Setting up PhaseSpacePosition...")
    w0 = gd.PhaseSpacePosition(
        pos=[0.5, 0, 0] * u.kpc,
        vel=[150, 100, 50] * u.km/u.s
    )
    
    dt = 0.1 # Myr (Unitless)
    steps = 2000
    
    print("Running fast_lyapunov_max...")
    try:
        lyap = gd.fast_lyapunov_max(w0, pot, dt=dt, n_steps=steps)
        print(f"Lyap raw type: {type(lyap)}")
        print(f"Lyap raw value: {lyap}")
        
        if hasattr(lyap, "value"):
            lyap_val = lyap.value
            print(f"Lyap .value type: {type(lyap_val)}")
            print(f"Lyap .value: {lyap_val}")
        else:
            lyap_val = lyap
            
        lyap_time = 1.0 / lyap_val if lyap_val > 1e-9 else 1.0e9
        print(f"Lyap time: {lyap_time}")
        
        print("Success so far. Checking float conversion...")
        print(f"Float Lyap Time: {float(lyap_time)}")
        
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    test_chaos()
