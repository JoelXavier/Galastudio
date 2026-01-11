import React, { useEffect, useState } from 'react';
import { Modal, Button, Tile } from '@carbon/react';
import { TrashCan, Launch } from '@carbon/icons-react';
import { useStore } from '../store/simulationStore';

interface BuildLogModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

interface LogEntry {
    id: string;
    name: string;
    timestamp: string;
    data: string; // JSON string
}

export const BuildLogModal: React.FC<BuildLogModalProps> = ({ open, setOpen }) => {
    const importSimulation = useStore(state => state.importSimulation);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const loadLogs = () => {
        try {
            const data = JSON.parse(localStorage.getItem('gala_build_log') || '[]');
            setLogs(data);
        } catch (e) {
            console.error("Failed to load build log", e);
            setLogs([]);
        }
    };

    useEffect(() => {
        if (open) {
            loadLogs();
        }
    }, [open]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = logs.filter(log => log.id !== id);
        localStorage.setItem('gala_build_log', JSON.stringify(updated));
        setLogs(updated);
    };

    const handleLoad = async (data: string) => {
        const success = await importSimulation(data);
        if (success) {
            setOpen(false);
        }
    };

    return (
        <Modal
            open={open}
            onRequestClose={() => setOpen(false)}
            modalHeading="My Build Log"
            modalLabel="Local History"
            passiveModal
            size="md"
        >
            <div style={{ paddingBottom: '1rem' }}>
                {logs.length === 0 ? (
                    <div style={{ 
                        padding: '2rem', 
                        textAlign: 'center', 
                        color: '#8d8d8d', 
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '4px' 
                    }}>
                        No saved simulations found. Save a configuration to see it here.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {logs.map((log) => (
                            <Tile key={log.id} style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f4', marginBottom: '4px' }}>
                                            {log.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#8d8d8d', fontFamily: 'IBM Plex Mono, monospace' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            hasIconOnly
                                            renderIcon={TrashCan}
                                            iconDescription="Delete Entry"
                                            onClick={(e) => handleDelete(log.id, e)}
                                            style={{ color: '#da1e28' }}
                                        />
                                        <Button
                                            kind="tertiary"
                                            size="sm"
                                            renderIcon={Launch}
                                            onClick={() => handleLoad(log.data)}
                                        >
                                            Load
                                        </Button>
                                    </div>
                                </div>
                            </Tile>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
