import React, { useEffect, useState } from 'react';
import { Modal, CodeSnippet, Loading, Button, Section } from '@carbon/react';
import { Share, Download, DocumentExport } from '@carbon/icons-react';
import { useStore } from '../store/simulationStore';

interface ExportModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ open, setOpen }) => {
    const exportPythonCode = useStore(state => state.exportPythonCode);
    const triggerGltfDownload = useStore(state => state.triggerGltfDownload);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleShareLink = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'view');
        navigator.clipboard.writeText(url.toString());
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };
    useEffect(() => {
        let mounted = true;
        if (open) {
            // Use an async function to avoid synchronous setState warning
            const fetchData = async () => {
                setLoading(true);
                try {
                    const script = await exportPythonCode();
                    if (mounted) {
                        setCode(script);
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
    }, [open, exportPythonCode]);

    return (
        <Modal
            open={open}
            onRequestClose={() => setOpen(false)}
            modalHeading="Export to Python"
            modalLabel="Reproducibility"
            primaryButtonText="Close"
            secondaryButtonText="Copy to Clipboard"
            onRequestSubmit={() => setOpen(false)}
            onSecondarySubmit={() => {
                navigator.clipboard.writeText(code);
            }}
            size="lg"
        >
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <Button 
                    kind="secondary" 
                    renderIcon={Share} 
                    onClick={handleShareLink}
                    size="md"
                >
                    {copySuccess ? "Link Copied!" : "Copy Shareable Link (Gala View)"}
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

            <Section style={{ borderTop: '1px solid #393939', paddingTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DocumentExport size={20} /> Python Reproducibility Script
                </h4>
                <p style={{ marginBottom: '1rem', fontSize: '14px', color: '#8d8d8d' }}>
                    Run this script in any environment with <code>gala</code> and <code>astropy</code> installed to reproduce this exact orbit.
                </p>
                {loading ? (
                    <div style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Loading withOverlay={false} />
                    </div>
                ) : (
                    <CodeSnippet type="multi" feedback="Copied to clipboard">
                        {code}
                    </CodeSnippet>
                )}
            </Section>
        </Modal>
    );
};
