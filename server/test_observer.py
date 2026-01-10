import numpy as np
import astropy.coordinates as coord
import astropy.units as u
from gala.dynamics import PhaseSpacePosition

def test_observer_projection():
    # Example Galactic Center coordinates (kpc)
    # Let's say a point is at (8, 0, 0)
    pos = [8.0, 2.0, 0.5] * u.kpc
    
    # Define Galactocentric frame (default Sun at -8.1, 0, 0.02)
    # Note: Gala uses a standard Galactocentric frame.
    # We need to be careful about the Sun's position.
    # In GalaStudio, we've been using a right-handed system?
    # Actually, let's just use the standard Astropy transformation.
    
    gc_coords = coord.Galactocentric(x=pos[0], y=pos[1], z=pos[2])
    
    # Transform to Galactic (l, b, distance)
    # This is from the Sun's perspective
    galactic = gc_coords.transform_to(coord.Galactic())
    
    print(f"L: {galactic.l.degree:.2f} deg")
    print(f"B: {galactic.b.degree:.2f} deg")
    print(f"Dist: {galactic.distance:.2f}")

if __name__ == "__main__":
    test_observer_projection()
