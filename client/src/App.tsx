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
  LogoGithub, UserAvatar, Book
} from '@carbon/icons-react';
import React, { Suspense } from 'react';
import { GalacticScene } from './components/GalacticScene';
import { PotentialSidebar } from './components/PotentialSidebar';
import { usePermalink } from './hooks/usePermalink';
import { useStore } from './store/simulationStore';
import { useAuthStore } from './store/authStore';
import { AuthModal } from './components/AuthModal';
import { DocumentationModal } from './components/DocumentationModal';
import { SpecificationHud } from './components/SpecificationHud';
// ... existing lazy imports

// Lazy Load Heavy Analysis & Editor Components
const ActionSpaceMRI = React.lazy(() => import('./components/ActionSpaceMRI').then(module => ({ default: module.ActionSpaceMRI })));
const FrequencySpectrometer = React.lazy(() => import('./components/FrequencySpectrometer').then(module => ({ default: module.FrequencySpectrometer })));
const ObserverPanel = React.lazy(() => import('./components/ObserverPanel').then(module => ({ default: module.ObserverPanel })));
const PhaseSpacePanel = React.lazy(() => import('./components/PhaseSpacePanel').then(module => ({ default: module.PhaseSpacePanel })));
const TutorialOverlay = React.lazy(() => import('./components/TutorialOverlay').then(module => ({ default: module.TutorialOverlay })));
const TimelineEditor = React.lazy(() => import('./components/TimelineEditor').then(module => ({ default: module.TimelineEditor })));

import { ExportModal } from './components/ExportModal';
import { DataViewModal } from './components/DataViewModal';

function App() {
  // ... (keep existing hooks)
  usePermalink();

  const successMsg = useStore(state => state.successMsg);
  const error = useStore(state => state.error);
  const isIntegrating = useStore(state => state.isIntegrating);
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
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const [isAuthModalOpen, setAuthModalOpen] = React.useState(false);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  // Modals hoisted here for correct Z-Index stacking
  const isExportOpen = useStore(state => state.isExportOpen);
  const setExportOpen = useStore(state => state.setExportOpen);
  const setDocsOpen = useStore(state => state.setDocsOpen);

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
                        <circle cx="12" cy="12" r="9" stroke="#A56EFF" strokeWidth="1" opacity="0.3" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#A56EFF" strokeWidth="1" transform="rotate(45 12 12)" />
                        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#A56EFF" strokeWidth="1" transform="rotate(-45 12 12)" />
                        <circle cx="12" cy="12" r="2" fill="#ff832b" />
                    </svg>
                    <span style={{ 
                        background: 'linear-gradient(90deg, #A56EFF 0%, #FF832B 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 400
                    }}>
                        GALA<span style={{ fontWeight: 800, marginLeft: '3px' }}>STUDIO</span>
                    </span>
                </HeaderName>
                <HeaderGlobalBar>
                    <HeaderGlobalAction aria-label="Documentation" tooltipAlignment="end" onClick={() => setDocsOpen(true)}>
                        <Book size={20} />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label="Share" tooltipAlignment="end" onClick={() => setExportOpen(true)}>
                        <Share size={20} />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label="GitHub Repository" tooltipAlignment="end" onClick={() => window.open('https://github.com/JoelXavier/Galastudio', '_blank')}>
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
            <div style={{ position: 'absolute', top: '80px', right: '1rem', zIndex: 15000 }}>
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


      <main className="gala-grid-container" style={{ 
        position: 'fixed', 
        top: '48px', // Account for Carbon Header
        left: '300px', // Account for Sidebar
        height: 'calc(100vh - 48px)', 
        width: 'calc(100vw - 300px)',
        zIndex: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)',
        gridTemplateRows: '2fr 1fr',
        gap: '1px', // Dashboard-style dividers
        background: 'rgba(255, 255, 255, 0.05)', // Divider colors
        overflow: 'hidden'
      }}>
        {/* Top Left: Specifications (Col 1-6) */}
        <div style={{ gridColumn: 'span 6', background: '#161616', overflowY: 'auto', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
           <SpecificationHud />
        </div>

        {/* Top Right: Hero Canvas + Action Space (Col 7-16) */}
        <div style={{ gridColumn: 'span 10', position: 'relative', background: '#161616' }}>
            <GalacticScene />
            {viewMode === 'editor' && (
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '300px' }}>
                    <Suspense fallback={null}>
                        <ActionSpaceMRI />
                    </Suspense>
                </div>
            )}
        </div>

        {/* Bottom Left: Spectral Analysis (Col 1-6) */}
        <div style={{ gridColumn: 'span 6', background: '#161616', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderRight: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Suspense fallback={null}>
                <FrequencySpectrometer />
            </Suspense>
        </div>

        {/* Bottom Right: Phase Space (Col 7-16) */}
        <div style={{ gridColumn: 'span 10', background: '#161616', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <Suspense fallback={null}>
                <PhaseSpacePanel />
            </Suspense>
        </div>
      </main>

      {/* Overlays (Tooltips, Modals, Tutorials) */}
      <Suspense fallback={null}>
        {viewMode === 'editor' && <ObserverPanel />}
        {viewMode === 'editor' && <TutorialOverlay />}
        {viewMode === 'editor' && <TimelineEditor />}
      </Suspense>

      {/* Verification Badge & Progress */}
      {isIntegrating && (
          <div className="gala-glass" style={{
              position: 'fixed',
              bottom: '20px',
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
              <div className="gala-glass" style={{ padding: '4px 12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
      <DocumentationModal />
      
      <AuthModal isOpen={isAuthModalOpen} setIsOpen={setAuthModalOpen} />
    </Theme>
  );
}

export default App;
