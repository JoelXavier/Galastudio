# Gala Studio

**A professional-grade laboratory for exploring the invisible forces that shape galaxies.**

Gala Studio is a web-based interface for Galactic Dynamics simulation. It transforms abstract equations into a tangible, interactive playground, bridging the gap between high-performance scientific computing and intuitive visual exploration.

 <img width="1728" height="994" alt="Galastudio preview" src="https://github.com/user-attachments/assets/09f61281-63d9-4f62-850d-88652ff0a36a" />

Go for a spin: https://galastudio.vercel.app

## 🚀 Overview

Typically, studying galactic dynamics requires writing Python scripts, waiting for simulations to run, and plotting static graphs. This feedback loop is often too slow for building deep intuition.

**Gala Studio changes the medium.** By combining optimistic client-side physics with a robust Python backend, it allows researchers and students to:

- **Touch the chaos**: Drag sliders and watch orbits evolve in real-time.
- **See the invisible**: Visualize phase space structures and resonances that are hidden in standard coordinate plots.
- **Quantify stability**: Instantly compute Lyapunov Exponents to measure the "Butterfly Effect" of a specific orbit.

## ✨ Key Capabilities

- **Interactive Dynamics**: Adjust potential parameters (Mass, Velocity, Position) and watch the trajectory update instantly. Powered by a custom Leapfrog integrator (`kepler.ts`) synced with the backend.
- **Chaos Detection**: Real-time calculation of Lyapunov Exponents to identify non-linear behavior and quantify orbital stability.
- **Phase Space Tomography**: "Medical-grade" scans of the orbit's velocity structure, revealing hidden resonances and islands of stability.
- **Spectral Analysis**: Decompose orbits into their fundamental frequencies ($\Omega_\phi$) to characterize their dynamical history.
- **Adiabatic Evolution**: Use the Time-Machine Editor to define keyframes and simulate how an orbit evolves as the galaxy changes over cosmic time.

## 🛠️ Technology Stack

Gala Studio utilizes a hybrid architecture designed for both speed and scientific accuracy.

### Frontend (The Orchestrator)

- **React & Zustand**: Manages complex simulation state, camera controls, and UI visibility.
- **Three.js (React Three Fiber)**: Renders the 3D void, star fields, and orbital lines at 60fps.
- **Optimistic Integration**: A lightweight JavaScript physics engine runs locally to provide immediate visual feedback while the server computes high-precision data.
- **Carbon Design System**: Provides a professional, research-grade UI aesthetic.

### Backend (The Number Cruncher)

- **Python & FastAPI**: A high-performance API that handles heavy simulation requests.
- **Gala & Astropy**: Industry-standard libraries for gravitational potentials, unit handling, and numerical integration.
- **MessagePack**: Data is transmitted as binary buffers rather than JSON, making the transfer of 100,000+ orbit points up to 70% faster.

## 📦 Installation

To run Gala Studio locally, you'll need **Python 3.10+** and **Node.js 18+**.

### 1. Clone the Repository

```bash
git clone https://github.com/JoelXavier/Galastudio.git
cd Galastudio
```

### 2. Start the Backend (Server)

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The server will start at `http://localhost:8000`.

### 3. Start the Frontend (Client)

Open a new terminal window:

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 🔭 Attribution

This tool is built upon **[Gala Dynamics](http://gala.adrian.pw/)**, an Astropy-affiliated Python package designed for Galactic Dynamics research.

**Gala Dynamics** is developed by researchers at the **Flatiron Institute**, led by [Adrian Price-Whelan](http://adrian.pw/). It provides the core efficient tools for performing common tasks needed in Galactic Dynamics, such as gravitational potential evaluations and orbit integrations. Gala Studio relies on this robust foundation for all its scientific computations. Gala Studio was designed and built by Joel Guerrero, a UI/UX designer at the Simons Foundation. For any questions, reach out to Joel at Joelxguerrero@gmail.com

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
