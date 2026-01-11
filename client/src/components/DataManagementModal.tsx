import React, { useEffect, useState } from 'react';
import { Modal, CodeSnippet, Loading, Button, ContentSwitcher, Switch, TextArea, InlineNotification } from '@carbon/react';
import { Share, Download, DocumentExport, Save, Checkmark } from '@carbon/icons-react';
import { useStore } from '../store/simulationStore';

interface DataManagementModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ open, setOpen }) => {
    const exportPythonCode = useStore(state => state.exportPythonCode);
    const serializeState = useStore(state => state.serializeState);
    const importSimulation = useStore(state => state.importSimulation);
    const triggerGltfDownload = useStore(state => state.triggerGltfDownload);
    
    const [pythonCode, setPythonCode] = useState<string>('');
    const [jsonConfig, setJsonConfig] = useState<string>('');
    const [importText, setImportText] = useState<string>('');
    
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);

    const handleShareLink = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'view');
        navigator.clipboard.writeText(url.toString());
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleImport = async () => {
        if (!importText.trim()) return;
        setImporting(true);
        setImportError(null);
        
        const success = await importSimulation(importText);
        
        if (success) {
            setImportSuccess(true);
            setTimeout(() => {
                setImportSuccess(false);
                setOpen(false);
                setImportText('');
            }, 1500);
        } else {
            setImportError("Invalid simulation data. Check the JSON format.");
        }
        setImporting(false);
    };

    useEffect(() => {
        let mounted = true;
        if (open) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const script = await exportPythonCode();
                    const json = serializeState();
                    if (mounted) {
                        setPythonCode(script);
                        setJsonConfig(json);
                    }
                } finally {
                    if (mounted) {
                        setLoading(false);
                    }
                }
            };
            fetchData();
        }
        return () => { mounted = false; };
    }, [open, exportPythonCode, serializeState]);

    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    
    // ... (keep existing imports and state)

    return (
        <Modal
            open={open}
            onRequestClose={() => setOpen(false)}
            modalHeading="Data Portability Hub"
            modalLabel="Reproduce & Share"
            primaryButtonText="Close"
            onRequestSubmit={() => setOpen(false)}
            size="lg"
            passiveModal={false}
        >
            <div style={{ marginBottom: '1.5rem' }}>
                <ContentSwitcher size="md" onChange={(e: any) => setActiveTab(e.name as 'export' | 'import')} selectedIndex={activeTab === 'export' ? 0 : 1}>
                    <Switch name="export" text="Export Configuration" onClick={() => setActiveTab('export')} />
                    <Switch name="import" text="Import Simulation" onClick={() => setActiveTab('import')} />
                </ContentSwitcher>
            </div>

            {activeTab === 'export' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <Button 
                            kind="secondary" 
                            renderIcon={Share} 
                            onClick={handleShareLink}
                            size="md"
                        >
                            {copySuccess ? "Link Copied!" : "Copy Share Link"}
                        </Button>
                        <Button 
                            kind="primary" 
                            renderIcon={Download} 
                            onClick={triggerGltfDownload}
                            size="md"
                        >
                            Download 3D Model (.glb)
                        </Button>
                    </div>

                    <section style={{ borderTop: '1px solid #393939', paddingTop: '1rem', marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={20} /> JSON Configuration
                        </h4>
                        <p style={{ marginBottom: '1rem', fontSize: '13px', color: '#8d8d8d' }}>
                            The exact state of your simulation. Copy this to share or re-import later.
                        </p>
                        <CodeSnippet type="multi" feedback="Copied to clipboard">
                            {jsonConfig}
                        </CodeSnippet>
                    </section>

                    <section style={{ borderTop: '1px solid #393939', paddingTop: '1rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DocumentExport size={20} /> Python Script
                        </h4>
                        <p style={{ marginBottom: '1rem', fontSize: '13px', color: '#8d8d8d' }}>
                            Reproduce this orbit using the <code>gala</code> Python library.
                        </p>
                        {loading ? (
                            <div style={{ minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loading withOverlay={false} />
                            </div>
                        ) : (
                            <CodeSnippet type="multi" feedback="Copied to clipboard">
                                {pythonCode}
                            </CodeSnippet>
                        )}
                    </section>
                </div>
            )}
            
            {activeTab === 'import' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ marginBottom: '1.5rem', fontSize: '14px', color: '#e0e0e0' }}>
                        Paste a Gala Studio JSON configuration below to restore a previous simulation state.
                    </p>
                    
                    <TextArea
                        labelText="JSON Configuration Input"
                        placeholder='Paste JSON here... e.g. { "potentialType": "kepler", ... }'
                        rows={10}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px' }}
                    />
                    
                    {importError && (
                        <InlineNotification
                            kind="error"
                            subtitle={importError}
                            title="Import Error"
                            hideCloseButton
                            style={{ marginTop: '1rem' }}
                        />
                    )}
                    
                    {importSuccess && (
                        <InlineNotification
                            kind="success"
                            subtitle="Redirecting to your simulation..."
                            title="Import Successful"
                            hideCloseButton
                            style={{ marginTop: '1rem' }}
                        />
                    )}

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            kind="primary" 
                            renderIcon={importSuccess ? Checkmark : (importing ? Loading : Save)} 
                            onClick={handleImport}
                            disabled={!importText.trim() || importing || importSuccess}
                        >
                            {importSuccess ? "Imported!" : "Save and Render"}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
