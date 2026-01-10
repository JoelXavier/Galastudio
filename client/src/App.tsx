import { 
  HeaderContainer, 
  Button, 
  Theme, 
  Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, ToastNotification
} from '@carbon/react';
import { 
  Share, 
  Restart, 
  Branch, 
  DocumentDownload, 
  LogoGithub, UserAvatar
} from '@carbon/icons-react';
import React, { Suspense } from 'react';
import { GalacticScene } from './components/GalacticScene';
import { PotentialSidebar } from './components/PotentialSidebar';
import { usePermalink } from './hooks/usePermalink';
import { useStore } from './store/simulationStore';
import { useAuthStore } from './store/authStore';
import { AuthModal } from './components/AuthModal';

// Lazy Load Heavy Analysis & Editor Components
const ActionSpaceMRI = React.lazy(() => import('./components/ActionSpaceMRI').then(module => ({ default: module.ActionSpaceMRI })));
const EvolutionInfoPanel = React.lazy(() => import('./components/EvolutionInfoPanel').then(module => ({ default: module.EvolutionInfoPanel })));
const FrequencySpectrometer = React.lazy(() => import('./components/FrequencySpectrometer').then(module => ({ default: module.FrequencySpectrometer })));
const ObserverPanel = React.lazy(() => import('./components/ObserverPanel').then(module => ({ default: module.ObserverPanel })));
const PhaseSpacePanel = React.lazy(() => import('./components/PhaseSpacePanel').then(module => ({ default: module.PhaseSpacePanel })));
const TutorialOverlay = React.lazy(() => import('./components/TutorialOverlay').then(module => ({ default: module.TutorialOverlay })));
const TimelineEditor = React.lazy(() => import('./components/TimelineEditor').then(module => ({ default: module.TimelineEditor })));
const PotentialLegend = React.lazy(() => import('./components/PotentialLegend').then(module => ({ default: module.PotentialLegend })));

import { ExportModal } from './components/ExportModal';
import { DataViewModal } from './components/DataViewModal';

function App() {
  // ... (keep existing hooks)
  usePermalink();

  const successMsg = useStore(state => state.successMsg);
  const error = useStore(state => state.error);
  const isIntegrating = useStore(state => state.isIntegrating);
  const expandedPanel = useStore(state => state.expandedPanel);
  const energyError = useStore(state => state.energyError);
  const potentialType = useStore(state => state.potentialType);
  const potentialParams = useStore(state => state.potentialParams);
  const integrator = useStore(state => state.integrator);
  const units = useStore(state => state.units);
  const points = useStore(state => state.points);
  const velocities = useStore(state => state.velocities);
  const viewMode = useStore(state => state.viewMode);
  const setViewMode = useStore(state => state.setViewMode);
  const integrateOrbit = useStore(state => state.integrateOrbit);
  
  // Auth Store
  const user = useAuthStore((state: any) => state.user);
  const initializeAuth = useAuthStore((state: any) => state.initializeAuth);
  const [isAuthModalOpen, setAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // Modals hoisted here for correct Z-Index stacking
  const isExportOpen = useStore(state => state.isExportOpen);
  const setExportOpen = useStore(state => state.setExportOpen);

  return (
    // Wrap in Carbon Theme (Gray 100 is set via CSS, but Theme provider helps with tokens)
    <Theme theme="g100"> 
       {/* UI Shell */}
      {viewMode === 'editor' && (
        <HeaderContainer render={() => (
            <Header aria-label="Gala Studio" className="gala-header">
                <HeaderName prefix="" href="#" style={{ 
                    fontSize: '18px', 
                    letterSpacing: '1px', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '4px'
                }} className="font-mono">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(165, 110, 255, 0.4)" strokeWidth="0.5" />
                        <ellipse cx="12" cy="12" rx="10" ry="3" stroke="#a56eff" strokeWidth="0.8" transform="rotate(0 12 12)" />
                        <ellipse cx="12" cy="12" rx="10" ry="3" stroke="#a56eff" strokeWidth="0.8" transform="rotate(60 12 12)" />
                        <ellipse cx="12" cy="12" rx="10" ry="3" stroke="#a56eff" strokeWidth="0.8" transform="rotate(120 12 12)" />
                        <circle cx="12" cy="12" r="2" fill="#ff832b" />
                    </svg>
                    <span style={{ 
                        background: 'linear-gradient(90deg, #a56eff 0%, #8d8d8d 60%, #ff832b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 400
                    }}>
                        GALA<span style={{ fontWeight: 800, marginLeft: '3px' }}>STUDIO</span>
                    </span>
                </HeaderName>
                <HeaderGlobalBar>
                    <HeaderGlobalAction aria-label="Share" tooltipAlignment="end" onClick={() => setExportOpen(true)}>
                        <Share size={20} />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label="GitHub Repository" tooltipAlignment="end">
                        <LogoGithub size={20} />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label={user ? `Signed in as ${user.email}` : "Log In"} tooltipAlignment="end" onClick={() => !user && setAuthModalOpen(true)}>
                        {user ? (
                           <UserAvatar size={20} style={{ fill: '#4caf50' }} /> // Green tint if logged in
                        ) : (
                           <UserAvatar size={20} />
                        )}
                    </HeaderGlobalAction>
                </HeaderGlobalBar>
            </Header>
        )} />
      )}
      {viewMode === 'editor' && <PotentialSidebar />}

        {/* Toast Notification Container */}
        {/* Toast Notification Container */}
        {(successMsg || error) && (
            <div style={{ position: 'absolute', top: '6rem', right: '1rem', zIndex: 11000 }}>
                {successMsg && (
                  <ToastNotification
                      kind="success"
                      title="Success"
                      subtitle={successMsg}
                      timeout={3000}
                  />
                )}
                {error && (
                  <ToastNotification
                      kind="error"
                      title="Error"
                      subtitle={error}
                      caption="Check console for details"
                      timeout={5000}
                  />
                )}
            </div>
        )}


      <main style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        height: '100vh', 
        width: '100vw',
        zIndex: 0 
      }}>
        <GalacticScene />
      </main>

      {/* Computed UI Overlays */}
      <Suspense fallback={null}>
        {viewMode === 'editor' && <ActionSpaceMRI />}
        {viewMode === 'editor' && <ObserverPanel />}
      </Suspense>
      
      {/* Split Analysis Panels */}
      
      {/* Frequency: Bottom Left */}
      <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          left: (viewMode === 'view' || expandedPanel === 'spectral') ? '20px' : '320px', 
          zIndex: expandedPanel === 'spectral' ? 12000 : 8000,
          pointerEvents: 'none',
          visibility: (expandedPanel === 'phase') ? 'hidden' : 'visible',
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-end',
          transition: 'all 0.3s ease'
      }}>
          <div style={{ pointerEvents: 'auto' }}>
            <Suspense fallback={null}>
              <FrequencySpectrometer />
            </Suspense>
          </div>
      </div>

      {/* Evolution Info: Separate from Spectral to avoid expansion overlap */}
      <div style={{
          position: 'fixed',
          bottom: '20px',
          left: (viewMode === 'view' || expandedPanel === 'spectral') ? '440px' : '740px', // Shift based on Spectral width
          zIndex: 8000,
          pointerEvents: 'none',
          visibility: expandedPanel ? 'hidden' : 'visible',
          transition: 'all 0.3s ease'
      }}>
           <div style={{ pointerEvents: 'auto' }}>
              <Suspense fallback={null}>
                <EvolutionInfoPanel />
              </Suspense>
           </div>
      </div>

      {/* Phase Space: Bottom Right */}
      <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          zIndex: expandedPanel === 'phase' ? 12000 : 8000,
          pointerEvents: 'none',
          visibility: (expandedPanel === 'spectral') ? 'hidden' : 'visible'
      }}>
          <div style={{ pointerEvents: 'auto' }}>
             <Suspense fallback={null}>
                <PhaseSpacePanel />
             </Suspense>
          </div>
      </div>

      <Suspense fallback={null}>
        {viewMode === 'editor' && <TutorialOverlay />}
        {viewMode === 'editor' && <TimelineEditor />}
      </Suspense>
      
      {!expandedPanel && (
        <div style={{ 
            position: 'fixed', 
            top: viewMode === 'view' ? '20px' : '60px', 
            left: viewMode === 'view' ? '20px' : '300px', 
            zIndex: 9001,
            transition: 'all 0.3s ease'
        }}>
            <Suspense fallback={null}>
                <PotentialLegend />
            </Suspense>
        </div>
      )}

      {/* Presentation Controls: REMOVED as per 'GitHub for Galaxies' advice */}

      {/* Hoisted Loader - Top Right, Below Header */}
      {isIntegrating && (
          <div className="gala-glass" style={{
              position: 'fixed',
              top: '60px',
              right: '20px',
              zIndex: 10000,
              padding: '8px 16px',
              border: '1px solid #33b1ff',
              color: '#33b1ff',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '12px',
              boxShadow: '0 0 10px rgba(51, 177, 255, 0.2)'
          }}>
              COMPUTING TRAJECTORY...
          </div>
      )}

      {/* Verification Badge (View Mode Only) */}
      {viewMode === 'view' && energyError !== null && (
          <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 10000,
              fontSize: '11px',
              fontFamily: 'IBM Plex Mono, monospace',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '4px',
              pointerEvents: 'none'
          }}>
              <div className="gala-glass" style={{ padding: '4px 12px', border: '1px solid rgba(165, 110, 255, 0.3)' }}>
                  <span style={{ color: '#8d8d8d', marginRight: '8px' }}>ENERGY CONSERVATION:</span>
                  <span style={{ 
                      color: energyError < 1e-6 ? '#24a148' : '#f1c21b',
                      fontWeight: 600
                  }}>
                      {energyError.toExponential(2)}
                  </span>
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Numerical Validation Asset
              </div>

              {/* Experimental Specs Overlay */}
              <div className="gala-glass" style={{ 
                  marginTop: '12px',
                  padding: '8px 12px', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  minWidth: '220px',
                  pointerEvents: 'auto'
              }}>
                  {/* Global Actions for Viewers */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <Button 
                        size="sm" 
                        kind="primary" 
                        renderIcon={Branch}
                        onClick={() => setViewMode('editor')}
                        style={{ flex: 1 }}
                      >
                          Open in Studio
                      </Button>
                      <Button 
                        size="sm" 
                        kind="ghost" 
                        hasIconOnly 
                        renderIcon={DocumentDownload}
                        iconDescription="Export Phase Data (.csv)"
                        tooltipPosition="bottom"
                        onClick={() => useStore.getState().triggerCsvDownload()}
                        style={{ color: '#f4f4f4' }}
                      />
                       <Button 
                        size="sm" 
                        kind="ghost" 
                        hasIconOnly 
                        renderIcon={Restart}
                        iconDescription="Restart Simulation"
                        tooltipPosition="bottom"
                        onClick={() => integrateOrbit()}
                        style={{ color: '#f4f4f4' }}
                      />
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(165, 110, 255, 0.8)', letterSpacing: '0.5px', marginBottom: '2px' }}>EXPERIMENTAL SPECIFICATIONS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                      <span style={{ color: '#8d8d8d' }}>POTENTIAL:</span>
                      <span style={{ color: '#f4f4f4', textTransform: 'uppercase' }}>{potentialType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                      <span style={{ color: '#8d8d8d' }}>INTEGRATOR:</span>
                      <span style={{ color: '#f4f4f4', textTransform: 'uppercase' }}>{integrator}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                      <span style={{ color: '#8d8d8d' }}>UNIT SYSTEM:</span>
                      <span style={{ color: '#f4f4f4', textTransform: 'uppercase' }}>{units}</span>
                  </div>

                  {/* Physical Properties Section */}
                  <div style={{ fontSize: '9px', color: 'rgba(165, 110, 255, 0.8)', letterSpacing: '0.5px', marginTop: '8px', marginBottom: '2px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>PHYSICAL PARAMETERS</div>
                  {Object.entries(potentialParams).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '10px' }}>
                          <span style={{ color: '#6f6f6f', textTransform: 'uppercase' }}>{key.replace('_', ' ')}:</span>
                          <span style={{ color: '#e0e0e0' }}>{typeof value === 'number' ? value.toExponential(2) : value}</span>
                      </div>
                  ))}

                  {/* Initial State Section */}
                  {points.length > 0 && (
                      <>
                          <div style={{ fontSize: '9px', color: 'rgba(165, 110, 255, 0.8)', letterSpacing: '0.5px', marginTop: '8px', marginBottom: '2px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>INITIAL KINEMATICS</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px' }}>
                              <div style={{ color: '#6f6f6f' }}>X: <span style={{ color: '#e0e0e0' }}>{points[0][0].toFixed(2)}</span></div>
                              <div style={{ color: '#6f6f6f' }}>VX: <span style={{ color: '#e0e0e0' }}>{velocities[0]?.[0].toFixed(1)}</span></div>
                              <div style={{ color: '#6f6f6f' }}>Y: <span style={{ color: '#e0e0e0' }}>{points[0][1].toFixed(2)}</span></div>
                              <div style={{ color: '#6f6f6f' }}>VY: <span style={{ color: '#e0e0e0' }}>{velocities[0]?.[1].toFixed(1)}</span></div>
                              <div style={{ color: '#6f6f6f' }}>Z: <span style={{ color: '#e0e0e0' }}>{points[0][2].toFixed(2)}</span></div>
                              <div style={{ color: '#6f6f6f' }}>VZ: <span style={{ color: '#e0e0e0' }}>{velocities[0]?.[2].toFixed(1)}</span></div>
                          </div>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Global Modals (Highest Z-Index) */}
      <ExportModal open={isExportOpen} setOpen={setExportOpen} />
      <DataViewModal />
      
      <AuthModal isOpen={isAuthModalOpen} setIsOpen={setAuthModalOpen} />

      {/* DEBUG BANNER: Remove after fixing deployment */}
      <div style={{
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        background: '#161616', 
        color: '#fff', 
        padding: '12px', 
        zIndex: 99999,
        fontSize: '12px',
        fontFamily: 'monospace',
        borderTop: '1px solid #ff0000',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <span><strong>DEBUG:</strong></span>
        <span>URL: {import.meta.env.VITE_SUPABASE_URL ? (import.meta.env.VITE_SUPABASE_URL.includes('"') ? '❌ HAS QUOTES' : '✅ SET') : '❌ MISSING'}</span>
        <span>KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? (import.meta.env.VITE_SUPABASE_ANON_KEY.includes('"') ? '❌ HAS QUOTES' : (import.meta.env.VITE_SUPABASE_ANON_KEY.length > 20 ? '✅ SET' : '❌ SHORT')) : '❌ MISSING'}</span>
        <span>API: {import.meta.env.VITE_API_BASE_URL ? (import.meta.env.VITE_API_BASE_URL.includes('"') ? '❌ HAS QUOTES' : '✅ SET') : '❌ MISSING'}</span>
      </div>
    </Theme>
  );
}

export default App;
