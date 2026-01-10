
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
        
        # Compute energy drift
        E = orbit.energy()
        E0 = E[0]
        energy_drift = np.abs((E - E0) / E0)
        max_error = np.max(energy_drift.value)
        
        # Return evolution data
        # Also return keyframe times for visualization
        kf_times = [kf['time'] for kf in keyframes_dict]
        
        return {
            "status": "success",
            "points": points,
            "velocities": v_xyz,
            "energy_error": float(max_error),
            "keyframe_times": kf_times,
            "total_time": float(orbit.t[-1].value)
        }
        
    except Exception as e:
        logging.error(f"Evolution integration error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
