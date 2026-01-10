"""
Frequency Analysis Module

Performs FFT analysis on orbital coordinates to extract fundamental frequencies
and detect resonances.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional

def analyze_frequencies(
    points: np.ndarray,
    time_step: float,
    units: str = "galactic"
) -> Dict:
    """
    Perform FFT analysis on orbit coordinates.
    
    Parameters
    ----------
    points : np.ndarray
        Orbit coordinates, shape (n_steps, 3) for [x, y, z]
    time_step : float
        Time step between points (Myr or yr)
    units : str
        "galactic" or "solarsystem"
        
    Returns
    -------
    dict with:
        - frequencies: array of frequencies
        - power_x, power_y, power_z: power spectra
        - dominant_freq_x, dominant_freq_y, dominant_freq_z: peak frequencies
        - resonance_ratio: string like "2:1" if resonance detected
        - is_resonant: boolean
    """
    n_points = len(points)
    
    # Extract coordinates
    x = points[:, 0]
    y = points[:, 1]
    z = points[:, 2]
    
    # Compute FFT for each coordinate
    fft_x = np.fft.fft(x)
    fft_y = np.fft.fft(y)
    fft_z = np.fft.fft(z)
    
    # Compute power spectrum (magnitude squared)
    power_x = np.abs(fft_x)**2
    power_y = np.abs(fft_y)**2
    power_z = np.abs(fft_z)**2
    
    # Frequency array
    # Sampling frequency = 1 / time_step
    # For galactic: time_step in Myr, freq in 1/Myr
    # For solar: time_step in yr, freq in 1/yr
    freq = np.fft.fftfreq(n_points, d=time_step)
    
    # Only keep positive frequencies (FFT is symmetric)
    positive_freq_idx = freq > 0
    freq = freq[positive_freq_idx]
    power_x = power_x[positive_freq_idx]
    power_y = power_y[positive_freq_idx]
    power_z = power_z[positive_freq_idx]
    
    # Find dominant frequencies (peaks)
    # Ignore DC component (first element)
    if len(power_x) > 1:
        dominant_idx_x = np.argmax(power_x[1:]) + 1
        dominant_idx_y = np.argmax(power_y[1:]) + 1
        dominant_idx_z = np.argmax(power_z[1:]) + 1
        
        dominant_freq_x = freq[dominant_idx_x]
        dominant_freq_y = freq[dominant_idx_y]
        dominant_freq_z = freq[dominant_idx_z]
    else:
        dominant_freq_x = 0.0
        dominant_freq_y = 0.0
        dominant_freq_z = 0.0
    
    # Detect resonances
    resonance_ratio, resonance_label, is_resonant = detect_resonance(
        dominant_freq_x, dominant_freq_y, dominant_freq_z
    )
    
    return {
        "frequencies": freq.tolist(),
        "power_x": power_x.tolist(),
        "power_y": power_y.tolist(),
        "power_z": power_z.tolist(),
        "dominant_freq_x": float(dominant_freq_x),
        "dominant_freq_y": float(dominant_freq_y),
        "dominant_freq_z": float(dominant_freq_z),
        "resonance_ratio": resonance_ratio,
        "resonance_label": resonance_label,
        "is_resonant": is_resonant
    }


def detect_resonance(
    freq_x: float,
    freq_y: float,
    freq_z: float,
    tolerance: float = 0.1
) -> Tuple[Optional[str], Optional[str], bool]:
    """
    Detect if frequencies form simple integer ratios (resonances).
    
    Returns
    -------
    (ratio_string, label, is_resonant)
        e.g., ("2:1", "Ωx:Ωy", True)
    """
    # Avoid division by zero
    if freq_y == 0 or freq_z == 0:
        return None, None, False
    
    # Check common resonances
    resonances = [
        (1, 1), (2, 1), (3, 2), (3, 1), (4, 3), (5, 2), (5, 3), (5, 4)
    ]
    
    # Check all pairwise ratios
    ratios_to_check = [
        (freq_x / freq_y, "Ωx:Ωy"),
        (freq_x / freq_z, "Ωx:Ωz"),
        (freq_y / freq_z, "Ωy:Ωz")
    ]
    
    for ratio_value, label in ratios_to_check:
        for n, d in resonances:
            expected_ratio = n / d
            if abs(ratio_value - expected_ratio) / expected_ratio < tolerance:
                return f"{n}:{d}", label, True
    
    return None, None, False
